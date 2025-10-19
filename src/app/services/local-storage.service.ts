import { Injectable } from '@angular/core';
import { Itinerary } from './itineraries.service';
import { Activity } from './activities.service';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  private readonly ITINERARIES_KEY_PREFIX = 'travel_planner_itineraries_';
  private readonly ACTIVITIES_KEY_PREFIX = 'travel_planner_activities_';

  // Itineraries
  saveItineraries(itineraries: Itinerary[], userId?: string): void {
    const key = userId ? `${this.ITINERARIES_KEY_PREFIX}${userId}` : this.ITINERARIES_KEY_PREFIX + 'default';
    localStorage.setItem(key, JSON.stringify(itineraries));
  }

  getItineraries(userId?: string): Itinerary[] {
    const key = userId ? `${this.ITINERARIES_KEY_PREFIX}${userId}` : this.ITINERARIES_KEY_PREFIX + 'default';
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  }

  addItinerary(itinerary: Itinerary, userId?: string): void {
    const itineraries = this.getItineraries(userId);
    itineraries.push(itinerary);
    this.saveItineraries(itineraries, userId);
  }

  updateItinerary(updatedItinerary: Itinerary, userId?: string): void {
    const itineraries = this.getItineraries(userId);
    const index = itineraries.findIndex(i => i.id === updatedItinerary.id);
    if (index !== -1) {
      itineraries[index] = updatedItinerary;
      this.saveItineraries(itineraries, userId);
    }
  }

  deleteItinerary(id: number, userId?: string): void {
    const itineraries = this.getItineraries(userId);
    const filtered = itineraries.filter(i => i.id !== id);
    this.saveItineraries(filtered, userId);
  }

  clearItineraries(userId?: string): void {
    const key = userId ? `${this.ITINERARIES_KEY_PREFIX}${userId}` : this.ITINERARIES_KEY_PREFIX + 'default';
    localStorage.removeItem(key);
  }

  // Activities
  saveActivities(activities: Activity[], userId?: string): void {
    const key = userId ? `${this.ACTIVITIES_KEY_PREFIX}${userId}` : this.ACTIVITIES_KEY_PREFIX + 'default';
    localStorage.setItem(key, JSON.stringify(activities));
  }

  getActivities(userId?: string): Activity[] {
    const key = userId ? `${this.ACTIVITIES_KEY_PREFIX}${userId}` : this.ACTIVITIES_KEY_PREFIX + 'default';
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  }

  getActivitiesByItineraryId(itineraryId: number, userId?: string): Activity[] {
    const activities = this.getActivities(userId);
    return activities.filter(a => a.itineraryId === itineraryId);
  }

  addActivity(activity: Activity, userId?: string): void {
    const activities = this.getActivities(userId);
    activities.push(activity);
    this.saveActivities(activities, userId);
  }

  updateActivity(updatedActivity: Activity, userId?: string): void {
    const activities = this.getActivities(userId);
    const index = activities.findIndex(a => a.id === updatedActivity.id);
    if (index !== -1) {
      activities[index] = updatedActivity;
      this.saveActivities(activities, userId);
    }
  }

  deleteActivity(id: number, userId?: string): void {
    const activities = this.getActivities(userId);
    const filtered = activities.filter(a => a.id !== id);
    this.saveActivities(filtered, userId);
  }
}
