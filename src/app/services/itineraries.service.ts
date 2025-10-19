import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface Itinerary {
  id?: number;
  title: string;
  country: string;
  city: string;
  startDate: string;
  endDate: string;
  totalCost?: number;
  notes?: string;
  user?: any;
}

@Injectable({ providedIn: 'root' })
export class ItinerariesService {
  private readonly baseUrl = 'http://localhost:8080/api/itineraries';

  constructor(private http: HttpClient, private authService: AuthService) {}

  getItineraries(): Observable<Itinerary[]> {
    const userId = this.authService.getCurrentUserId();
    console.log('Getting itineraries for user ID:', userId);
    if (!userId) {
      throw new Error('User not authenticated');
    }
    return this.http.get<Itinerary[]>(`${this.baseUrl}/user/${userId}`);
  }

  getItinerary(id: number): Observable<Itinerary> {
    return this.http.get<Itinerary>(`${this.baseUrl}/${id}`);
  }

  createItinerary(itinerary: Omit<Itinerary, 'id'>): Observable<Itinerary> {
    const userId = this.authService.getCurrentUserId();
    console.log('Creating itinerary for user ID:', userId);
    if (!userId) {
      throw new Error('User not authenticated');
    }
    return this.http.post<Itinerary>(`${this.baseUrl}/user/${userId}`, itinerary);
  }

  updateItinerary(id: number, itinerary: Partial<Itinerary>): Observable<Itinerary> {
    return this.http.put<Itinerary>(`${this.baseUrl}/${id}`, itinerary);
  }

  deleteItinerary(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}