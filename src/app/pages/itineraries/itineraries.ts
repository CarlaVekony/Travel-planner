import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ItinerariesService, Itinerary } from '../../services/itineraries.service';
import { LocalStorageService } from '../../services/local-storage.service';
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
    private localStorageService: LocalStorageService,
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

    // Try backend first for user-specific data
    this.itinerariesService.getItineraries().subscribe({
      next: (itineraries) => {
        console.log('Loaded itineraries from backend:', itineraries);
        this.itineraries = itineraries;
        // Save to user-specific local storage for persistence
        this.localStorageService.saveItineraries(itineraries, currentUser.uid);
      },
      error: (error) => {
        console.error('Error loading itineraries from backend:', error);
        // Fallback to user-specific local storage if backend fails
        const localItineraries = this.localStorageService.getItineraries(currentUser.uid);
        console.log('Falling back to user-specific local storage:', localItineraries);
        this.itineraries = localItineraries;
      }
    });
  }

  addItinerary() {
    console.log('addItinerary called with:', this.newItinerary);
    
    if (!this.newItinerary.title || !this.newItinerary.country || !this.newItinerary.city || !this.newItinerary.startDate || !this.newItinerary.endDate) {
      console.log('Validation failed - missing required fields');
      return;
    }
    
    // Create itinerary with unique ID
    const newItinerary: Itinerary = {
      id: Date.now(),
      title: this.newItinerary.title!,
      country: this.newItinerary.country!,
      city: this.newItinerary.city!,
      startDate: this.newItinerary.startDate!,
      endDate: this.newItinerary.endDate!,
      totalCost: this.newItinerary.totalCost || 0,
      notes: this.newItinerary.notes
    };
    
    console.log('Creating itinerary...');
    
    // Try backend first
    this.itinerariesService.createItinerary(this.newItinerary as Omit<Itinerary, 'id'>).subscribe({
      next: (createdItinerary) => {
        console.log('Itinerary created successfully in backend:', createdItinerary);
        this.itineraries.push(createdItinerary);
        const currentUser = this.authService.getCurrentUser();
        this.localStorageService.addItinerary(createdItinerary, currentUser?.uid);
        this.newItinerary = {};
        this.showAddForm = false;
      },
      error: (error) => {
        console.error('Error creating itinerary in backend:', error);
        // Add to local storage and array
        this.itineraries.push(newItinerary);
        const currentUser = this.authService.getCurrentUser();
        this.localStorageService.addItinerary(newItinerary, currentUser?.uid);
        this.newItinerary = {};
        this.showAddForm = false;
        console.log('Added itinerary to user-specific local storage for persistence');
      }
    });
  }

  deleteItinerary(id: number | undefined) {
    if (!id) {
      console.log('No ID provided for deletion');
      return;
    }
    
    console.log('Deleting itinerary with ID:', id);
    
    // Ask for confirmation
    if (!confirm('Are you sure you want to delete this itinerary?')) {
      return;
    }
    
    // Remove from local storage first
    const currentUser = this.authService.getCurrentUser();
    this.localStorageService.deleteItinerary(id, currentUser?.uid);
    this.itineraries = this.itineraries.filter(i => i.id !== id);
    
    // Try backend
    this.itinerariesService.deleteItinerary(id).subscribe({
      next: () => {
        console.log('Itinerary deleted successfully from backend');
      },
      error: (error) => {
        console.error('Error deleting itinerary from backend:', error);
        console.log('Itinerary deleted from local storage');
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
    
    // Update local storage
    const currentUser = this.authService.getCurrentUser();
    this.localStorageService.updateItinerary(this.editingItinerary, currentUser?.uid);
    
    // Update local array
    const index = this.itineraries.findIndex(i => i.id === this.editingItinerary!.id);
    if (index !== -1) {
      this.itineraries[index] = this.editingItinerary;
    }
    
    // Try backend
    this.itinerariesService.updateItinerary(this.editingItinerary.id!, this.editingItinerary).subscribe({
      next: (result) => {
        console.log('Itinerary updated successfully in backend:', result);
      },
      error: (error) => {
        console.error('Error updating itinerary in backend:', error);
        console.log('Itinerary updated in local storage');
      }
    });
    
    this.cancelEdit();
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
