import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { AccessService } from '../../../core/services/access.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss'
})
export class UserProfileComponent implements OnInit {
  userId: string = '';
  user: any | null = null;  // Explicitly make user nullable
  loading = true;
  canUpdateUser = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private message: NzMessageService,
    private accessService: AccessService
  ) { }

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('userId') || '';
    if (!this.userId) {
      this.router.navigate(['/users/manage']);
      return;
    }

    this.loadUserData();

    this.accessService.hasPermission('User.UpdateUser').subscribe(
      can => this.canUpdateUser = can
    );
  }

  loadUserData(): void {
    this.loading = true;
    this.userService.getUserById(this.userId).subscribe({
      next: (res: any) => {
        this.user = res.data.user;
        this.loading = false;
      },
      error: (err) => {
        this.message.error('Failed to fetch user: ' + err.message);
        this.router.navigate(['/users/manage']);
      }
    });
  }
}
