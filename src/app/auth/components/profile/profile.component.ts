import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
    standalone: false,
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {
  user: any = null;
  
  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
    });
  }
}
