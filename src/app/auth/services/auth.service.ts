import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { SUPER_ADMIN_USER } from '../../core/mocks/super-admin.mock';

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
  isSuperAdmin?: boolean;
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

    const storedUser = this.getUserFromStorage();
    if (storedUser) {
      this.currentUserSubject.next(storedUser);
    }
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(email: string, password: string): Observable<any> {
    // Special case for super admin login
    if (email === 'admin@system.com' && password === 'SuperSecurePassword123!') {
      // Use the mock super admin user
      this.setCurrentUser(SUPER_ADMIN_USER);

      return of({
        success: true,
        user: SUPER_ADMIN_USER
      });
    }

    // Regular user login flow
    return this.http.get<User[]>(`${this.API_URL}/users?email=${email}`).pipe(
      switchMap(users => {
        if (users.length === 0) {
          return throwError(() => new Error('User not found'));
        }

        const user = users[0];
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


  hasPermission(permission: string): boolean {
    console.log(`Checking permission: ${permission}`);
        debugger
    const user = this.currentUserValue;
    if (!user || !user.permissions || !Array.isArray(user.permissions)) {
      return false;
    }


    // Super admin has all permissions
    if (this.isSuperAdmin(user)) {
      return true;
    }


    const moduleName = permission.split('.')[0];


    for (const group of user.permissions) {
      if (!group || !group.moduleName || !group.permissions) {
        continue;
      }


      const normalizedGroupName = group.moduleName.toLowerCase();
      const normalizedModuleName = `${moduleName.toLowerCase()}management`;

      if (normalizedGroupName === normalizedModuleName ||
          normalizedGroupName.includes(moduleName.toLowerCase())) {


        if (Array.isArray(group.permissions) && group.permissions.includes(permission)) {
          console.log(`Permission found: ${permission}`);
          return true;
        }
      }
    }

    return false;
  }


  hasModuleAccess(moduleName: string): boolean {
    console.log(`Checking module access for: ${moduleName}`);

    const user = this.currentUserValue;
    if (!user || !user.permissions || !Array.isArray(user.permissions)) {
      console.log('No user or permissions array');
      return false;
    }


    // Super admin has access to all modules
    if (this.isSuperAdmin(this.currentUserValue)) {
      return true;
    }


    const possibleModuleNames = [
      moduleName,
      `${moduleName}Management`,
      moduleName.toLowerCase(),
      `${moduleName.toLowerCase()}management`
    ];

    console.log(`Checking possible module names: ${possibleModuleNames.join(', ')}`);
    console.log(`User has permission groups: ${user.permissions.map(g => g.moduleName).join(', ')}`);


    for (const group of user.permissions) {
      if (!group || !group.moduleName) {
        continue;
      }


      const normalizedGroupName = group.moduleName.toLowerCase();


      const matchesModule = possibleModuleNames.some(name =>
        normalizedGroupName === name.toLowerCase()
      );

      if (matchesModule) {
        console.log(`Found matching module: ${group.moduleName}`);

        const hasPermissions = Array.isArray(group.permissions) && group.permissions.length > 0;
        console.log(`Module has permissions: ${hasPermissions}`);
        return hasPermissions;
      }


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


  isAdmin(): boolean {
    const user = this.currentUserValue;
    if (!user) return false;

    // Super admin is always an admin
    if (this.isSuperAdmin(user)) return true;


    const flatPermissions: string[] = [];
    user.permissions.forEach(group => {
      if (group.permissions && Array.isArray(group.permissions)) {
        flatPermissions.push(...group.permissions);
      }
    });


    const hasUserManagement =
      flatPermissions.includes('User.ViewUsers') &&
      flatPermissions.includes('User.CreateUser') &&
      flatPermissions.includes('User.UpdateUser');
    return hasUserManagement;
  }

  // Helper method to check if a user is the super admin
  isSuperAdmin(user: any): boolean {
    if (!user) return false;

    // Check for explicit super admin flag
    if (user.isSuperAdmin === true) return true;

    // Check for super admin email (assuming admin@system.com is the super admin)
    if (user.email === 'admin@system.com') return true;

    // Check for super admin ID
    if (user.id === 'super_admin_id') return true;

    return false;
  }

  // Set up comprehensive permissions for super admin
  private setupSuperAdminPermissions(): PermissionGroup[] {
    return [
      {
        moduleName: 'UserManagement',
        permissions: [
          'User.ViewUsers',
          'User.CreateUser',
          'User.UpdateUser',
          'User.DeleteUser'
        ]
      },
      {
        moduleName: 'ReportManagement',
        permissions: [
          'Report.ViewReports',
          'Report.CreateReport',
          'Report.UpdateReport',
          'Report.DeleteReport',
          'Report.ViewReportDetail'
        ]
      },
      {
        moduleName: 'FileManagement',
        permissions: [
          'File.ViewFiles',
          'File.UploadFile',
          'File.DeleteFile'
        ]
      },
      // Add other modules as needed
    ];
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
