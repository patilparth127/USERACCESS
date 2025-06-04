import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FileListComponent } from './components/file-list/file-list.component';
import { FileUploadComponent } from './components/file-upload/file-upload.component';
import { PermissionGuard } from '../core/guards/permission.guard';

const routes: Routes = [
  {
    path: '',
    component: FileListComponent,
    canActivate: [PermissionGuard],
    data: { permission: 'File.ViewFiles' }
  },
  {
    path: 'list',
    component: FileListComponent,
    canActivate: [PermissionGuard],
    data: { permission: 'File.ViewFiles' }
  },
  {
    path: 'upload',
    component: FileUploadComponent,
    canActivate: [PermissionGuard],
    data: { permission: 'File.UploadFile' }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FilesRoutingModule { }
