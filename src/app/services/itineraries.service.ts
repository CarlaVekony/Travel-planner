import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Itinerary {
  id?: number;
  name: string;
  location: string;
  startDate: string;
  endDate: string;
  notes?: string;
  userId?: string;
}

@Injectable({ providedIn: 'root' })
export class ItinerariesService {
  private readonly baseUrl = 'http://localhost:8080/api/itineraries';

  constructor(private http: HttpClient) {}

  getItineraries(): Observable<Itinerary[]> {
    return this.http.get<Itinerary[]>(this.baseUrl);
  }

  getItinerary(id: number): Observable<Itinerary> {
    return this.http.get<Itinerary>(`${this.baseUrl}/${id}`);
  }

  createItinerary(itinerary: Omit<Itinerary, 'id'>): Observable<Itinerary> {
    return this.http.post<Itinerary>(this.baseUrl, itinerary);
  }

  updateItinerary(id: number, itinerary: Partial<Itinerary>): Observable<Itinerary> {
    return this.http.put<Itinerary>(`${this.baseUrl}/${id}`, itinerary);
  }

  deleteItinerary(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}