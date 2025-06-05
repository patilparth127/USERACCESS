import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  date_of_birth?: string;
  permissions: string[];
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

    return this.http.get<User[]>(`${this.API_URL}/users`).pipe(
      map(users => ({
        data: {
          users: users
            .filter(user => !this.isSuperAdmin(user)) // Exclude super admin users
            .map(user => ({
              ...user,
              _id: user.id,
              createdAt: user.created_at
            }))
        }
      })),
      catchError(this.handleError)
    );
  }

  createUser(data: any): Observable<any> {

    const userData = {
      id: Date.now().toString(),
      name: data.name,
      email: data.email,
      phone: data.phone,
      date_of_birth: data.date_of_birth,
      permissions: data.permissions || [],
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

    return this.http.get<User[]>(`${this.API_URL}/users?q=${searchData}`).pipe(
      map(users => ({
        data: {
          users: users
            .filter(user => !this.isSuperAdmin(user)) // Exclude super admin users
            .map(user => ({
              ...user,
              _id: user.id
            }))
        }
      })),
      catchError(this.handleError)
    );
  }



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
            _id: user.id
          }
        }
      })),
      catchError(this.handleError)
    );
  }

  updateUser(userId: string, data: any): Observable<any> {

    // Check if attempting to update a super admin
    if (this.isSuperAdminById(userId)) {
      return new Observable(observer => {
        observer.error({ message: 'Super admin account cannot be modified' });
        observer.complete();
      });
    }

    const updateData = {
      ...data,
      updated_at: new Date().toISOString()
    };


    return this.http.put<any>(`${this.API_URL}/users/${userId}`, updateData).pipe(
      map(user => ({
        data: { user }
      })),
      catchError(this.handleError)
    );
  }


  deleteUser(userId: string): Observable<{ data: { userId: string } }> {
    // Check if attempting to delete a super admin
    if (this.isSuperAdminById(userId)) {
      return new Observable(observer => {
        observer.error({ message: 'Super admin account cannot be deleted' });
        observer.complete();
      });
    }

    // First check if user is super admin
    return this.getUserById(userId).pipe(
      switchMap(response => {
        const user = response.data.user;

        if (user.isSuperAdmin) {
          return throwError(() => new Error('Cannot delete Super Admin user'));
        }

        // If not super admin, proceed with deletion
        return this.http.delete<void>(`${this.API_URL}/users/${userId}`).pipe(
          map(() => ({ data: { userId } })),
          catchError(this.handleError)
        );
      }),
      catchError(this.handleError)
    );
  }


  updateUserPermissions(userId: string, permissions: string[]): Observable<any> {
    // Check if attempting to update super admin permissions
    if (this.isSuperAdminById(userId)) {
      return new Observable(observer => {
        observer.error({ message: 'Super admin permissions cannot be modified' });
        observer.complete();
      });
    }

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

  // Check if email already exists
  checkEmailExists(email: string): Observable<{ exists: boolean }> {
    return this.http.post<{ exists: boolean }>(`${this.API_URL}/users/validate/email`, { email });
  }

  // Check if phone number already exists
  checkPhoneExists(phone: string): Observable<{ exists: boolean }> {
    return this.http.post<{ exists: boolean }>(`${this.API_URL}/users/validate/phone`, { phone });
  }

  // Check if username already exists
  checkNameExists(name: string): Observable<{ exists: boolean }> {
    return this.http.post<{ exists: boolean }>(`${this.API_URL}/users/validate/name`, { name });
  }

  // Check if employee ID already exists
  checkEmployeeIdExists(employeeId: string): Observable<{ exists: boolean }> {
    return this.http.post<{ exists: boolean }>(`${this.API_URL}/users/validate/employeeId`, { employeeId });
  }

  // Helper method to check if a user is the super admin based on user object
  isSuperAdmin(user: any): boolean {
    if (!user) return false;

    // Check for explicit super admin flag
    if (user.isSuperAdmin === true) return true;

    // Check for super admin email (assuming admin@system.com is the super admin)
    if (user.email === 'admin@system.com') return true;

    return false;
  }

  // Helper method to check if a user ID belongs to super admin
  isSuperAdminById(id: string): boolean {
    // Define the super admin ID (this could be stored in environment config)
    const superAdminId = 'super_admin_id'; // Replace with actual ID used in your system

    return id === superAdminId;
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
