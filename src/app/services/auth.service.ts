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
    const res = await signInWithEmailAndPassword(this.auth, email, password);
    this.loggedIn = true;
    return res;
  }

  async register(email: string, password: string) {
    const res = await createUserWithEmailAndPassword(this.auth, email, password);
    this.loggedIn = true;
    return res;
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
    return this.loggedIn || !!this.auth.currentUser;
  }

  // helper to wait for auth state initialization
  async ensureLoggedIn(): Promise<boolean> {
    if (this.isLoggedIn()) return true;
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(this.auth, (user) => {
        unsubscribe();
        resolve(!!user);
      });
    });
  }
}