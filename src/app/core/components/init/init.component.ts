import { Component, OnInit } from '@angular/core';
import { SUPER_ADMIN_USER } from '../../mocks/super-admin.mock';

@Component({
  selector: 'app-init',
  template: '',
  standalone: false
})
export class InitComponent implements OnInit {

  ngOnInit(): void {
    this.initializeSuperAdmin();
  }

  private initializeSuperAdmin(): void {
    // Check if super admin exists in localStorage
    const existingUsers = localStorage.getItem('users');
    let users = existingUsers ? JSON.parse(existingUsers) : [];

    // Check if super admin already exists
    const superAdminExists = users.some((u: any) =>
      u.email === 'admin@system.com' || u.isSuperAdmin === true
    );

    if (!superAdminExists) {
      // Add super admin to users
      users.push(SUPER_ADMIN_USER);
      localStorage.setItem('users', JSON.stringify(users));
      console.log('Super admin user initialized');
    }
  }
}
