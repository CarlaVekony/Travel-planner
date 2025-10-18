import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class Register {
  email: string = '';
  password: string = '';
  error: string = '';
  successMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  async register() {
    try {
      await this.authService.register(this.email, this.password);
      this.successMessage = 'Account created successfully! Redirecting to login...';
      setTimeout(() => this.router.navigate(['/login']), 1000); // navigate after success
    } catch (err: any) {
      this.error = err.message;
    }
  }
}