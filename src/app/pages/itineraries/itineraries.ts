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

    console.log('Loading itineraries for authenticated user:', currentUser.uid);

    // Load itineraries from backend API
    this.itinerariesService.getItineraries().subscribe({
      next: (itineraries) => {
        console.log('Loaded itineraries from backend:', itineraries);
        this.itineraries = itineraries;
      },
      error: (error) => {
        console.error('Error loading itineraries from backend:', error);
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
    
    console.log('Permanently deleting itinerary:', id);
    
    // Ask for confirmation
    if (!confirm('Are you sure you want to permanently delete this itinerary? This will also delete all associated activities and cannot be undone.')) {
      return;
    }
    
    this.itinerariesService.deleteItinerary(id).subscribe({
      next: () => {
        console.log('Itinerary deleted successfully');
        this.itineraries = this.itineraries.filter(i => i.id !== id);
        alert('Itinerary permanently deleted');
      },
      error: (error) => {
        console.error('Error deleting itinerary:', error);
        alert('Failed to delete itinerary. Please try again.');
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
