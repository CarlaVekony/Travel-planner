import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DebugComponent } from '../../debug.component';
import { TestRoutingComponent } from '../../test-routing.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, DebugComponent, TestRoutingComponent],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home{
  constructor(private router: Router) {}

  goToLogin() {
    console.log('Navigating to login...');
    this.router.navigate(['/login']).then(success => {
      console.log('Navigation result:', success);
    }).catch(error => {
      console.error('Navigation error:', error);
    });
  }

  goToRegister() {
    console.log('Navigating to register...');
    this.router.navigate(['/register']).then(success => {
      console.log('Navigation result:', success);
    }).catch(error => {
      console.error('Navigation error:', error);
    });
  }
}