import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-debug',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding: 20px; background: #f0f0f0; margin: 20px; border-radius: 8px;">
      <h3>Debug Information</h3>
      <p>Current URL: {{ currentUrl }}</p>
      <button (click)="goToLogin()">Go to Login</button>
      <button (click)="goToRegister()">Go to Register</button>
      <button (click)="goToHome()">Go to Home</button>
    </div>
  `
})
export class DebugComponent {
  currentUrl: string;

  constructor(private router: Router) {
    this.currentUrl = this.router.url;
  }

  goToLogin() {
    console.log('Debug: Navigating to login...');
    this.router.navigate(['/login']).then(success => {
      console.log('Debug: Navigation result:', success);
    }).catch(error => {
      console.error('Debug: Navigation error:', error);
    });
  }

  goToRegister() {
    console.log('Debug: Navigating to register...');
    this.router.navigate(['/register']).then(success => {
      console.log('Debug: Navigation result:', success);
    }).catch(error => {
      console.error('Debug: Navigation error:', error);
    });
  }

  goToHome() {
    console.log('Debug: Navigating to home...');
    this.router.navigate(['/']).then(success => {
      console.log('Debug: Navigation result:', success);
    }).catch(error => {
      console.error('Debug: Navigation error:', error);
    });
  }
}
