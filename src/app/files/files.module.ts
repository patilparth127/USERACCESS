import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { FileListComponent } from './components/file-list/file-list.component';
import { FileUploadComponent } from './components/file-upload/file-upload.component';
import { CoreModule } from '../core/core.module';

const routes: Routes = [
  { path: '', component: FileListComponent },
  { path: 'upload', component: FileUploadComponent }
];

@NgModule({
  declarations: [
    FileListComponent,
    FileUploadComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
  ],
  exports: [RouterModule]
})
export class FilesModule { }
