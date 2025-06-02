import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  date_of_birth?: string;
  permissions: string[]; // Changed from roleId to permissions array
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly API_URL = environment.API_URL;
  
  constructor(private readonly http: HttpClient) { }

  getUsers(): Observable<{ data: { users: any[] } }> {
    // Get all users from JSON Server
    return this.http.get<User[]>(`${this.API_URL}/users`).pipe(
      map(users => ({
        data: {
          users: users.map(user => ({
            ...user,
            _id: user.id // Ensure _id exists for compatibility with existing code
          }))
        }
      })),
      catchError(this.handleError)
    );
  }

  createUser(data: any): Observable<any> {
    // Format the user data to match JSON structure
    const userData = {
      id: Date.now().toString(), // Generate ID
      name: data.name,
      email: data.email,
      phone: data.phone,
      date_of_birth: data.date_of_birth,
      permissions: data.permissions || [], // Use permissions array instead of role
      is_active: data.is_active,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    return this.http.post<any>(`${this.API_URL}/users`, userData).pipe(
      map(user => ({
        data: { user }
      })),
      catchError(this.handleError)
    );
  }

  searchUser(searchData: string): Observable<{ data: { users: any[] } }> {
    // JSON Server query
    return this.http.get<User[]>(`${this.API_URL}/users?q=${searchData}`).pipe(
      map(users => ({
        data: {
          users: users.map(user => ({
            ...user,
            _id: user.id // Ensure _id exists for compatibility
          }))
        }
      })),
      catchError(this.handleError)
    );
  }

  // This method is no longer needed since we're not using roles
  // but keeping for backward compatibility - it will return an empty array
  getActiveRoles(): Observable<{ data: { roles: any[] } }> {
    return new Observable(observer => {
      observer.next({ data: { roles: [] } });
      observer.complete();
    });
  }

  getUserById(userId: string): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/users/${userId}`).pipe(
      map(user => ({
        data: { 
          user: {
            ...user,
            _id: user.id // Ensure _id exists for compatibility
          }
        }
      })),
      catchError(this.handleError)
    );
  }

  updateUser(userId: string, data: any): Observable<any> {
    // Format update data
    const updateData = {
      ...data,
      updated_at: new Date().toISOString()
    };
    
    return this.http.patch<any>(`${this.API_URL}/users/${userId}`, updateData).pipe(
      map(user => ({
        data: { user }
      })),
      catchError(this.handleError)
    );
  }

  deleteUser(userId: string): Observable<any> {
    return this.http.delete<any>(`${this.API_URL}/users/${userId}`).pipe(
      catchError(this.handleError)
    );
  }

  // Add a method specifically for updating user permissions
  updateUserPermissions(userId: string, permissions: string[]): Observable<any> {
    return this.http.patch<any>(`${this.API_URL}/users/${userId}`, {
      permissions,
      updated_at: new Date().toISOString()
    }).pipe(
      map(user => ({
        data: { user }
      })),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }

    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
