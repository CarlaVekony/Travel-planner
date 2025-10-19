import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface User {
  id?: number;
  email: string;
  name: string;
  firebaseUid: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly baseUrl = 'http://localhost:8080/api/users';

  constructor(private http: HttpClient, private authService: AuthService) {}

  createOrUpdateUser(user: Omit<User, 'id'>): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/create`, user);
  }

  getCurrentUser(): Observable<User> {
    const firebaseUid = this.authService.getCurrentUserId();
    if (!firebaseUid) {
      throw new Error('No user logged in');
    }
    return this.http.get<User>(`${this.baseUrl}/firebase/${firebaseUid}`);
  }

  updateUser(id: number, user: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/${id}`, user);
  }
}
