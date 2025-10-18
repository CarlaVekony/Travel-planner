import { Injectable } from '@angular/core';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, fetchSignInMethodsForEmail } from 'firebase/auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  auth = getAuth();

  private loggedIn: boolean = false;

  constructor() {
    // Listen to Firebase auth state changes
    onAuthStateChanged(this.auth, (user) => {
      this.loggedIn = !!user;
    });
  }

  async login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  async register(email: string, password: string) {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  async checkUserExists(email: string) {
    const methods = await fetchSignInMethodsForEmail(this.auth, email);
    return methods.length > 0;
  }

  logout() {
    return this.auth.signOut();
  }

  // 🔹 Add this method
  isLoggedIn(): boolean {
    return this.loggedIn;
  }
}