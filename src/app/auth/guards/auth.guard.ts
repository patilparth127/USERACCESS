import { Injectable } from '@angular/core';
import { 
  CanActivate, 
  CanActivateChild, 
  ActivatedRouteSnapshot, 
  RouterStateSnapshot, 
  Router 
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}
  
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    if (this.authService.isAuthenticated()) {
      // Check if route has admin restriction
      const adminOnly = route.data['adminOnly'];
      
      if (adminOnly && !this.authService.isAdmin()) {
        // Redirect to home if user is not an admin
        this.router.navigate(['/home']);
        return false;
      }
      
      return true;
    } else {
      // Store the attempted URL for redirecting
      const returnUrl = state.url;
      
      // Navigate to the login page with extras
      this.router.navigate(['/auth/login'], { 
        queryParams: { returnUrl } 
      });
      
      return false;
    }
  }
  
  canActivateChild(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.canActivate(route, state);
  }
}
