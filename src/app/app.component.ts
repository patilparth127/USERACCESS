import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from './auth/services/auth.service';
import { filter } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';

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
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  isCollapsed = false;
  isAuthenticated = false;
  isLoading$ = new BehaviorSubject<boolean>(false);

  // Simplified sidebar navigation
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
      permission: 'File.ViewFiles',
      child: [
        // { label: 'Browse Files', link: '/files/list', iconName: 'list', permission: 'File.ViewFiles' },
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
    // Check authentication status
    this.authService.currentUser$.subscribe(user => {
      this.isAuthenticated = !!user;

      // Only initialize sidebar if authenticated
      if (this.isAuthenticated) {
        this.updateMenuVisibility();
      }
    });

    // Update selected state on route change
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.updateSelectedState();
    });
  }

  toggleCollapsed(event: any): void {
    this.isCollapsed = !this.isCollapsed;
  }  updateMenuVisibility(): void {
    console.log('Updating menu visibility');

    // Filter menu items based on permissions
    this.visibleMenuItems = this.SIDENAV_ITEMS.map(item => {
      // Home is always visible
      if (item.link === '/home') {
        return { ...item, child: [...item.child] };
      }

      // For others, check based on module path
      const modulePath = item.link.split('/')[1]; // Get the first part of the path
      if (!modulePath) return null;

      // Map path to permission module name
      const moduleMap: Record<string, string> = {
        users: 'UserManagement',
        reports: 'ReportManagement',
        files: 'FileManagement'
      };
      const moduleName = moduleMap[modulePath] || modulePath.charAt(0).toUpperCase() + modulePath.slice(1);
      console.log(`Checking access for menu item: ${item.label}, module: ${moduleName}`);      // Check if user has access to this module
      const hasModuleAccess = this.authService.hasModuleAccess(moduleName);
      console.log(`Module access for ${moduleName}: ${hasModuleAccess}`);

      if (!hasModuleAccess) {
        return null;
      }

      // Also check specific permission for the parent item if it has one
      let hasParentPermission = true;
      if (item.permission) {
        hasParentPermission = this.authService.hasPermission(item.permission);
        console.log(`Parent item ${item.label} permission ${item.permission}: ${hasParentPermission}`);
      }

      // Create a copy of the item to avoid modifying the original
      const itemCopy: SidenavItem = {
        ...item,
        child: []
      };

      // Filter child items based on specific permissions
      if (item.child && item.child.length > 0) {
        itemCopy.child = item.child.filter(child => {
          // If no specific permission is required, show the child item
          if (!child.permission) return true;

          // Otherwise check the specific permission
          const hasPermission = this.authService.hasPermission(child.permission);
          console.log(`Child item ${child.label} permission ${child.permission}: ${hasPermission}`);
          return hasPermission;
        });
      }

      // Show the parent item if:
      // 1. User has module access AND
      // 2. User has parent permission (if required) AND
      // 3. Either has no children OR has at least one visible child
      const shouldShow = hasModuleAccess && hasParentPermission &&
                        (item.child.length === 0 || itemCopy.child.length > 0);
      console.log(`Should show ${item.label}: ${shouldShow}, module access: ${hasModuleAccess}, parent permission: ${hasParentPermission}, visible children: ${itemCopy.child.length}`);

      return shouldShow ? itemCopy : null;
    }).filter((item): item is SidenavItem => item !== null);

    // Update selected state
    this.updateSelectedState();

    console.log('Visible menu items:', this.visibleMenuItems);
  }

  updateSelectedState(): void {
    const currentUrl = this.router.url;

    this.visibleMenuItems.forEach(item => {
      // Check if current URL starts with this item's link path
      item.selected = currentUrl === item.link ||
                     (item.link !== '/home' && currentUrl.startsWith(item.link));

      // Also check child items
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
      return true; // No permission required
    }

    return this.authService.hasPermission(item.permission);
  }
}
