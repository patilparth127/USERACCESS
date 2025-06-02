import { Injectable } from '@angular/core';
import { 
  CanActivate, 
  ActivatedRouteSnapshot, 
  RouterStateSnapshot, 
  Router 
} from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class PermissionGuard implements CanActivate {
  
  constructor(
    private authService: AuthService, 
    private router: Router
  ) {}
  
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    // Check if the route requires permissions
    const requiredPermission = route.data['permission'];
    
    if (!requiredPermission) {
      return true; // No permission required
    }
    
    // Check if the user has the required permission
    if (this.authService.hasPermission(requiredPermission)) {
      return true;
    }
    
    // If not authenticated or doesn't have permission, redirect to forbidden page
    this.router.navigate(['/forbidden']);
    return false;
  }
}
