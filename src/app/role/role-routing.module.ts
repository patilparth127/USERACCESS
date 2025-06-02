import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleManageComponent } from './components/role.manage/role.manage.component';
import { RoleAddComponent } from './components/role.add/role.add.component';
import { PermissionGuard } from '../core/guards/permission.guard';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'manage'
  },
  {
    path: 'manage',
    component: RoleManageComponent,
    canActivate: [PermissionGuard],
    data: { permission: 'Roles.ViewRoles' }
  },
  {
    path: 'add',
    component: RoleAddComponent,
    canActivate: [PermissionGuard],
    data: { permission: 'Roles.CreateRole' }
  },
  {
    path: 'edit/:roleId',
    component: RoleAddComponent,
    canActivate: [PermissionGuard],
    data: { permission: 'Roles.UpdateRole' }
  }    
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class RoleRoutingModule { }
