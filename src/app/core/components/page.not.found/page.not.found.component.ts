import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-page-not-found',
  standalone: false,
  template: `
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-6 text-center">
          <h1 class="display-1">404</h1>
          <h2>Page Not Found</h2>
          <p class="lead">The page you are looking for does not exist.</p>
          <button class="btn btn-primary" (click)="goBack()">Go Back</button>
          <button class="btn btn-secondary ms-2" (click)="goHome()">Go Home</button>
        </div>
      </div>
    </div>
  `
})
export class PageNotFoundComponent {
  constructor(private router: Router) {}
  
  goBack() {
    window.history.back();
  }
  
  goHome() {
    this.router.navigate(['/home']);
  }
}
