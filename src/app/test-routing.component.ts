import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-test-routing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div style="padding: 20px; background: #e8f5e8; margin: 20px; border-radius: 8px; border: 2px solid #4caf50;">
      <h3>🧪 Routing Test Component</h3>
      <p><strong>Current URL:</strong> {{ currentUrl }}</p>
      <p><strong>Router State:</strong> {{ routerState }}</p>
      
      <div style="margin: 20px 0;">
        <button (click)="testNavigation('/login')" style="margin: 5px; padding: 10px; background: #2196f3; color: white; border: none; border-radius: 4px;">
          Test Login Route
        </button>
        <button (click)="testNavigation('/register')" style="margin: 5px; padding: 10px; background: #ff9800; color: white; border: none; border-radius: 4px;">
          Test Register Route
        </button>
        <button (click)="testNavigation('/')" style="margin: 5px; padding: 10px; background: #4caf50; color: white; border: none; border-radius: 4px;">
          Test Home Route
        </button>
      </div>
      
      <div style="background: #f5f5f5; padding: 10px; border-radius: 4px; margin-top: 10px;">
        <h4>Navigation Log:</h4>
        <div *ngFor="let log of navigationLogs" style="font-family: monospace; font-size: 12px; margin: 2px 0;">
          {{ log }}
        </div>
      </div>
    </div>
  `
})
export class TestRoutingComponent {
  currentUrl: string;
  routerState: string;
  navigationLogs: string[] = [];

  constructor(private router: Router) {
    this.currentUrl = this.router.url;
    this.routerState = this.router.routerState.toString();
    
    // Log initial state
    this.navigationLogs.push(`Initial URL: ${this.currentUrl}`);
    this.navigationLogs.push(`Router State: ${this.routerState}`);
    
    // Listen to router events
    this.router.events.subscribe(event => {
      this.navigationLogs.push(`Router Event: ${event.constructor.name}`);
      this.currentUrl = this.router.url;
    });
  }

  testNavigation(path: string) {
    this.navigationLogs.push(`Attempting navigation to: ${path}`);
    console.log(`Testing navigation to: ${path}`);
    
    this.router.navigate([path]).then(success => {
      this.navigationLogs.push(`Navigation result: ${success ? 'SUCCESS' : 'FAILED'}`);
      console.log(`Navigation to ${path}:`, success);
    }).catch(error => {
      this.navigationLogs.push(`Navigation error: ${error.message}`);
      console.error(`Navigation error to ${path}:`, error);
    });
  }
}
