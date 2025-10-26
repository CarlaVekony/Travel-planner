import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ItinerariesService, Itinerary } from '../../services/itineraries.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-itineraries',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './itineraries.html',
  styleUrls: ['./itineraries.css']
})
export class Itineraries implements OnInit {
  itineraries: Itinerary[] = [];
  newItinerary: Partial<Itinerary> = {};
  showAddForm: boolean = false;
  editingItinerary: Itinerary | null = null;
  showEditForm: boolean = false;

  constructor(
    private itinerariesService: ItinerariesService, 
    private router: Router,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    await this.loadItineraries();
  }

  async loadItineraries() {
    // Check if user is authenticated first
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      console.log('No user authenticated, redirecting to login');
      this.router.navigate(['/login']);
      return;
    }

    console.log('=== LOADING ITINERARIES DEBUG ===');
    console.log('Loading itineraries for authenticated user:', currentUser.uid);
    console.log('Firebase user details:', currentUser);
    
    // Check for any cached data in localStorage
    console.log('Checking for cached data...');
    
    // Check all possible localStorage keys that might contain itinerary data
    const possibleKeys = [
      'travel_planner_itineraries_' + currentUser.uid,
      'travel_planner_itineraries_default',
      'itineraries',
      'travel_planner_itineraries',
      'vacation_planner_itineraries',
      'vacation_planner_itineraries_' + currentUser.uid
    ];
    
    let foundCachedData = false;
    possibleKeys.forEach(key => {
      const cachedData = localStorage.getItem(key);
      if (cachedData) {
        console.log(`Found cached data in key "${key}":`, JSON.parse(cachedData));
        foundCachedData = true;
      }
    });
    
    if (foundCachedData) {
      console.log('Clearing all cached data to prevent phantom data issues...');
      // Clear all possible cached data
      possibleKeys.forEach(key => {
        localStorage.removeItem(key);
      });
      console.log('All cached data cleared');
    } else {
      console.log('No cached itineraries found in localStorage');
    }
    
    // Also check for any other localStorage keys that might contain data
    console.log('All localStorage keys:', Object.keys(localStorage));

    // Load itineraries from backend API
    this.itinerariesService.getItineraries().subscribe({
      next: (itineraries) => {
        console.log('=== ITINERARIES LOADED SUCCESSFULLY ===');
        console.log('Loaded itineraries from backend:', itineraries);
        console.log('Number of itineraries:', itineraries.length);
        console.log('Itinerary details:', itineraries.map(i => ({ id: i.id, name: i.name, userId: i.userId })));
        this.itineraries = itineraries;
      },
      error: (error) => {
        console.error('=== ERROR LOADING ITINERARIES ===');
        console.error('Error loading itineraries from backend:', error);
        console.error('Error details:', error.error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        // Show error message to user
        alert('Failed to load itineraries. Please try again.');
      }
    });
  }

