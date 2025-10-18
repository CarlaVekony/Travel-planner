

import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Api } from '../../services/api';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  username = '';
  password = '';
  loginError = '';
  loading = false;

  constructor(private api: Api) {}

  onSubmit() {
    this.loginError = '';
    this.loading = true;
    this.api.login(this.username, this.password).subscribe({
      next: (res) => {
        this.loading = false;
        alert('Login successful!');
      },
      error: (err) => {
        this.loading = false;
        this.loginError = err?.error?.message || 'Invalid username or password';
      }
    });
  }
}
