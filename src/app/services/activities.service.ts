import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Activity {
  id?: number;
  name: string;
  location: string;
  startTime: string;
  duration: number;
  cost: number;
  date: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
  itineraryId: number;
}

export interface TravelTime {
  duration: string;
  distance: string;
}

@Injectable({ providedIn: 'root' })
export class ActivitiesService {
  private readonly baseUrl = 'http://localhost:8080/api/activities';

  constructor(private http: HttpClient) {}

  getActivities(itineraryId: number): Observable<Activity[]> {
    return this.http.get<Activity[]>(`${this.baseUrl}?itineraryId=${itineraryId}`);
  }

  getActivity(id: number): Observable<Activity> {
    return this.http.get<Activity>(`${this.baseUrl}/${id}`);
  }

  createActivity(activity: Omit<Activity, 'id'>): Observable<Activity> {
    return this.http.post<Activity>(this.baseUrl, activity);
  }

  updateActivity(id: number, activity: Partial<Activity>): Observable<Activity> {
    return this.http.put<Activity>(`${this.baseUrl}/${id}`, activity);
  }

  deleteActivity(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getTravelTime(fromLat: number, fromLng: number, toLat: number, toLng: number): Observable<TravelTime> {
    return this.http.get<TravelTime>(`${this.baseUrl}/travel-time?fromLat=${fromLat}&fromLng=${fromLng}&toLat=${toLat}&toLng=${toLng}`);
  }

  getTotalCost(itineraryId: number): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/budget/total/${itineraryId}`);
  }

  getDailyCosts(itineraryId: number): Observable<{[date: string]: number}> {
    return this.http.get<{[date: string]: number}>(`${this.baseUrl}/budget/daily/${itineraryId}`);
  }

  getCostForDate(itineraryId: number, date: string): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/budget/date/${itineraryId}?date=${date}`);
  }
}