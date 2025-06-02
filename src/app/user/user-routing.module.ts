import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserManageComponent } from './components/user.manage/user.manage.component';
import { UserAddComponent } from './components/user.add/user.add.component';
import { UserPermissionsComponent } from './components/user.permissions/user.permissions.component';
import { PermissionGuard } from '../core/guards/permission.guard';

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
    data: { permission: 'Users.ViewUsers' }
  },
  {
    path: 'add',
    component: UserAddComponent,
    canActivate: [PermissionGuard],
    data: { permission: 'Users.CreateUser' }
  },
  {
    path: 'edit/:userId',
    component: UserAddComponent,
    canActivate: [PermissionGuard],
    data: { permission: 'Users.UpdateUser' }
  },
  {
    path: 'permissions/:userId',
    component: UserPermissionsComponent,
    canActivate: [PermissionGuard],
    data: { permission: 'Users.UpdateUser' }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class UserRoutingModule { }
