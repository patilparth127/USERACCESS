import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InitService {
  private apiUrl = environment.API_URL;

  constructor(private http: HttpClient) { }

  /**
   * Initialize the application and ensure super admin exists
   */
  initializeApp() {
    // Check if super admin exists, create if not
    this.checkSuperAdmin().pipe(
      catchError(error => {
        console.error('Error checking super admin:', error);
        return of(null);
      })
    ).subscribe();
  }

  /**
   * Check if super admin exists, create if not
   */
  private checkSuperAdmin() {
    return this.http.get(`${this.apiUrl}/init/check-super-admin`).pipe(
      catchError(error => {
        // If API returns 404 (super admin not found), create the super admin
        if (error.status === 404) {
          return this.createSuperAdmin();
        }
        throw error;
      })
    );
  }

  /**
   * Create the super admin user
   */
  private createSuperAdmin() {
    const superAdmin = {
      name: 'System Administrator',
      email: 'admin@system.com',
      password: 'SuperSecurePassword123!', // Should be secure and stored in env variables
      isSuperAdmin: true,
      is_active: true
    };

    return this.http.post(`${this.apiUrl}/init/create-super-admin`, superAdmin);
  }
}
