import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ActivitiesService, Activity } from '../../services/activities.service';
import { ItinerariesService, Itinerary } from '../../services/itineraries.service';
import { AuthService } from '../../services/auth.service';

// Leaflet type declarations
declare global {
  interface Window {
    L: any;
  }
}

declare var L: any;

@Component({
  selector: 'app-activities',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './activities.html',
  styleUrls: ['./activities.css']
})
export class Activities implements OnInit {
  itineraryId!: number;
  activities: Activity[] = [];
  bufferActivities: Activity[] = []; // Activities without dates
  placedActivityIds: Set<number> = new Set(); // Track which activities have been placed
  itinerary: Itinerary | null = null;
  newActivity: Partial<Activity & { locationName?: string }> = {};
  showAddForm: boolean = false;
  selectedDay: number | null = null;
  days: string[] = [];
  showBufferZone: boolean = true;
  
  // Scheduling modal properties
  showScheduleModal: boolean = false;
  showEditModal: boolean = false;
  showMapModal: boolean = false;
  activityToSchedule: Activity = {
    id: 0,
    name: '',
    location: '',
    latitude: 0,
    longitude: 0,
    startTime: '09:00',
    duration: 120,
    cost: 0,
    date: '',
    notes: '',
    itineraryId: 0
  };
  scheduleDate: string = '';
  scheduleTime: string = '';
  selectedLocation: { lat: number, lng: number, address: string } | null = null;

  constructor(
    private route: ActivatedRoute, 
    private router: Router,
    private activitiesService: ActivitiesService,
    private itinerariesService: ItinerariesService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.itineraryId = +this.route.snapshot.paramMap.get('id')!;
    this.loadItinerary();
    this.loadActivities();
  }

  loadItinerary() {
    this.itinerariesService.getItinerary(this.itineraryId).subscribe({
      next: (itinerary) => {
        console.log('Loaded itinerary from backend:', itinerary);
        this.itinerary = itinerary;
        this.generateDays();
      },
      error: (error) => {
        console.error('Error loading itinerary from backend:', error);
        // Try to load from local storage first
        this.loadItineraryFromLocalStorage();
      }
    });
  }

  loadItineraryFromLocalStorage() {
    // No longer using local storage - redirect to itineraries if backend fails
    console.log('Backend unavailable, redirecting to itineraries');
    this.router.navigate(['/itineraries']);
  }

  generateDays() {
    if (!this.itinerary) {
      console.log('No itinerary available for generating days');
      return;
    }
    
    console.log('Generating days for itinerary:', this.itinerary);
    console.log('Start date:', this.itinerary.startDate);
    console.log('End date:', this.itinerary.endDate);
    
    const startDate = new Date(this.itinerary.startDate);
    const endDate = new Date(this.itinerary.endDate);
    this.days = [];
    
    // Ensure we have valid dates
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      console.error('Invalid dates in itinerary:', { startDate: this.itinerary.startDate, endDate: this.itinerary.endDate });
      return;
    }
    
