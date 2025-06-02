import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private readonly API_URL = environment.API_URL;
  
  constructor(private http: HttpClient) {}
  
  getRoles(): Observable<any> {
    return this.http.get<Role[]>(`${this.API_URL}/roles`).pipe(
      map((roles: Role[]) => ({
        data: { 
          roles: roles.map(role => ({
            ...role,
            _id: role.id // Ensure _id exists for compatibility
          }))
        }
      })),
      catchError(error => {
        console.error('Error fetching roles:', error);
        return throwError(() => error);
      })
    );
  }
  
  getRoleById(id: string): Observable<any> {
    return this.http.get<Role>(`${this.API_URL}/roles/${id}`).pipe(
      map((role: Role) => ({
        data: { 
          role: {
            ...role,
            _id: role.id // Now properly typed with Role interface
          }
        }
      })),
      catchError(error => {
        console.error(`Error fetching role ID ${id}:`, error);
        return throwError(() => error);
      })
    );
  }
  
  createRole(roleData: any): Observable<any> {
    // Format data to match JSON structure
    const newRole = {
      id: Date.now().toString(),
      name: roleData.name,
      description: roleData.remarks || `Role for ${roleData.name}`,
      permissions: roleData.permissions,
      is_active: roleData.is_active,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    return this.http.post(`${this.API_URL}/roles`, newRole).pipe(
      catchError(error => {
        console.error('Error creating role:', error);
        return throwError(() => error);
      })
    );
  }
  
  updateRole(id: string, roleData: any): Observable<any> {
    // Format update data
    const updateData = {
      ...roleData,
      updated_at: new Date().toISOString()
    };
    
    return this.http.put(`${this.API_URL}/roles/${id}`, updateData).pipe(
      catchError(error => {
        console.error(`Error updating role ID ${id}:`, error);
        return throwError(() => error);
      })
    );
  }
  
  deleteRole(id: string): Observable<any> {
    return this.http.delete(`${this.API_URL}/roles/${id}`).pipe(
      catchError(error => {
        console.error(`Error deleting role ID ${id}:`, error);
        return throwError(() => error);
      })
    );
  }
  
  searchRole(searchTerm: string): Observable<any> {
    return this.http.get<Role[]>(`${this.API_URL}/roles?q=${searchTerm}`).pipe(
      map((roles: Role[]) => ({
        data: { 
          roles: roles.map(role => ({
            ...role,
            _id: role.id // Now properly typed
          }))
        }
      })),
      catchError(error => {
        console.error(`Error searching roles with term ${searchTerm}:`, error);
        return throwError(() => error);
      })
    );
  }
}
