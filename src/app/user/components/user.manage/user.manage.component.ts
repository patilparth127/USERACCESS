import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { AccessService } from '../../../core/services/access.service';

@Component({
  standalone: false,
  selector: 'app-user-manage',
  templateUrl: './user.manage.component.html',
})

export class UserManageComponent implements OnInit {
  users: any = [];
  searchData: string = '';
  blocks: any = [
    'Name',
    'Email',
    'Phone',
    'DOB',
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
      this.users = response.data.users;

    });
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