  addItinerary() {
    console.log('addItinerary called with:', this.newItinerary);
    
    if (!this.newItinerary.name || !this.newItinerary.location || !this.newItinerary.startDate || !this.newItinerary.endDate) {
      console.log('Validation failed - missing required fields');
      return;
    }
    
    // Create itinerary data for backend
    const itineraryData: Omit<Itinerary, 'id'> = {
      name: this.newItinerary.name!,
      location: this.newItinerary.location!,
      startDate: this.newItinerary.startDate!,
      endDate: this.newItinerary.endDate!,
      notes: this.newItinerary.notes
    };
    
    console.log('Creating itinerary with data:', itineraryData);
    console.log('Current user:', this.authService.getCurrentUser());
    console.log('Current user ID:', this.authService.getCurrentUserId());
    
    // Create itinerary via backend API
    this.itinerariesService.createItinerary(itineraryData).subscribe({
      next: (createdItinerary) => {
        console.log('Itinerary created successfully in backend:', createdItinerary);
        this.itineraries.push(createdItinerary);
        this.newItinerary = {};
        this.showAddForm = false;
      },
      error: (error) => {
        console.error('Error creating itinerary in backend:', error);
        console.error('Error details:', error.error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        alert(`Failed to create itinerary. Error: ${error.status} - ${error.message}`);
      }
    });
  }

  deleteItinerary(id: number | undefined) {
    if (!id) {
      console.log('No ID provided for deletion');
      return;
    }
    
    console.log('=== ITINERARY DELETION DEBUG ===');
    console.log('Attempting to delete itinerary with ID:', id);
    console.log('Current user:', this.authService.getCurrentUser());
    console.log('Current user ID:', this.authService.getCurrentUserId());
    console.log('Available itineraries:', this.itineraries);
    
    // Ask for confirmation
    if (!confirm('Are you sure you want to permanently delete this itinerary? This will also delete all associated activities and cannot be undone.')) {
      return;
    }
    
    console.log('=== DELETION REQUEST DEBUG ===');
    console.log('Attempting to delete itinerary with ID:', id);
    console.log('Current user from auth service:', this.authService.getCurrentUser());
    console.log('Current user ID from auth service:', this.authService.getCurrentUserId());
    
    this.itinerariesService.deleteItinerary(id).subscribe({
      next: () => {
        console.log('Itinerary deleted successfully');
        this.itineraries = this.itineraries.filter(i => i.id !== id);
        alert('Itinerary permanently deleted');
      },
      error: (error) => {
        console.error('=== ITINERARY DELETION ERROR ===');
        console.error('Error object:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        console.error('Error details:', error.error);
        console.error('Error URL:', error.url);
        console.error('Full error response:', JSON.stringify(error, null, 2));
        
        // Handle specific error cases
        if (error.status === 400) {
          console.log('Itinerary not found in backend database - removing from frontend list');
          // Remove the itinerary from the frontend list since it doesn't exist in backend
          this.itineraries = this.itineraries.filter(i => i.id !== id);
          alert('Itinerary was not found in the database and has been removed from the list.');
        } else {
          alert(`Failed to delete itinerary. Error: ${error.status} - ${error.message}. Check console for details.`);
        }
      }
    });
  }

  updateItinerary(itinerary: Itinerary) {
    console.log('Starting edit for itinerary:', itinerary);
    this.editingItinerary = { ...itinerary };
    this.showEditForm = true;
  }

  saveEdit() {
    if (!this.editingItinerary) return;
    
    console.log('Saving edited itinerary:', this.editingItinerary);
    
    // Update via backend API
    this.itinerariesService.updateItinerary(this.editingItinerary.id!, this.editingItinerary).subscribe({
      next: (result) => {
        console.log('Itinerary updated successfully in backend:', result);
        console.log('Result type:', typeof result);
        console.log('Result keys:', Object.keys(result));
        
        // Update local array with the result from backend
        const index = this.itineraries.findIndex(i => i.id === this.editingItinerary!.id);
        if (index !== -1) {
          // Create a new array to trigger Angular change detection
          this.itineraries = [...this.itineraries];
          this.itineraries[index] = result;
          console.log('Local array updated with:', result);
          console.log('Updated itineraries array:', this.itineraries);
          console.log('Updated itinerary at index', index, ':', this.itineraries[index]);
        } else {
          console.error('Could not find itinerary to update in local array');
          console.log('Available itinerary IDs:', this.itineraries.map(i => i.id));
          console.log('Looking for ID:', this.editingItinerary?.id);
        }
        // Close edit form only after successful update
        this.cancelEdit();
      },
      error: (error) => {
        console.error('Error updating itinerary in backend:', error);
        alert('Failed to update itinerary. Please try again.');
        // Don't close edit form on error so user can try again
      }
    });
  }

  cancelEdit() {
    this.editingItinerary = null;
    this.showEditForm = false;
  }

  openItinerary(itinerary: Itinerary) {
    this.router.navigate([`/itineraries/${itinerary.id}/activities`]);
  }

  async logout() {
    try {
      await this.authService.logout();
      // Redirect to home page after logout
      this.router.navigate(['/']);
    } catch (error) {
      console.error('Logout error:', error);
      // Still redirect even if logout fails
      this.router.navigate(['/']);
    }
  }
}
