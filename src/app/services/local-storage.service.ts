import { Injectable } from '@angular/core';
import { Itinerary } from './itineraries.service';
import { Activity } from './activities.service';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  private readonly ITINERARIES_KEY = 'travel_planner_itineraries';
  private readonly ACTIVITIES_KEY = 'travel_planner_activities';

  // Itineraries
  saveItineraries(itineraries: Itinerary[]): void {
    localStorage.setItem(this.ITINERARIES_KEY, JSON.stringify(itineraries));
  }

  getItineraries(): Itinerary[] {
    const stored = localStorage.getItem(this.ITINERARIES_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  addItinerary(itinerary: Itinerary): void {
    const itineraries = this.getItineraries();
    itineraries.push(itinerary);
    this.saveItineraries(itineraries);
  }

  updateItinerary(updatedItinerary: Itinerary): void {
    const itineraries = this.getItineraries();
    const index = itineraries.findIndex(i => i.id === updatedItinerary.id);
    if (index !== -1) {
      itineraries[index] = updatedItinerary;
      this.saveItineraries(itineraries);
    }
  }

  deleteItinerary(id: number): void {
    const itineraries = this.getItineraries();
    const filtered = itineraries.filter(i => i.id !== id);
    this.saveItineraries(filtered);
  }

  // Activities
  saveActivities(activities: Activity[]): void {
    localStorage.setItem(this.ACTIVITIES_KEY, JSON.stringify(activities));
  }

  getActivities(): Activity[] {
    const stored = localStorage.getItem(this.ACTIVITIES_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  getActivitiesByItineraryId(itineraryId: number): Activity[] {
    const activities = this.getActivities();
    return activities.filter(a => a.itineraryId === itineraryId);
  }

  addActivity(activity: Activity): void {
    const activities = this.getActivities();
    activities.push(activity);
    this.saveActivities(activities);
  }

  updateActivity(updatedActivity: Activity): void {
    const activities = this.getActivities();
    const index = activities.findIndex(a => a.id === updatedActivity.id);
    if (index !== -1) {
      activities[index] = updatedActivity;
      this.saveActivities(activities);
    }
  }

  deleteActivity(id: number): void {
    const activities = this.getActivities();
    const filtered = activities.filter(a => a.id !== id);
    this.saveActivities(filtered);
  }
}
