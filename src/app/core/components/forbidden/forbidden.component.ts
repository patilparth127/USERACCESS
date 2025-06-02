import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forbidden',
  templateUrl: './forbidden.component.html'
})
export class ForbiddenComponent {
  constructor(private router: Router) {}

  goBack() {
    window.history.back();
  }
}
