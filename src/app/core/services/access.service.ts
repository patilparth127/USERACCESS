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

  private permissionCache = new Map<string, boolean>();
  private accessibleModulesSubject = new BehaviorSubject<string[]>([]);


  accessibleModules$ = this.accessibleModulesSubject.asObservable();

  constructor() {

    this.loadAccessibleModules();
  }


  loadAccessibleModules(): Observable<string[]> {

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


      const modules: string[] = [];


      currentUser.permissions.forEach((group: PermissionGroup) => {
        if (group.moduleName) {

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


    const flatPermissions: string[] = [];
    user.permissions.forEach((group: PermissionGroup) => {
      if (group.permissions && Array.isArray(group.permissions)) {
        flatPermissions.push(...group.permissions);
      }
    });


    const hasUsersManagement = flatPermissions.includes('User.CreateUser') &&
                               flatPermissions.includes('User.UpdateUser') &&
                               flatPermissions.includes('User.DeleteUser');

    return hasUsersManagement;
  }


  loadUserPermissions(): Observable<boolean> {

    this.loadAccessibleModules();
    return of(true);
  }


  loadModulePermissions(moduleNames: string[]): Observable<boolean> {
    return this.loadUserPermissions();
  }


  hasPermission(permission: string): Observable<boolean> {

    if (this.permissionCache.has(permission)) {
      return of(this.permissionCache.get(permission)!);
    }


    const userJson = localStorage.getItem('current_user');
    if (!userJson) {
      this.permissionCache.set(permission, false);
      return of(false);
    }

    try {
      const currentUser = JSON.parse(userJson);


      if (this.isAdmin(currentUser)) {
        this.permissionCache.set(permission, true);
        return of(true);
      }

      let hasPermission = false;

      if (currentUser && currentUser.permissions && Array.isArray(currentUser.permissions)) {

        const moduleName = permission.split('.')[0] + 'Management';


        for (const group of currentUser.permissions) {
          if (group.moduleName === moduleName ||
              group.moduleName.toLowerCase() === moduleName.toLowerCase()) {

            if (group.permissions && Array.isArray(group.permissions)) {
              hasPermission = group.permissions.includes(permission);
              if (hasPermission) break;
            }
          }
        }
      }


      this.permissionCache.set(permission, hasPermission);
      return of(hasPermission);
    } catch (e) {
      console.error('Error parsing user data', e);
      this.permissionCache.set(permission, false);
      return of(false);
    }
  }


  getAccessibleModules(): Observable<string[]> {
    return this.accessibleModules$;
  }


  clearCache(): void {
    this.permissionCache.clear();
    this.accessibleModulesSubject.next([]);
  }
}
