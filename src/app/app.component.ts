import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from './auth/services/auth.service';
import { filter } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import { InitComponent } from './core/components/init/init.component';
import { SUPER_ADMIN_USER } from './core/mocks/super-admin.mock';

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
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: false
})
export class AppComponent implements OnInit {
  isCollapsed = false;
  isAuthenticated = false;
  isLoading$ = new BehaviorSubject<boolean>(false);

  SIDENAV_ITEMS: SidenavItem[] = [
    {
      label: 'Home',
      iconName: 'house',
      link: '/home',
      child: []
    },
    {
      label: 'Users',
      iconName: 'people',
      link: '/users',
      permission: 'User.ViewUsers',
      child: [
        { label: 'Manage Users', link: '/users/manage', iconName: 'list', permission: 'User.ViewUsers' },
        { label: 'Add User', link: '/users/add', iconName: 'person-plus', permission: 'User.CreateUser' }
      ]
    },
    {
      label: 'Reports',
      iconName: 'file-earmark-bar-graph',
      link: '/reports',
      permission: 'Report.ViewReports',
      child: [
        { label: 'View Reports', link: '/reports/list', iconName: 'list', permission: 'Report.ViewReports' },
        { label: 'Create Report', link: '/reports/new', iconName: 'plus-square', permission: 'Report.CreateReport' }
      ]
    },
    {
      label: 'Files',
      iconName: 'folder',
      link: '/files',
      permission: 'File.ViewFiles',      child: [
        { label: 'Upload File', link: '/files/upload', iconName: 'upload', permission: 'File.UploadFile' }
      ]
    }
  ];

  visibleMenuItems: SidenavItem[] = [];

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}
  ngOnInit(): void {
    // This will ensure the InitComponent is created and runs its initialization
    const initComponent = new InitComponent();
    initComponent.ngOnInit();

    this.authService.currentUser$.subscribe(user => {
      this.isAuthenticated = !!user;

      if (this.isAuthenticated) {
        this.updateMenuVisibility();
      }
    });

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.updateSelectedState();
    });

    // Initialize super admin directly here
    this.initializeSuperAdmin();
  }

  toggleCollapsed(event: any): void {
    this.isCollapsed = !this.isCollapsed;
  }  updateMenuVisibility(): void {
    this.visibleMenuItems = this.SIDENAV_ITEMS.map(item => {
      if (item.link === '/home') {
        return { ...item, child: [...item.child] };
      }

      const modulePath = item.link.split('/')[1];
      if (!modulePath) return null;

      const moduleMap: Record<string, string> = {
        users: 'UserManagement',
        reports: 'ReportManagement',
        files: 'FileManagement'
      };
      const moduleName = moduleMap[modulePath] || modulePath.charAt(0).toUpperCase() + modulePath.slice(1);

      const hasModuleAccess = this.authService.hasModuleAccess(moduleName);

      if (!hasModuleAccess) {
        return null;
      }

      let hasParentPermission = true;
      if (item.permission) {
        hasParentPermission = this.authService.hasPermission(item.permission);
      }

      const itemCopy: SidenavItem = {
        ...item,
        child: []
      };

      if (item.child && item.child.length > 0) {
        itemCopy.child = item.child.filter(child => {
          if (!child.permission) return true;
          return this.authService.hasPermission(child.permission);
        });
      }

      const shouldShow = hasModuleAccess && hasParentPermission &&
                        (item.child.length === 0 || itemCopy.child.length > 0);

      return shouldShow ? itemCopy : null;
    }).filter((item): item is SidenavItem => item !== null);

    this.updateSelectedState();
  }

  updateSelectedState(): void {
    const currentUrl = this.router.url;

    this.visibleMenuItems.forEach(item => {
      item.selected = currentUrl === item.link ||
                     (item.link !== '/home' && currentUrl.startsWith(item.link));

      item.child.forEach(child => {
        child.selected = currentUrl === child.link;
      });
    });
  }

  logout(): void {
    this.authService.logout();
  }

  hasPermissionForMenuItem(item: SidenavItem | { permission?: string }): boolean {
    if (!item.permission) {
      return true;
    }

    return this.authService.hasPermission(item.permission);
  }

  getStaticMenuItems(): any[] {
    return [
      {
        label: 'Profile',
        iconName: 'person',
        link: '/auth/profile',
        children: []
      },
      ...this.SIDENAV_ITEMS
    ];
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
