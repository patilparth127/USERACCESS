import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styles: [`
    .profile-header {
      background-color: #f8f9fa;
      padding: 2rem 0;
      margin-bottom: 2rem;
    }
    .profile-avatar {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      background-color: #6c757d;
      color: white;
      font-size: 3rem;
      display: flex;
      justify-content: center;
      align-items: center;
      margin: 0 auto 1rem;
    }
    .info-card {
      transition: all 0.3s ease;
    }
    .info-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    }
  `]
})
export class ProfileComponent implements OnInit {
  user: any = null;
  loading = true;

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.user = this.authService.currentUserValue;
    this.loading = false;
  }

  getInitials(): string {
    if (!this.user) return '?';

    let initials = '';
    if (this.user.firstName) {
      initials += this.user.firstName.charAt(0);
    }
    if (this.user.lastName) {
      initials += this.user.lastName.charAt(0);
    }

    if (!initials && this.user.name) {
      const nameParts = this.user.name.split(' ');
      if (nameParts.length > 0) initials += nameParts[0].charAt(0);
      if (nameParts.length > 1) initials += nameParts[1].charAt(0);
    }

    return initials || '?';
  }

  getTotalPermissions(): number {
    if (!this.user || !this.user.permissions) return 0;

    let count = 0;
    this.user.permissions.forEach((group: any) => {
      if (group.permissions && Array.isArray(group.permissions)) {
        count += group.permissions.length;
      }
    });

    return count;
  }
}
