import { NgModule } from '@angular/core';
import { Routes, RouterModule, ExtraOptions } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { PageNotFoundComponent } from './core/components/page.not.found/page.not.found.component';
import { ForbiddenComponent } from './core/components/forbidden/forbidden.component';
import { PermissionGuard } from './core/guards/permission.guard';
import { AuthGuard } from './auth/guards/auth.guard';

// Router options to ensure we scroll to top on navigation
const routerOptions: ExtraOptions = {
  scrollPositionRestoration: 'enabled',
  anchorScrolling: 'enabled',
  scrollOffset: [0, 64] // [x, y] - Adjust based on your header height
};

const routes: Routes = [
  { 
    path: '', 
    redirectTo: 'auth/login', 
    pathMatch: 'full' 
  },
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then(m => m.HomeModule)
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'users',
    loadChildren: () => import('./user/user.module').then(m => m.UserModule),
    canActivate: [AuthGuard],
    data: { permission: 'Users.ViewUsers' }
  },
  {
    path: 'roles',
    loadChildren: () => import('./role/role.module').then(m => m.RoleModule),
    canActivate: [AuthGuard],
    data: { permission: 'Roles.ViewRoles' }
  },
  {
    path: 'reports',
    loadChildren: () => import('./reports/reports.module').then(m => m.ReportsModule),
    canActivate: [PermissionGuard],
    data: { permission: 'Reports.ViewReports' }
  },
  {
    path: 'files',
    loadChildren: () => import('./files/files.module').then(m => m.FilesModule),
    canActivate: [PermissionGuard],
    data: { permission: 'Files.ViewFiles' }
  },
  {
    path: 'settings',
    loadChildren: () => import('./settings/settings.module').then(m => m.SettingsModule),
    canActivate: [PermissionGuard],
    data: { permission: 'Settings.ViewSettings' }
  },
  {
    path: 'forbidden',
    component: ForbiddenComponent
  },
  {
    path: '**',
    component: PageNotFoundComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, routerOptions)],
  exports: [RouterModule]
})

export class AppRoutingModule { }
