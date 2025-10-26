import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App implements OnInit {
  title = 'Vacation Planner';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    console.log('App component initialized');
    
    // Only initialize Firebase Auth in browser environment
    if (typeof window !== 'undefined') {
      // Initialize Firebase Auth in browser
      this.authService.initializeInBrowser();
      
      // Wait a moment for Firebase to initialize, then debug
      setTimeout(() => {
        this.authService.debugAuthState();
      }, 1000);
    } else {
      console.log('App: Not in browser environment, skipping Firebase initialization');
    }
    
    // Subscribe to auth state changes and handle routing (only in browser)
    if (typeof window !== 'undefined') {
      this.authService.user$.subscribe(user => {
        console.log('App component - Auth state changed:', user ? 'User logged in' : 'User logged out');
        
        // If user is authenticated and we're on the home page, redirect to itineraries
        if (user && window.location.pathname === '/') {
          console.log('User is authenticated, redirecting to itineraries');
          this.router.navigate(['/itineraries']);
        }
      });
    }
  }
}
