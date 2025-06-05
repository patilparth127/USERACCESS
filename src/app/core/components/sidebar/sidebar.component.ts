import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';

interface SidenavItem {
  label: string;
  iconName: string;
  link: string;
  permission?: string;
  child: {
    label: string;
    link: string;
    iconName: string;
    permission?: string;
    selected?: boolean;
  }[];
  selected?: boolean;
}

@Component({
    standalone: false,
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  @Input() isCollapsed: boolean = false;
  @Input() menuItems: SidenavItem[] = [];
  @Output() toggleSidebar = new EventEmitter<boolean>();

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  toggle(forceClose = false): void {
    this.toggleSidebar.emit(forceClose);
  }

  hasPermissionForMenuItem(item: SidenavItem | { permission?: string }): boolean {
    if (!item.permission) {
      return true;
    }

    const result = this.authService.hasPermission(item.permission);
    return result;
  }
}
