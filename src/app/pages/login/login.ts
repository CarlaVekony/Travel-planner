import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
  email: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  async login() {
    try {
      const exists = await this.authService.checkUserExists(this.email);
      if (!exists) {
        this.errorMessage = 'No account found';
        return;
      }

      await this.authService.login(this.email, this.password);
      this.router.navigate(['/itineraries']);
    } catch (error: any) {
      this.errorMessage = error.message;
    }
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }
}
