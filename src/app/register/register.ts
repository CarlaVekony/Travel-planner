import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class Register {
  email: string = '';
  password: string = '';
  error: string = '';
  successMessage: string = '';

  constructor(
    private authService: AuthService, 
    private userService: UserService,
    private router: Router
  ) {}

  async register() {
    console.log('Attempting registration with:', this.email);
    this.error = '';
    this.successMessage = '';
    
    try {
      console.log('Calling Firebase registration...');
      const userCredential = await this.authService.register(this.email, this.password);
      console.log('Registration successful:', userCredential.user);
      
      // Create user in backend
      const user = {
        email: userCredential.user.email!,
        name: userCredential.user.displayName || userCredential.user.email!.split('@')[0],
        firebaseUid: userCredential.user.uid
      };
      
      console.log('Creating user in backend:', user);
      this.userService.createOrUpdateUser(user).subscribe({
        next: () => {
          console.log('User created successfully in backend');
          this.successMessage = 'Account created successfully! Redirecting to itineraries...';
          setTimeout(() => this.router.navigate(['/itineraries']), 1000);
        },
        error: (error) => {
          console.error('Error creating user in backend:', error);
          this.successMessage = 'Account created successfully! Redirecting to itineraries...';
          setTimeout(() => this.router.navigate(['/itineraries']), 1000);
        }
      });
    } catch (err: any) {
      console.error('Registration error:', err);
      this.error = err.message;
      
      // Provide more specific error messages
      if (err.code === 'auth/email-already-in-use') {
        this.error = 'An account with this email already exists. Try logging in instead.';
      } else if (err.code === 'auth/weak-password') {
        this.error = 'Password should be at least 6 characters';
      } else if (err.code === 'auth/invalid-email') {
        this.error = 'Invalid email address';
      } else {
        this.error = err.message;
      }
    }
  }
}