import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
  email: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(
    private authService: AuthService, 
    private userService: UserService,
    private router: Router
  ) {}

  async login() {
    console.log('Attempting login with:', this.email);
    this.errorMessage = '';
    
    try {
      console.log('Calling Firebase login...');
      const userCredential = await this.authService.login(this.email, this.password);
      console.log('Login successful:', userCredential.user);
      
      // Create or update user in backend
      const user = {
        email: userCredential.user.email!,
        name: userCredential.user.displayName || userCredential.user.email!.split('@')[0],
        firebaseUid: userCredential.user.uid
      };
      
      console.log('Creating/updating user in backend:', user);
      this.userService.createOrUpdateUser(user).subscribe({
        next: () => {
          console.log('User created/updated successfully');
          this.router.navigate(['/itineraries']);
        },
        error: (error) => {
          console.error('Error creating user:', error);
          console.log('Still navigating to itineraries...');
          this.router.navigate(['/itineraries']); // Still navigate even if user creation fails
        }
      });
    } catch (error: any) {
      console.error('Login error:', error);
      this.errorMessage = error.message;
      
      // Provide more specific error messages
      if (error.code === 'auth/user-not-found') {
        this.errorMessage = 'No account found with this email address';
      } else if (error.code === 'auth/wrong-password') {
        this.errorMessage = 'Incorrect password';
      } else if (error.code === 'auth/invalid-email') {
        this.errorMessage = 'Invalid email address';
      } else if (error.code === 'auth/too-many-requests') {
        this.errorMessage = 'Too many failed attempts. Please try again later';
      } else {
        this.errorMessage = error.message;
      }
    }
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }
}
