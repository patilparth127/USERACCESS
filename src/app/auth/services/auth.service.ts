import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

interface PermissionGroup {
  moduleName: string;
  permissions: string[];
}

interface User {
  id: string;
  name: string;
  email: string;
  permissions: PermissionGroup[];
  is_active: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = environment.API_URL;
  private readonly USER_KEY = 'current_user';

  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    // Attempt to load user on service initialization
    const storedUser = this.getUserFromStorage();
    if (storedUser) {
      this.currentUserSubject.next(storedUser);
    }
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(email: string, password: string): Observable<any> {
    return this.http.get<User[]>(`${this.API_URL}/users?email=${email}`).pipe(
      switchMap(users => {
        if (users.length === 0) {
          return throwError(() => new Error('User not found'));
        }

        const user = users[0];

        // Store user directly without token
        this.setCurrentUser(user);

        return of({
          success: true,
          user: user
        });
      }),
      catchError(error => {
        return throwError(() => new Error(`Login failed: ${error.message}`));
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  isAuthenticated(): boolean {
    return !!this.getUserFromStorage();
  }

  // Check if user has permission with new permission structure
  hasPermission(permission: string): boolean {
    console.log(`Checking permission: ${permission}`);
        debugger
    const user = this.currentUserValue;
    if (!user || !user.permissions || !Array.isArray(user.permissions)) {
      return false;
    }

    // Admin check first
    if (this.isAdmin()) {
      return true;
    }

    // Extract module name from permission string (e.g., "Users.ViewUsers" -> "Users")
    const moduleName = permission.split('.')[0];

    // Find the relevant permission group
    for (const group of user.permissions) {
      if (!group || !group.moduleName || !group.permissions) {
        continue;
      }

      // Check module name matching
      const normalizedGroupName = group.moduleName.toLowerCase();
      const normalizedModuleName = `${moduleName.toLowerCase()}management`;

      if (normalizedGroupName === normalizedModuleName ||
          normalizedGroupName.includes(moduleName.toLowerCase())) {

        // Check if the permission exists in this group
        if (Array.isArray(group.permissions) && group.permissions.includes(permission)) {
          console.log(`Permission found: ${permission}`);
          return true;
        }
      }
    }

    return false;
  }

  // Check if user has access to a module with new permission structure
  hasModuleAccess(moduleName: string): boolean {
    console.log(`Checking module access for: ${moduleName}`);

    const user = this.currentUserValue;
    if (!user || !user.permissions || !Array.isArray(user.permissions)) {
      console.log('No user or permissions array');
      return false;
    }

    // Check for admin status first - admins have access to all modules
    if (this.isAdmin()) {
      console.log('User is admin, granting access');
      return true;
    }

    // For module names - create variants to handle different naming conventions
    const possibleModuleNames = [
      moduleName,
      `${moduleName}Management`,
      moduleName.toLowerCase(),
      `${moduleName.toLowerCase()}management`
    ];

    console.log(`Checking possible module names: ${possibleModuleNames.join(', ')}`);
    console.log(`User has permission groups: ${user.permissions.map(g => g.moduleName).join(', ')}`);

    // Check each permission group
    for (const group of user.permissions) {
      if (!group || !group.moduleName) {
        continue;
      }

      // Normalize module names for comparison
      const normalizedGroupName = group.moduleName.toLowerCase();

      // Check if this group's module name matches any of our possible formats
      const matchesModule = possibleModuleNames.some(name =>
        normalizedGroupName === name.toLowerCase()
      );

      if (matchesModule) {
        console.log(`Found matching module: ${group.moduleName}`);
        // Check if the group has permissions
        const hasPermissions = Array.isArray(group.permissions) && group.permissions.length > 0;
        console.log(`Module has permissions: ${hasPermissions}`);
        return hasPermissions;
      }

      // Additional check using the permission prefixes
      if (Array.isArray(group.permissions) && group.permissions.length > 0) {
        for (const perm of group.permissions) {
          if (typeof perm === 'string' && perm.includes('.')) {
            const prefix = perm.split('.')[0];
            if (prefix.toLowerCase() === moduleName.toLowerCase()) {
              console.log(`Found matching permission prefix: ${prefix}`);
              return true;
            }
          }
        }
      }
    }

    console.log(`No matching module found for ${moduleName}`);
    return false;
  }

  // Check if user is admin with new permission structure
  isAdmin(): boolean {
    const user = this.currentUserValue;
    if (!user || !user.permissions || !Array.isArray(user.permissions)) {
      return false;
    }

    // Extract all permissions from all modules into flat array
    const flatPermissions: string[] = [];
    user.permissions.forEach(group => {
      if (group.permissions && Array.isArray(group.permissions)) {
        flatPermissions.push(...group.permissions);
      }
    });

    // Check for core admin capabilities
    const hasUserManagement =
      flatPermissions.includes('User.ViewUsers') &&
      flatPermissions.includes('User.CreateUser') &&
      flatPermissions.includes('User.UpdateUser');
    return hasUserManagement;
  }

  private setCurrentUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  private getUserFromStorage(): User | null {
    const userJson = localStorage.getItem(this.USER_KEY);
    if (userJson) {
      try {
        return JSON.parse(userJson) as User;
      } catch (e) {
        console.error('Error parsing stored user data', e);
        localStorage.removeItem(this.USER_KEY);
        return null;
      }
    }
    return null;
  }


}
