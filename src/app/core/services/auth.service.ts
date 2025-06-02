import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { User, LoginRequest, LoginResponse, AuthState } from '../../models/auth.models';
import { Router } from '@angular/router';
import { AccessService } from './access.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = environment.API_URL;
  private readonly AUTH_STORAGE_KEY = 'rbac_auth';
  
  private authStateSubject = new BehaviorSubject<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null
  });
  
  public authState$ = this.authStateSubject.asObservable();
  
  constructor(
    private http: HttpClient,
    private router: Router,
    private accessService: AccessService
  ) {
    // Load auth state from storage on startup
    this.loadAuthState();
  }
  
  /**
   * Get current authentication state
   */
  get currentAuthState(): AuthState {
    return this.authStateSubject.value;
  }
  
  /**
   * Check if user is authenticated
   */
  get isAuthenticated(): boolean {
    return this.currentAuthState.isAuthenticated && !!this.currentAuthState.token;
  }
  
  /**
   * Get current user
   */
  get currentUser(): User | null {
    return this.currentAuthState.user;
  }
  
  /**
   * Check if current user is admin
   */
  get isAdmin(): boolean {
    return this.currentUser?.role === 'admin';
  }
  
  /**
   * Load authentication state from storage
   */
  private loadAuthState(): void {
    try {
      const storedState = localStorage.getItem(this.AUTH_STORAGE_KEY);
      if (storedState) {
        const authState: AuthState = JSON.parse(storedState);
        this.authStateSubject.next(authState);
        
        // Refresh permission cache when loading authentication
        if (authState.isAuthenticated) {
          this.accessService.loadAccessibleModules();
        }
      }
    } catch (error) {
      console.error('Failed to load auth state from storage:', error);
      // Clear potentially corrupted auth state
      this.clearAuthState();
    }
  }
  
  /**
   * Save authentication state to storage
   */
  private saveAuthState(authState: AuthState): void {
    localStorage.setItem(this.AUTH_STORAGE_KEY, JSON.stringify(authState));
    this.authStateSubject.next(authState);
  }
  
  /**
   * Clear authentication state
   */
  private clearAuthState(): void {
    localStorage.removeItem(this.AUTH_STORAGE_KEY);
    this.authStateSubject.next({
      isAuthenticated: false,
      user: null,
      token: null
    });
  }
  
  /**
   * Login with email and password
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    // For JSON Server, we need to query users to find matching email
    return this.http.get<User[]>(`${this.API_URL}/api/v1/auth/users?email=${credentials.email}`).pipe(
      map(users => {
        const user = users[0];
        
        if (!user) {
          throw new Error('User not found');
        }
        
        // In a real app, you'd verify the password on the server
        // For demo purposes, we're accepting any password
        
        // Generate a mock token
        const token = btoa(`${user.id}:${user.email}:${Date.now()}`);
        
        const response: LoginResponse = {
          success: true,
          data: {
            user,
            token
          },
          message: 'Login successful'
        };
        
        // Update auth state
        this.saveAuthState({
          isAuthenticated: true,
          user,
          token
        });
        
        // Refresh permission cache
        this.accessService.loadAccessibleModules();
        
        return response;
      }),
      catchError(error => {
        return throwError(() => new Error('Login failed: ' + (error.message || 'Unknown error')));
      })
    );
  }
  
  /**
   * Logout current user
   */
  logout(): void {
    this.clearAuthState();
    this.accessService.clearCache();
    this.router.navigate(['/login']);
  }
  
  /**
   * Get auth token for API requests
   */
  getToken(): string | null {
    return this.currentAuthState.token;
  }
  
  /**
   * Check if user has permission
   * For admins, always return true
   */
  hasPermission(permission: string): Observable<boolean> {
    if (this.isAdmin) {
      return of(true); // Admins have all permissions
    }
    
    return this.accessService.hasPermission(permission);
  }
  
  /**
   * Get user profile
   */
  getUserProfile(): Observable<User> {
    if (!this.currentUser) {
      return throwError(() => new Error('No authenticated user'));
    }
    
    return this.http.get<User>(`${this.API_URL}/api/v1/auth/users/${this.currentUser.id}`).pipe(
      catchError(error => {
        return throwError(() => new Error('Failed to get user profile: ' + error.message));
      })
    );
  }
}
