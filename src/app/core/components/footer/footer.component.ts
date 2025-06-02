import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: false,
  template: `
    <footer class="bg-light py-3 mt-auto">
      <div class="container text-center">
        <p class="mb-0">&copy; {{currentYear}} RBAC Demo Application. All rights reserved.</p>
      </div>
    </footer>
  `
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}
