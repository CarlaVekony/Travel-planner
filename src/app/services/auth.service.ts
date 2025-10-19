import { Injectable } from '@angular/core';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, fetchSignInMethodsForEmail, User as FirebaseUser } from 'firebase/auth';
import { getApp, initializeApp } from 'firebase/app';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/firebase-config';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth: any = null;
  private userSubject = new BehaviorSubject<FirebaseUser | null>(null);
  public user$ = this.userSubject.asObservable();

  constructor() {
    this.initializeAuth();
  }

  private initializeAuth() {
    try {
      // Try to get existing app
      const app = getApp();
      this.auth = getAuth(app);
    } catch (error) {
      // If no app exists, initialize it
      const app = initializeApp(environment.firebase);
      this.auth = getAuth(app);
    }
    
    // Listen to Firebase auth state changes
    onAuthStateChanged(this.auth, (user) => {
      this.userSubject.next(user);
    });
  }

  async login(email: string, password: string) {
    const res = await signInWithEmailAndPassword(this.auth, email, password);
    return res;
  }

  async register(email: string, password: string) {
    const res = await createUserWithEmailAndPassword(this.auth, email, password);
    return res;
  }

  async checkUserExists(email: string) {
    const methods = await fetchSignInMethodsForEmail(this.auth, email);
    return methods.length > 0;
  }

  logout() {
    return this.auth.signOut();
  }

  isLoggedIn(): boolean {
    return !!this.auth.currentUser;
  }

  getCurrentUser(): FirebaseUser | null {
    return this.auth.currentUser;
  }

  getCurrentUserId(): string | null {
    return this.auth.currentUser?.uid || null;
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