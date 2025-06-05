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

    const requiredPermission = route.data['permission'];

    if (!requiredPermission) {
      return true;
    }


    if (this.authService.hasPermission(requiredPermission)) {
      return true;
    }


    this.router.navigate(['/forbidden']);
    return false;
  }
}
