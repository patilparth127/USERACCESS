import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';

interface PermissionGroup {
  moduleName: string;
  permissions: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AccessService {
  // Store accessible modules and permissions
  private permissionCache = new Map<string, boolean>();
  private accessibleModulesSubject = new BehaviorSubject<string[]>([]);

  // Observable streams
  accessibleModules$ = this.accessibleModulesSubject.asObservable();

  constructor() {
    // Initialize modules on startup
    this.loadAccessibleModules();
  }

  // Load accessible modules for the user directly from user permissions
  loadAccessibleModules(): Observable<string[]> {
    // Get user from localStorage
    const userJson = localStorage.getItem('current_user');
    if (!userJson) {
      this.accessibleModulesSubject.next([]);
      return of([]);
    }

    try {
      const currentUser = JSON.parse(userJson);
      if (!currentUser || !currentUser.permissions || !Array.isArray(currentUser.permissions)) {
        this.accessibleModulesSubject.next([]);
        return of([]);
      }

      // Extract module names from permissions
      const modules: string[] = [];

      // Extract module names directly from permissions
      currentUser.permissions.forEach((group: PermissionGroup) => {
        if (group.moduleName) {
          // Extract module name (remove "Management" suffix if present)
          const moduleName = group.moduleName.replace('Management', '');
          if (!modules.includes(moduleName)) {
            modules.push(moduleName);
          }
        }
      });

      this.accessibleModulesSubject.next(modules);
      return of(modules);
    } catch (e) {
      console.error('Error parsing user data', e);
      this.accessibleModulesSubject.next([]);
      return of([]);
    }
  }

  private isAdmin(user: any): boolean {
    if (!user || !user.permissions || !Array.isArray(user.permissions)) {
      return false;
    }

    // Extract all permissions from all modules into flat array
    const flatPermissions: string[] = [];
    user.permissions.forEach((group: PermissionGroup) => {
      if (group.permissions && Array.isArray(group.permissions)) {
        flatPermissions.push(...group.permissions);
      }
    });

    // Check for core admin permissions - user with these permissions is considered admin
    const hasUsersManagement = flatPermissions.includes('User.CreateUser') &&
                               flatPermissions.includes('User.UpdateUser') &&
                               flatPermissions.includes('User.DeleteUser');

    return hasUsersManagement;
  }

  // Load user permissions for specific modules
  loadUserPermissions(): Observable<boolean> {
    // Update module accessibility based on user permissions
    this.loadAccessibleModules();
    return of(true);
  }

  // Add method to load permissions for specific modules
  loadModulePermissions(moduleNames: string[]): Observable<boolean> {
    return this.loadUserPermissions();
  }

  // Check if user has a specific permission with new structure
  hasPermission(permission: string): Observable<boolean> {
    // Check cache first
    if (this.permissionCache.has(permission)) {
      return of(this.permissionCache.get(permission)!);
    }

    // Get user from localStorage
    const userJson = localStorage.getItem('current_user');
    if (!userJson) {
      this.permissionCache.set(permission, false);
      return of(false);
    }

    try {
      const currentUser = JSON.parse(userJson);

      // Admin has all permissions
      if (this.isAdmin(currentUser)) {
        this.permissionCache.set(permission, true);
        return of(true);
      }

      let hasPermission = false;

      if (currentUser && currentUser.permissions && Array.isArray(currentUser.permissions)) {
        // Extract module name from permission string
        const moduleName = permission.split('.')[0] + 'Management';

        // Find the relevant permission group
        for (const group of currentUser.permissions) {
          if (group.moduleName === moduleName ||
              group.moduleName.toLowerCase() === moduleName.toLowerCase()) {
            // Check if the permission exists in this group
            if (group.permissions && Array.isArray(group.permissions)) {
              hasPermission = group.permissions.includes(permission);
              if (hasPermission) break;
            }
          }
        }
      }

      // Cache result
      this.permissionCache.set(permission, hasPermission);
      return of(hasPermission);
    } catch (e) {
      console.error('Error parsing user data', e);
      this.permissionCache.set(permission, false);
      return of(false);
    }
  }

  // Get accessible modules as an observable
  getAccessibleModules(): Observable<string[]> {
    return this.accessibleModules$;
  }

  // Clear permission cache
  clearCache(): void {
    this.permissionCache.clear();
    this.accessibleModulesSubject.next([]);
  }
}
