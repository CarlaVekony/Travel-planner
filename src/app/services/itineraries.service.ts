import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap, tap } from 'rxjs';
import { AuthService } from './auth.service';
import { UserService } from './user.service';

export interface Itinerary {
  id?: number;
  name: string;
  location: string;
  startDate: string;
  endDate: string;
  notes?: string;
  userId?: number;
}

@Injectable({ providedIn: 'root' })
export class ItinerariesService {
  private readonly baseUrl = 'http://localhost:8080/api/itineraries';

  constructor(private http: HttpClient, private authService: AuthService, private userService: UserService) {}

  getItineraries(): Observable<Itinerary[]> {
    const firebaseUid = this.authService.getCurrentUserId();
    console.log('=== ITINERARIES SERVICE DEBUG ===');
    console.log('Getting itineraries for Firebase UID:', firebaseUid);
    if (!firebaseUid) {
      throw new Error('User not authenticated');
    }
    
    // First get the backend user, then get itineraries
    return this.userService.getCurrentUser().pipe(
      switchMap(user => {
        console.log('Backend user found:', user);
        const url = `${this.baseUrl}?userId=${user.id}`;
        console.log('Making request to:', url);
        return this.http.get<Itinerary[]>(url);
      }),
      tap(itineraries => {
        console.log('Raw response from backend:', itineraries);
        console.log('Number of itineraries received:', itineraries.length);
      })
    );
  }

  getItinerary(id: number): Observable<Itinerary> {
    return this.http.get<Itinerary>(`${this.baseUrl}/${id}`);
  }

  createItinerary(itinerary: Omit<Itinerary, 'id'>): Observable<Itinerary> {
    const firebaseUid = this.authService.getCurrentUserId();
    console.log('Creating itinerary for Firebase UID:', firebaseUid);
    if (!firebaseUid) {
      throw new Error('User not authenticated');
    }
    
    // First get the backend user, then create itinerary
    return this.userService.getCurrentUser().pipe(
      switchMap(user => {
        console.log('Backend user found for itinerary creation:', user);
        const itineraryWithUserId = { ...itinerary, userId: user.id };
        console.log('Creating itinerary with data:', itineraryWithUserId);
        return this.http.post<Itinerary>(this.baseUrl, itineraryWithUserId);
      })
    );
  }

  updateItinerary(id: number, itinerary: Partial<Itinerary>): Observable<Itinerary> {
    return this.http.put<Itinerary>(`${this.baseUrl}/${id}`, itinerary);
  }

  deleteItinerary(id: number): Observable<void> {
    console.log('=== DELETE ITINERARY SERVICE DEBUG ===');
    console.log('Sending delete request to:', `${this.baseUrl}/${id}`);
    console.log('Current Firebase UID:', this.authService.getCurrentUserId());
    console.log('Current user:', this.authService.getCurrentUser());
    
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}