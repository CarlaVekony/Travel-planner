import { Injectable, inject } from '@angular/core';
import { Auth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, fetchSignInMethodsForEmail, User as FirebaseUser } from '@angular/fire/auth';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  private userSubject = new BehaviorSubject<FirebaseUser | null>(null);
  public user$ = this.userSubject.asObservable();

  constructor() {
    // Only initialize Firebase in browser environment
    if (typeof window !== 'undefined') {
      this.initializeAuth();
    } else {
      console.log('Firebase Auth: Not in browser environment, skipping initialization');
    }
  }

  // Method to initialize auth when app runs in browser
  initializeInBrowser() {
    if (typeof window !== 'undefined') {
      console.log('Initializing Firebase Auth in browser...');
      this.initializeAuth();
    }
  }

  private initializeAuth() {
    // Listen to Firebase auth state changes
    onAuthStateChanged(this.auth, (user) => {
      console.log('Firebase auth state changed:', user ? 'User logged in' : 'User logged out');
      if (user) {
        console.log('User details:', { uid: user.uid, email: user.email });
      }
      this.userSubject.next(user);
    });
  }

  async login(email: string, password: string) {
    try {
      const res = await signInWithEmailAndPassword(this.auth, email, password);
      console.log('Login successful, user:', res.user.email);
      return res;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async register(email: string, password: string) {
    try {
      const res = await createUserWithEmailAndPassword(this.auth, email, password);
      console.log('Registration successful, user:', res.user.email);
      return res;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  async checkUserExists(email: string) {
    const methods = await fetchSignInMethodsForEmail(this.auth, email);
    return methods.length > 0;
  }

  async logout() {
    try {
      await this.auth.signOut();
      this.userSubject.next(null);
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
  }

  isLoggedIn(): boolean {
    const isLoggedIn = !!this.auth.currentUser;
    console.log('isLoggedIn check:', isLoggedIn, 'Current user:', this.auth.currentUser);
    return isLoggedIn;
  }

  getCurrentUserId(): string | null {
    const userId = this.auth.currentUser?.uid || null;
    console.log('getCurrentUserId:', userId);
    return userId;
  }

  getCurrentUser(): FirebaseUser | null {
    return this.auth.currentUser;
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

  // Wait for auth state to be initialized (either user or null)
  waitForAuthState(): Promise<FirebaseUser | null> {
    return new Promise((resolve) => {
      // If we already have a user, resolve immediately
      const currentUser = this.getCurrentUser();
      if (currentUser) {
        resolve(currentUser);
        return;
      }

      // Otherwise, wait for the auth state to change
      const unsubscribe = onAuthStateChanged(this.auth, (user) => {
        unsubscribe();
        resolve(user);
      });
    });
  }

  // Debug method to check Firebase auth state
  debugAuthState(): void {
    console.log('=== Firebase Auth Debug Info ===');
    console.log('Auth instance:', this.auth);
    console.log('Current user:', this.auth?.currentUser);
    console.log('Auth state:', this.auth?.currentUser ? 'authenticated' : 'not authenticated');
    console.log('User observable value:', this.userSubject.value);
    console.log('Has stored auth data:', this.hasStoredAuth());
    console.log('================================');
  }

  // Check if there's a stored auth token (for debugging)
  hasStoredAuth(): boolean {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
        console.log('Not in browser environment, cannot check localStorage');
        return false;
      }

      // Check for various possible Firebase localStorage keys
      const possibleKeys = [
        'firebase:authUser:travel-planner-12b1a:[DEFAULT]',
        'firebase:authUser:travel-planner-12b1a:default',
        'firebase:authUser:travel-planner-12b1a',
        'firebase:authUser'
      ];
      
      let hasStored = false;
      let foundKey = '';
      
      for (const key of possibleKeys) {
        const authData = localStorage.getItem(key);
        if (authData) {
          hasStored = true;
          foundKey = key;
          console.log('Found stored auth data in key:', key);
          console.log('Stored auth data:', JSON.parse(authData));
          break;
        }
      }
      
      // Also check all localStorage keys that start with 'firebase'
      if (!hasStored) {
        console.log('Checking all Firebase-related localStorage keys:');
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('firebase')) {
            console.log('Firebase key found:', key, 'Value:', localStorage.getItem(key));
          }
        }
      }
      
      console.log('Has stored auth data:', hasStored, 'Key:', foundKey);
      return hasStored;
    } catch (error) {
      console.error('Error checking stored auth:', error);
      return false;
    }
  }
}