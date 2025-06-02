import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserRoutingModule } from './user-routing.module';
import { UserManageComponent } from './components/user.manage/user.manage.component';
import { UserAddComponent } from './components/user.add/user.add.component';
import { UserPermissionsComponent } from './components/user.permissions/user.permissions.component';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    UserManageComponent,
    UserAddComponent,
    UserPermissionsComponent
  ],

  imports: [
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    UserRoutingModule
  ]
})

export class UserModule { }
