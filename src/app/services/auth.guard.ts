import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { Observable, of, timer } from 'rxjs';
import { map, take, switchMap, catchError, delay, filter, timeout } from 'rxjs/operators';

@Injectable({ 
  providedIn: 'root' 
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Observable<boolean> {
    console.log('Auth guard activated');
    
    // Check if we're in browser environment
    if (typeof window === 'undefined') {
      console.log('Auth guard: Not in browser environment, allowing access');
      return of(true);
    }
    
    // Wait for Firebase to restore authentication state
    return this.authService.user$.pipe(
      // Wait for the first non-null user or timeout after 3 seconds
      filter(user => user !== null || this.authService.getCurrentUser() !== null),
      take(1),
      timeout(3000),
      map(user => {
        const currentUser = this.authService.getCurrentUser();
        console.log('Auth guard - User from observable:', user);
        console.log('Auth guard - Current user from service:', currentUser);
        
        // Use either the observable user or the current user
        const authenticatedUser = user || currentUser;
        
        if (authenticatedUser) {
          console.log('User is authenticated, allowing access');
          return true;
        } else {
          console.log('User is not authenticated, redirecting to login');
          this.router.navigate(['/login']);
          return false;
        }
      }),
      catchError(error => {
        console.error('Auth guard error or timeout:', error);
        // On timeout or error, check if user is actually authenticated
        const currentUser = this.authService.getCurrentUser();
        if (currentUser) {
          console.log('User found after timeout, allowing access');
          return of(true);
        } else {
          console.log('No user found after timeout, redirecting to login');
          this.router.navigate(['/login']);
          return of(false);
        }
      })
    );
  }
}
