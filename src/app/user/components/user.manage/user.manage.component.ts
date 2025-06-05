import { Component, OnInit, AfterViewInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { AccessService } from '../../../core/services/access.service';

@Component({
  standalone: false,
  selector: 'app-user-manage',
  templateUrl: './user.manage.component.html',
})

export class UserManageComponent implements OnInit, AfterViewInit {
  users: any = [];
  searchData: string = '';
  blocks: any = [
    'Name',
    'Email',
    'Phone',
    'Department',
    'Status',
    'Created Date',
    'Action'
  ];

  canCreateUser = false;
  canUpdateUser = false;
  canDeleteUser = false;

  constructor(
    private userService: UserService,
    private accessService: AccessService
  ) { }
  ngAfterViewInit(): void {
    throw new Error('Method not implemented.');
  }
  ngOnInit(): void {
    this.getList();


    this.accessService.loadModulePermissions(['Users']).subscribe();


    this.accessService.hasPermission('User.CreateUser').subscribe(
      can => this.canCreateUser = can
    );

    this.accessService.hasPermission('User.UpdateUser').subscribe(
      can => this.canUpdateUser = can
    );

    this.accessService.hasPermission('User.DeleteUser').subscribe(
      can => this.canDeleteUser = can
    );
  }

  getList(): void {
    this.userService.getUsers().subscribe((response: any) => {
      // The users list is already filtered in the service to exclude super admin
      this.users = response.data.users;

      // Process users data to make it more readable
      this.users = this.users.map((user: any) => {
        return {
          ...user,
          // Format name if firstName/lastName exists, otherwise use name
          formattedName: user.firstName && user.lastName
            ? `${user.firstName} ${user.middleName ? user.middleName + ' ' : ''}${user.lastName}`
            : user.name,
          // Count permissions for display
          permissionCount: this.getTotalPermissions(user),
          // Get role info if available
          role: user.role ? user.role.name : 'User',
          // Ensure date format
          createdAt: user.created_at || user.createdAt,
          updatedAt: user.updated_at || user.updatedAt
        };
      });
    });
  }

  // Get total permissions count
  getTotalPermissions(user: any): number {
    let count = 0;
    if (user.permissions && Array.isArray(user.permissions)) {
      user.permissions.forEach((group: any) => {
        if (group.permissions && Array.isArray(group.permissions)) {
          count += group.permissions.length;
        }
      });
    }
    return count;
  }

  // Get time since last update
  getTimeSince(dateString: string): string {
    if (!dateString) return 'N/A';

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays > 30) {
      const diffMonths = Math.floor(diffDays / 30);
      return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
    } else if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    }

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    }

    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    if (diffMinutes > 0) {
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    }

    return 'Just now';
  }

  search(): void {
    if (this.searchData === '') {
      this.getList();
      return;
    }
    this.userService.searchUser(this.searchData).subscribe((response: any) => {
      this.users = response.data.users;
    });
  }

  confirmDelete(item: any): void {
    this.userService.deleteUser(item._id).subscribe({
      next: (res: any) => {
        this.getList();
      },
    });
  }
}
