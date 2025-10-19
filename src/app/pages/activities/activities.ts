import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ActivitiesService, Activity } from '../../services/activities.service';
import { ItinerariesService, Itinerary } from '../../services/itineraries.service';
import { LocationPickerComponent } from '../../components/location-picker/location-picker.component';

@Component({
  selector: 'app-activities',
  standalone: true,
  imports: [CommonModule, FormsModule, LocationPickerComponent],
  templateUrl: './activities.html',
  styleUrls: ['./activities.css']
})
export class Activities implements OnInit {
  itineraryId!: number;
  activities: Activity[] = [];
  itinerary: Itinerary | null = null;
  newActivity: Partial<Activity> = {};
  showAddForm: boolean = false;
  showLocationPicker: boolean = false;
  selectedDay: number | null = null;
  days: string[] = [];

  constructor(
    private route: ActivatedRoute, 
    private router: Router,
    private activitiesService: ActivitiesService,
    private itinerariesService: ItinerariesService
  ) {}

  ngOnInit() {
    this.itineraryId = +this.route.snapshot.paramMap.get('id')!;
    this.loadItinerary();
    this.loadActivities();
  }

  loadItinerary() {
    this.itinerariesService.getItinerary(this.itineraryId).subscribe({
      next: (itinerary) => {
        this.itinerary = itinerary;
        this.generateDays();
      },
      error: (error) => {
        console.error('Error loading itinerary:', error);
        // Fallback to mock data for development
        this.itinerary = {
          id: this.itineraryId,
          name: 'Sample Trip',
          location: 'Rome, Italy',
          startDate: '2024-06-01',
          endDate: '2024-06-05'
        };
        this.generateDays();
      }
    });
  }

  generateDays() {
    if (!this.itinerary) return;
    
    const startDate = new Date(this.itinerary.startDate);
    const endDate = new Date(this.itinerary.endDate);
    this.days = [];
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      this.days.push(d.toLocaleDateString());
    }
    
    if (this.days.length > 0) {
      this.selectedDay = 0;
    }
  }

  loadActivities() {
    this.activitiesService.getActivities(this.itineraryId).subscribe({
      next: (activities) => this.activities = activities,
      error: (error) => console.error('Error loading activities:', error)
    });
  }

  addActivity() {
    if (!this.newActivity.name || !this.newActivity.location || !this.newActivity.startTime || !this.newActivity.date) return;
    
    const activityData: Omit<Activity, 'id'> = {
      name: this.newActivity.name!,
      location: this.newActivity.location!,
      startTime: this.newActivity.startTime!,
      duration: this.newActivity.duration || 2,
      cost: this.newActivity.cost || 0,
      date: this.newActivity.date!,
      latitude: this.newActivity.latitude,
      longitude: this.newActivity.longitude,
      notes: this.newActivity.notes,
      itineraryId: this.itineraryId
    };
    
    this.activitiesService.createActivity(activityData).subscribe({
      next: (createdActivity) => {
        this.activities.push(createdActivity);
        this.newActivity = {};
        this.showAddForm = false;
      },
      error: (error) => console.error('Error creating activity:', error)
    });
  }

  deleteActivity(id: number | undefined) {
    if (!id) {
      console.log('No ID provided for activity deletion');
      return;
    }
    
    console.log('Deleting activity with ID:', id);
    
    // Ask for confirmation
    if (!confirm('Are you sure you want to delete this activity?')) {
      return;
    }
    
    this.activitiesService.deleteActivity(id).subscribe({
      next: () => {
        console.log('Activity deleted successfully');
        this.activities = this.activities.filter(a => a.id !== id);
      },
      error: (error) => {
        console.error('Error deleting activity:', error);
        // For now, remove from local array even if backend fails
        this.activities = this.activities.filter(a => a.id !== id);
        console.log('Removed activity from local array for testing');
      }
    });
  }

  editActivity(activity: Activity) {
    console.log('Editing activity:', activity);
    
    // For now, let's implement a simple inline edit
    const newName = prompt('Enter new activity name:', activity.name);
    if (newName && newName.trim() !== '') {
      const updatedActivity = { ...activity, name: newName.trim() };
      
      this.activitiesService.updateActivity(activity.id!, updatedActivity).subscribe({
        next: (result) => {
          console.log('Activity updated successfully:', result);
          const index = this.activities.findIndex(a => a.id === activity.id);
          if (index !== -1) {
            this.activities[index] = result;
          }
        },
        error: (error) => {
          console.error('Error updating activity:', error);
          // For now, update locally even if backend fails
          const index = this.activities.findIndex(a => a.id === activity.id);
          if (index !== -1) {
            this.activities[index] = updatedActivity;
          }
          console.log('Updated activity locally for testing');
        }
      });
    }
  }

  selectDay(dayIndex: number) {
    this.selectedDay = dayIndex;
  }

  getDayActivities(dayIndex: number): Activity[] {
    if (this.selectedDay === null) return [];
    return this.activities.filter(activity => {
      const activityDate = new Date(activity.date);
      const dayDate = new Date(this.itinerary!.startDate);
      dayDate.setDate(dayDate.getDate() + dayIndex);
      return activityDate.toDateString() === dayDate.toDateString();
    });
  }

  getDayTotalCost(dayIndex: number): number {
    return this.getDayActivities(dayIndex).reduce((total, activity) => total + activity.cost, 0);
  }

  getTotalCost(): number {
    return this.activities.reduce((total, activity) => total + activity.cost, 0);
  }

  loadBudgetData() {
    this.activitiesService.getTotalCost(this.itineraryId).subscribe({
      next: (totalCost) => {
        // Update total cost display
        console.log('Total cost:', totalCost);
      },
      error: (error) => console.error('Error loading budget data:', error)
    });
  }

  getTravelTime(activityIndex: number): string {
    // This would integrate with Google Maps API
    return '15 min'; // Placeholder
  }

  goBack() {
    this.router.navigate(['/itineraries']);
  }

  openLocationPicker() {
    this.showLocationPicker = true;
  }

  closeLocationPicker() {
    this.showLocationPicker = false;
  }

  onLocationSelected(location: {lat: number, lng: number, address: string}) {
    this.newActivity.latitude = location.lat;
    this.newActivity.longitude = location.lng;
    this.newActivity.location = location.address;
    this.showLocationPicker = false;
  }
}
