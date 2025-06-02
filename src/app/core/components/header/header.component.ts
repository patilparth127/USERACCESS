import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit {
  isLoggedIn = false;
  user: any = null;
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Subscribe to auth changes
    this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
      this.user = user;
    });
  }

  logout(): void {
    this.authService.logout();
  }
  
  isSelected(route: string): boolean {
    return this.router.url.startsWith(route);
  }
  
  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
  
  isAdmin(): boolean {
    return this.authService.isAdmin();
  }
}
