import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserManageComponent } from './components/user.manage/user.manage.component';
import { UserAddComponent } from './components/user.add/user.add.component';
import { UserPermissionsComponent } from './components/user.permissions/user.permissions.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { PermissionGuard } from '../core/guards/permission.guard';
import { AuthGuard } from '../auth/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'manage'
  },
  {
    path: 'manage',
    component: UserManageComponent,
    canActivate: [PermissionGuard],
    data: { permission: 'User.ViewUsers' }
  },
  {
    path: 'add',
    component: UserAddComponent,
    canActivate: [PermissionGuard],
    data: { permission: 'User.CreateUser' }
  },
  {
    path: 'edit/:userId',
    component: UserAddComponent,
    canActivate: [PermissionGuard],
    data: { permission: 'User.UpdateUser' }
  },
  {
    path: 'permissions/:userId',
    component: UserPermissionsComponent,
    canActivate: [PermissionGuard],
    data: { permission: 'User.UpdateUser' }
  },
  {
    path: 'profile/:userId',
    component: UserProfileComponent,
    canActivate: [AuthGuard],
    data: { requiredPermission: 'User.ViewUsers' }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class UserRoutingModule { }
