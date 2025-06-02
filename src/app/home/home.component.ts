import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../auth/services/auth.service';

@Component({
  selector: 'app-home',
  standalone: false,
  template: `
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-8 text-center">
          <h1 class="my-4">Welcome to the Role-Based Access Control System</h1>
          
          <div class="card mb-4">
            <div class="card-body">
              <p class="lead">
                This application demonstrates how to implement role-based access control in Angular.
              </p>
              
              <div *ngIf="isAuthenticated; else loginPrompt">
                <p>You're currently logged in.</p>
                <button class="btn btn-primary me-2" routerLink="/users/manage" *ngIf="isAdmin">Manage Users</button>
                <button class="btn btn-primary me-2" routerLink="/roles/manage" *ngIf="isAdmin">Manage Roles</button>
              </div>
              
              <ng-template #loginPrompt>
                <p>Please log in to access the system.</p>
                <button class="btn btn-primary" routerLink="/auth/login">Login</button>
              </ng-template>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class HomeComponent implements OnInit {
  isAuthenticated = false;
  isAdmin = false;
  
  constructor(private authService: AuthService) {}
  
  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.isAuthenticated = !!user;
      this.isAdmin = this.authService.isAdmin();
    });
  }
}