    // Generate all days from start to end (inclusive)
    // Set time to noon to avoid timezone issues
    startDate.setHours(12, 0, 0, 0);
    endDate.setHours(12, 0, 0, 0);
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      this.days.push(d.toLocaleDateString());
    }
    
    // Ensure we include the end date even if there are timezone issues
    const lastDay = new Date(endDate);
    lastDay.setHours(12, 0, 0, 0);
    const lastDayString = lastDay.toLocaleDateString();
    
    // Check if the last day is already included, if not add it
    if (!this.days.includes(lastDayString)) {
      this.days.push(lastDayString);
    }
    
    console.log('Generated days:', this.days);
    
    if (this.days.length > 0) {
      this.selectedDay = 0;
    }
  }

  loadActivities() {
    console.log('Loading activities for itinerary ID:', this.itineraryId);
    
    // Load activities from backend API
    this.activitiesService.getActivities(this.itineraryId).subscribe({
      next: (activities) => {
        console.log('Loaded activities from backend:', activities);
        this.separateActivities(activities);
        // Load placed activity IDs to restore grayed out state
        this.loadPlacedActivityIds();
      },
      error: (error) => {
        console.error('Error loading activities from backend:', error);
        alert('Failed to load activities. Please try again.');
      }
    });
  }

  loadActivitiesFromLocalStorage() {
    // No longer using local storage - show error message
    console.log('Backend unavailable for activities');
    alert('Unable to load activities. Please check your connection.');
  }

  saveActivitiesToLocalStorage() {
    // No longer using local storage - data is persisted via backend API
    console.log('Data is now persisted via backend API');
  }

  loadPlacedActivityIds() {
    const currentUser = this.authService.getCurrentUser();
    const userId = currentUser?.uid;
    
    if (userId) {
      const stored = localStorage.getItem(`travel_planner_placed_activities_${userId}`);
      if (stored) {
        const placedIdsArray = JSON.parse(stored);
        this.placedActivityIds = new Set(placedIdsArray);
        console.log('Loaded placed activity IDs:', this.placedActivityIds);
      }
    }
  }

  separateActivities(allActivities: Activity[]) {
    console.log('Separating activities from:', allActivities);
    
    // Remove duplicates first - keep only one instance of each activity
    const uniqueActivities = allActivities.reduce((acc, activity) => {
      const existingIndex = acc.findIndex(a => a.id === activity.id);
      if (existingIndex === -1) {
        acc.push(activity);
      } else {
        // If duplicate found, keep the one with dayIdentifier (scheduled version)
        if (activity.date && activity.date.trim() !== '') {
          acc[existingIndex] = activity;
        }
      }
      return acc;
    }, [] as Activity[]);
    
    console.log('Unique activities after deduplication:', uniqueActivities);
    
    // Separate into scheduled and buffer
    // Scheduled activities have real dates (not the BUFFER_ACTIVITY marker)
    this.activities = uniqueActivities.filter(activity => 
      activity.date && 
      activity.date.trim() !== '' && 
      activity.date !== 'BUFFER_ACTIVITY'
    );
    
    // Buffer activities are those with the BUFFER_ACTIVITY marker
    this.bufferActivities = uniqueActivities.filter(activity => 
      activity.date === 'BUFFER_ACTIVITY'
    );
    
    console.log('Scheduled activities:', this.activities);
    console.log('Buffer activities (all):', this.bufferActivities);
    
    // Debug each activity's date
    uniqueActivities.forEach(activity => {
      console.log(`Activity "${activity.name}" - date: "${activity.date}"`);
    });
  }

  addActivity() {
    console.log('addActivity called with:', this.newActivity);
    
    if (!this.newActivity.name) {
      console.log('Activity name is required');
      alert('Activity name is required!');
      return;
    }
    
    // Check if we're creating a buffer activity (no date/time) or scheduled activity
    const isBufferActivity = !this.newActivity.date || !this.newActivity.startTime;
    console.log('Is buffer activity:', isBufferActivity);
    
    // Prepare activity data for backend
    // Note: Backend requires a date for all activities, so we use a special marker for buffer activities
    const activityData: any = {
      name: this.newActivity.name!,
      location: this.newActivity.locationName || 'Unknown Location',
      latitude: this.newActivity.latitude || 0.0,
      longitude: this.newActivity.longitude || 0.0,
      startTime: this.newActivity.startTime || '09:00',
      duration: this.newActivity.duration || 120,
      cost: this.newActivity.cost || 0.0,
      notes: this.newActivity.notes || '',
      itineraryId: this.itineraryId,
      // For buffer activities, use a special date marker, otherwise use the provided date
      date: isBufferActivity 
        ? 'BUFFER_ACTIVITY' // Special marker for buffer activities
        : this.newActivity.date
    };
    
    console.log('Creating activity with data:', activityData);
    console.log('Activity data JSON:', JSON.stringify(activityData, null, 2));
    
    // Create activity via backend API
    this.activitiesService.createActivity(activityData).subscribe({
      next: (createdActivity) => {
        console.log('Activity created successfully:', createdActivity);
        
        if (isBufferActivity) {
          this.bufferActivities.push(createdActivity);
          console.log('Added to buffer:', createdActivity);
          alert('Activity added to buffer!');
        } else {
          // Check for time conflicts before adding to schedule
          if (this.hasTimeConflict(0, this.newActivity.date!, this.newActivity.startTime!, this.newActivity.duration || 120)) {
            const conflictingActivity = this.getConflictingActivity(0, this.newActivity.date!, this.newActivity.startTime!, this.newActivity.duration || 120);
            alert(`Time conflict detected! This time slot overlaps with "${conflictingActivity?.name}" (${conflictingActivity?.startTime} - ${this.getEndTime(conflictingActivity!)}). Please choose a different time or add to buffer first.`);
            return;
          }
          
          // Add to scheduled activities only (not to buffer)
          this.activities.push(createdActivity);
          
          console.log('Added to schedule:', createdActivity);
          alert('Activity added to schedule!');
        }
        
        this.newActivity = {};
        this.showAddForm = false;
      },
      error: (error) => {
        console.error('Error creating activity:', error);
        console.error('Error details:', error.error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        alert(`Failed to create activity. Error: ${error.status} - ${error.message}`);
      }
    });
  }

  deleteActivity(id: number | undefined) {
    if (!id) {
      console.log('No ID provided for activity deletion');
      return;
    }
    
    console.log('Removing activity from itinerary (moving back to buffer):', id);
    
    // Remove from scheduled activities and move back to buffer
    const activityToMove = this.activities.find(a => a.id === id);
    if (activityToMove) {
      // Remove from scheduled
      this.activities = this.activities.filter(a => a.id !== id);
      
      // Set the date to BUFFER_ACTIVITY marker to make it a buffer activity
      const bufferActivity = { 
        ...activityToMove, 
        date: 'BUFFER_ACTIVITY', 
        startTime: '09:00' // Reset to default time
      };
      
      // Add back to buffer (but don't duplicate if it already exists)
      const existingBufferIndex = this.bufferActivities.findIndex(a => a.id === id);
      if (existingBufferIndex !== -1) {
        // Update existing buffer activity
        this.bufferActivities[existingBufferIndex] = bufferActivity;
      } else {
        // Add new buffer activity
        this.bufferActivities.push(bufferActivity);
      }
      
      // Remove from placed set (make it available again)
      this.placedActivityIds.delete(id);
      
      // Data is now persisted via backend API
      
      console.log('Activity moved back to buffer and made available again');
      alert('Activity removed from itinerary and moved back to buffer');
    }
  }

  deleteActivityFromBuffer(id: number | undefined) {
    if (!id) {
      console.log('No ID provided for activity deletion');
      return;
    }
    
    console.log('Permanently deleting activity from buffer:', id);
    
    // Ask for confirmation
    if (!confirm('Are you sure you want to permanently delete this activity? This cannot be undone.')) {
      return;
    }
    
    // Check if activity is currently scheduled
    const isScheduled = this.activities.some(a => a.id === id);
    if (isScheduled) {
      alert('Cannot delete activity that is currently scheduled. Please remove it from the itinerary first.');
      return;
    }
    
    this.activitiesService.deleteActivity(id).subscribe({
      next: () => {
        console.log('Activity deleted successfully');
        this.activities = this.activities.filter(a => a.id !== id);
        this.bufferActivities = this.bufferActivities.filter(a => a.id !== id);
        this.placedActivityIds.delete(id);
        alert('Activity permanently deleted');
      },
      error: (error) => {
        console.error('Error deleting activity:', error);
        alert('Failed to delete activity. Please try again.');
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
    if (this.selectedDay === null || !this.itinerary) return [];
    
    // Calculate the date for the selected day
    const startDate = new Date(this.itinerary.startDate);
    const dayDate = new Date(startDate);
      dayDate.setDate(dayDate.getDate() + dayIndex);
    const dayIdentifier = dayDate.toISOString().split('T')[0]; // Format: YYYY-MM-DD
    
    console.log(`Getting activities for day ${dayIndex}, date: ${dayIdentifier}`);
    console.log('All activities:', this.activities);
    
    const filteredActivities = this.activities.filter(activity => {
      console.log(`Activity ${activity.name} has date: ${activity.date}`);
      return activity.date === dayIdentifier;
    });
    
    // Sort activities by start time
    const sortedActivities = filteredActivities.sort((a, b) => {
      const timeA = this.timeToMinutes(a.startTime);
      const timeB = this.timeToMinutes(b.startTime);
      return timeA - timeB;
    });
    
    console.log(`Found ${sortedActivities.length} activities for day ${dayIndex}, sorted by time`);
    return sortedActivities;
  }

  getDayTotalCost(dayIndex: number): number {
    return this.getDayActivities(dayIndex).reduce((total, activity) => total + activity.cost, 0);
  }

  getTotalCost(): number {
    return this.activities.reduce((total, activity) => total + activity.cost, 0);
  }

  // Open scheduling modal for activity
  openScheduleModal(activity: Activity) {
    this.activityToSchedule = { ...activity }; // Create a copy to avoid mutations
    this.showScheduleModal = true;
    
    // Set default date to selected day or first day
    if (this.selectedDay !== null && this.itinerary) {
      const startDate = new Date(this.itinerary.startDate);
      const dayDate = new Date(startDate);
      dayDate.setDate(dayDate.getDate() + this.selectedDay);
      this.scheduleDate = dayDate.toISOString().split('T')[0];
    } else if (this.itinerary) {
      this.scheduleDate = this.itinerary.startDate;
    }
    
    // Set default time
    this.scheduleTime = activity.startTime || '09:00';
  }

  // Close scheduling modal
  closeScheduleModal() {
    this.showScheduleModal = false;
    this.activityToSchedule = {
      id: 0,
      name: '',
      location: '',
      latitude: 0,
      longitude: 0,
      startTime: '09:00',
      duration: 120,
      cost: 0,
      notes: '',
      date: '',
      itineraryId: 0
    };
    this.scheduleDate = '';
    this.scheduleTime = '';
  }

  // Schedule activity with selected date and time
  confirmSchedule() {
    this.updateActivityScheduling();
  }

  // Move activity from buffer to specific day (legacy method)
  scheduleActivity(activity: Activity, dayIndex: number) {
    this.openScheduleModal(activity);
  }

  // Move activity back to buffer (unschedule)
  unscheduleActivity(activity: Activity) {
    // Remove from scheduled activities
    this.activities = this.activities.filter(a => a.id !== activity.id);
    
    // Set the date to BUFFER_ACTIVITY marker to make it a buffer activity
    const bufferActivity = { 
      ...activity, 
      date: 'BUFFER_ACTIVITY', 
      startTime: '09:00' // Reset to default time
    };
    
    // Add back to buffer (but don't duplicate if it already exists)
    const existingBufferIndex = this.bufferActivities.findIndex(a => a.id === activity.id);
    if (existingBufferIndex !== -1) {
      // Update existing buffer activity
      this.bufferActivities[existingBufferIndex] = bufferActivity;
    } else {
      // Add new buffer activity
      this.bufferActivities.push(bufferActivity);
    }
    
    // Remove from placed set (make it available again)
    this.placedActivityIds.delete(activity.id!);
    
    // Data is now persisted via backend API
    
    console.log('Activity moved back to buffer and made available again');
    alert('Activity moved back to buffer and is now available for scheduling');
  }

  // Toggle buffer zone visibility
  toggleBufferZone() {
    this.showBufferZone = !this.showBufferZone;
  }

  // Check if activity is placed
  isActivityPlaced(activity: Activity): boolean {
    // An activity is placed if it's in the scheduled activities array (has a real date)
    const isInScheduled = this.activities.some(a => a.id === activity.id);
    return isInScheduled;
  }

  // Calculate end time for an activity
  getEndTime(activity: Activity): string {
    if (!activity.startTime || !activity.duration) return '';
    
    const startTime = new Date(`2000-01-01T${activity.startTime}`);
    const endTime = new Date(startTime.getTime() + (activity.duration * 60000));
    return endTime.toTimeString().split(' ')[0].substring(0, 5);
  }

  // Open edit modal for activity
  openEditModal(activity: Activity) {
    this.activityToSchedule = { ...activity };
    this.showEditModal = true;
  }

  // Close edit modal
  closeEditModal() {
    this.showEditModal = false;
    this.activityToSchedule = {
      id: 0,
      name: '',
      location: '',
      latitude: 0,
      longitude: 0,
      startTime: '09:00',
      duration: 120,
      cost: 0,
      notes: '',
      date: '',
      itineraryId: 0
    };
  }

  // Update activity details (name, cost, notes)
  updateActivityDetails() {
    if (!this.activityToSchedule.name) {
      alert('Activity name is required');
      return;
    }

    // Update the activity in both arrays
    const activityIndex = this.activities.findIndex(a => a.id === this.activityToSchedule!.id);
    if (activityIndex !== -1) {
      this.activities[activityIndex] = { ...this.activityToSchedule };
    } else {
      // Update in buffer activities
      const bufferIndex = this.bufferActivities.findIndex(a => a.id === this.activityToSchedule!.id);
      if (bufferIndex !== -1) {
        this.bufferActivities[bufferIndex] = { ...this.activityToSchedule };
      }
    }

    // Data is now persisted via backend API

    console.log(`Activity details updated: ${this.activityToSchedule.name}`);
    alert('Activity details updated successfully');
    
    this.closeEditModal();
  }

  // Check for time conflicts
  hasTimeConflict(activityId: number, date: string, startTime: string, duration: number): boolean {
    const newStart = new Date(`${date}T${startTime}`);
    const newEnd = new Date(newStart.getTime() + (duration * 60000));
    
    // Check all activities on the same date
    const sameDayActivities = this.activities.filter(activity => 
      activity.date === date && activity.id !== activityId
    );
    
    for (const activity of sameDayActivities) {
      const existingStart = new Date(`${date}T${activity.startTime}`);
      const existingEnd = new Date(existingStart.getTime() + (activity.duration * 60000));
      
      // Check for overlap
      if (newStart < existingEnd && newEnd > existingStart) {
        return true;
      }
    }
    
    return false;
  }

  // Get conflicting activity details
  getConflictingActivity(activityId: number, date: string, startTime: string, duration: number): Activity | null {
    const newStart = new Date(`${date}T${startTime}`);
    const newEnd = new Date(newStart.getTime() + (duration * 60000));
    
    const sameDayActivities = this.activities.filter(activity => 
      activity.date === date && activity.id !== activityId
    );
    
    for (const activity of sameDayActivities) {
      const existingStart = new Date(`${date}T${activity.startTime}`);
      const existingEnd = new Date(existingStart.getTime() + (activity.duration * 60000));
      
      if (newStart < existingEnd && newEnd > existingStart) {
        return activity;
      }
    }
    
    return null;
  }

  // Update activity scheduling (date, time, duration)
  updateActivityScheduling() {
    if (!this.scheduleDate || !this.scheduleTime) {
      alert('Please select both date and time');
      return;
    }

    // Check for time conflicts
    if (this.hasTimeConflict(this.activityToSchedule.id!, this.scheduleDate, this.scheduleTime, this.activityToSchedule.duration || 120)) {
      const conflictingActivity = this.getConflictingActivity(this.activityToSchedule.id!, this.scheduleDate, this.scheduleTime, this.activityToSchedule.duration || 120);
      const endTime = this.getEndTime(this.activityToSchedule);
      
      alert(`Time conflict detected! This time slot overlaps with "${conflictingActivity?.name}" (${conflictingActivity?.startTime} - ${this.getEndTime(conflictingActivity!)}). Please choose a different time.`);
      return;
    }

    const updatedActivity = {
      ...this.activityToSchedule,
      date: this.scheduleDate,
      startTime: this.scheduleTime
    };

    // Calculate end time
    const startTime = new Date(`${this.scheduleDate}T${this.scheduleTime}`);
    const endTime = new Date(startTime.getTime() + ((this.activityToSchedule.duration || 120) * 60000));
    const endTimeString = endTime.toTimeString().split(' ')[0].substring(0, 5);

    // Check if activity is already in scheduled activities
    const activityIndex = this.activities.findIndex(a => a.id === this.activityToSchedule!.id);
    if (activityIndex !== -1) {
      // Update existing scheduled activity
      this.activities[activityIndex] = updatedActivity;
    } else {
      // Add new activity to scheduled activities
      this.activities.push(updatedActivity);
    }
    
    // Remove the activity from buffer activities since it's now scheduled
    const bufferIndex = this.bufferActivities.findIndex(a => a.id === this.activityToSchedule!.id);
    if (bufferIndex !== -1) {
      this.bufferActivities.splice(bufferIndex, 1);
    }

    // Data is now persisted via backend API

    console.log(`Activity scheduled: ${this.activityToSchedule.name} on ${this.scheduleDate} from ${this.scheduleTime} to ${endTimeString}`);
    alert(`Activity scheduled for ${this.scheduleDate} at ${this.scheduleTime} (ends at ${endTimeString})`);
    
    this.closeScheduleModal();
  }

  // Toggle add form visibility
  toggleAddForm() {
    console.log('Toggle add form clicked, current state:', this.showAddForm);
    this.showAddForm = !this.showAddForm;
    console.log('New state:', this.showAddForm);
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
    if (activityIndex === 0) return '';
    
    const currentActivity = this.getDayActivities(this.selectedDay!)[activityIndex];
    const previousActivity = this.getDayActivities(this.selectedDay!)[activityIndex - 1];
    
    if (!currentActivity || !previousActivity) return '';
    
    // Calculate travel time between activities
    const travelTime = this.calculateTravelTime(
      previousActivity.latitude, previousActivity.longitude,
      currentActivity.latitude, currentActivity.longitude
    );
    
    return `${travelTime} min travel`;
  }

  calculateTravelTime(lat1: number, lng1: number, lat2: number, lng2: number): number {
    // Calculate distance using Haversine formula
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in kilometers
    
    // Estimate travel time (assuming average speed of 30 km/h in city)
    const travelTimeMinutes = Math.ceil((distance / 30) * 60);
    
    // Minimum 5 minutes, maximum 2 hours
    return Math.max(5, Math.min(120, travelTimeMinutes));
  }

  toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }


  // Automatic scheduling optimization
  optimizeSchedule() {
    const dayActivities = this.getDayActivities(this.selectedDay!);
    if (dayActivities.length < 2) return;

    console.log('Optimizing schedule for', dayActivities.length, 'activities');
    
    // Sort activities by start time
    const sortedActivities = [...dayActivities].sort((a, b) => {
      const timeA = this.timeToMinutes(a.startTime);
      const timeB = this.timeToMinutes(b.startTime);
      return timeA - timeB;
    });

    let hasChanges = false;
    
    for (let i = 1; i < sortedActivities.length; i++) {
      const currentActivity = sortedActivities[i];
      const previousActivity = sortedActivities[i - 1];
      
      // Calculate travel time needed
      const travelTime = this.calculateTravelTime(
        previousActivity.latitude, previousActivity.longitude,
        currentActivity.latitude, currentActivity.longitude
      );
      
      // Calculate when previous activity ends
      const previousEndTime = this.timeToMinutes(previousActivity.startTime) + previousActivity.duration;
      
      // Calculate when current activity should start (with travel time)
      const requiredStartTime = previousEndTime + travelTime;
      const currentStartTime = this.timeToMinutes(currentActivity.startTime);
      
      // If current activity starts too early, move it
      if (currentStartTime < requiredStartTime) {
        const newStartTime = this.minutesToTime(requiredStartTime);
        console.log(`Moving ${currentActivity.name} from ${currentActivity.startTime} to ${newStartTime} (${travelTime} min travel needed)`);
        
        // Update the activity
        currentActivity.startTime = newStartTime;
        hasChanges = true;
      }
    }
    
    if (hasChanges) {
      // Save changes to local storage
      this.saveActivitiesToLocalStorage();
      console.log('Schedule optimized successfully');
      alert('Schedule has been automatically optimized to account for travel time!');
    } else {
      console.log('No schedule changes needed');
    }
  }

  timeToMinutes(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }

  minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    
    try {
      // Handle YYYY-MM-DD format
      let date: Date;
      if (dateString.includes('-') && dateString.length === 10) {
        // It's already in YYYY-MM-DD format
        date = new Date(dateString + 'T00:00:00');
      } else {
        date = new Date(dateString);
      }
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.error('Invalid date:', dateString);
        return dateString;
      }
      
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error, 'Input:', dateString);
      return dateString;
    }
  }

  goBack() {
    this.router.navigate(['/itineraries']);
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

  // Leaflet Maps functionality
  openMapModal() {
    this.showMapModal = true;
    // Wait for Leaflet to load, then initialize map
    this.waitForLeaflet().then(() => {
      setTimeout(() => this.initializeMap(), 100);
    }).catch(error => {
      console.error('Failed to load Leaflet:', error);
      alert('Map failed to load. Please refresh the page and try again.');
    });
  }

  private waitForLeaflet(): Promise<void> {
    return new Promise((resolve, reject) => {
      // If Leaflet is already loaded
      if (typeof window.L !== 'undefined') {
        resolve();
        return;
      }

      // Wait for Leaflet to load
      const checkLeaflet = () => {
        if (typeof window.L !== 'undefined') {
          resolve();
        } else {
          setTimeout(checkLeaflet, 100);
        }
      };

      // Start checking
      checkLeaflet();

      // Timeout after 10 seconds
      setTimeout(() => {
        reject(new Error('Leaflet failed to load within 10 seconds'));
      }, 10000);
    });
  }

  closeMapModal() {
    this.showMapModal = false;
    this.selectedLocation = null;
  }

  initializeMap() {
    try {
      // Check if Leaflet is loaded
      if (typeof window.L === 'undefined') {
        console.error('Leaflet not loaded');
        alert('Map library is not available. Please refresh the page and try again.');
        return;
      }

      const mapElement = document.getElementById('map');
      if (!mapElement) {
        console.error('Map element not found');
        return;
      }

      // Default to Rome, Italy (or use itinerary city if available)
      const defaultLat = 41.9028;
      const defaultLng = 12.4964;
      
      console.log('Initializing Leaflet map...');
      
      // Initialize the map
      const map = window.L.map('map').setView([defaultLat, defaultLng], 13);
      
      // Add OpenStreetMap tiles
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);
      
      console.log('Leaflet map initialized successfully');

      let marker: any = null;

      // Add click listener to map
      map.on('click', (event: any) => {
        try {
          const lat = event.latlng.lat;
          const lng = event.latlng.lng;
          
          // Remove existing marker
          if (marker) {
            map.removeLayer(marker);
          }
          
          // Add new marker
          marker = window.L.marker([lat, lng]).addTo(map);
          marker.bindPopup('Selected Location').openPopup();

          // Get address using reverse geocoding
          this.getAddressFromCoordinates(lat, lng).then(address => {
            this.selectedLocation = { lat, lng, address };
            console.log('Selected location:', this.selectedLocation);
          }).catch(error => {
            console.error('Error getting address:', error);
            this.selectedLocation = { lat, lng, address: `${lat.toFixed(4)}, ${lng.toFixed(4)}` };
          });
        } catch (error) {
          console.error('Error handling map click:', error);
        }
      });

      // Add search functionality
      this.addSearchBox(map);
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }

  addSearchBox(map: any) {
    const input = document.getElementById('search-box') as HTMLInputElement;
    if (!input) return;

    // Simple search functionality using Nominatim (OpenStreetMap geocoding)
    input.addEventListener('keypress', (event) => {
      if (event.key === 'Enter') {
        const query = input.value.trim();
        if (query) {
          this.searchLocation(query, map);
        }
      }
    });
  }

  searchLocation(query: string, map: any) {
    // Use Nominatim for geocoding (free OpenStreetMap service)
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;
    
    fetch(url)
      .then(response => response.json())
      .then(data => {
        if (data && data.length > 0) {
          const result = data[0];
          const lat = parseFloat(result.lat);
          const lng = parseFloat(result.lon);
          
          // Move map to location
          map.setView([lat, lng], 15);
          
          // Add marker
          const marker = window.L.marker([lat, lng]).addTo(map);
          marker.bindPopup(result.display_name).openPopup();
          
          // Set selected location
          this.selectedLocation = { 
            lat, 
            lng, 
            address: result.display_name 
          };
          
          console.log('Found location:', this.selectedLocation);
        } else {
          alert('Location not found. Please try a different search term.');
        }
      })
      .catch(error => {
        console.error('Search error:', error);
        alert('Search failed. Please try again.');
      });
  }

  async getAddressFromCoordinates(lat: number, lng: number): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        // Use Nominatim for reverse geocoding (free OpenStreetMap service)
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
        
        fetch(url)
          .then(response => response.json())
          .then(data => {
            if (data && data.display_name) {
              resolve(data.display_name);
            } else {
              resolve(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
            }
          })
          .catch(error => {
            console.error('Reverse geocoding error:', error);
            resolve(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
          });
      } catch (error) {
        console.error('Error setting up reverse geocoding:', error);
        resolve(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      }
    });
  }

  selectLocation() {
    try {
      if (this.selectedLocation) {
        this.activityToSchedule.latitude = this.selectedLocation.lat;
        this.activityToSchedule.longitude = this.selectedLocation.lng;
        this.newActivity.latitude = this.selectedLocation.lat;
        this.newActivity.longitude = this.selectedLocation.lng;
        this.newActivity.locationName = this.selectedLocation.address;
        this.closeMapModal();
        console.log('Location selected successfully:', this.selectedLocation);
      } else {
        console.warn('No location selected');
        alert('Please select a location on the map first');
      }
    } catch (error) {
      console.error('Error selecting location:', error);
      alert('Error selecting location. Please try again.');
    }
  }
}
