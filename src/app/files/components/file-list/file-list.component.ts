import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../auth/services/auth.service';
import { FileService } from '../../services/file.service';
import { FileRecord } from '../../models/file.model';

@Component({
  selector: 'app-file-list',
  templateUrl: './file-list.component.html'
})
export class FileListComponent implements OnInit {
  files: FileRecord[] = [];
  canUploadFile = false;
  canDeleteFile = false;

  constructor(
    private authService: AuthService,
    private fileService: FileService
  ) {}
    ngOnInit() {
    // Check individual permissions
    this.canUploadFile = this.authService.hasPermission('File.UploadFile');
    this.canDeleteFile = this.authService.hasPermission('File.DeleteFile');
    this.loadFiles();
  }

  loadFiles() {
    this.fileService.list().subscribe(data => this.files = data);
  }

  deleteFile(id?: number) {
    if (id == null) {
      return;
    }
    this.fileService.delete(id)
      .subscribe(() => this.files = this.files.filter(file => file.id !== id));
  }

  downloadFile(file: FileRecord) {
    const link = document.createElement('a');
    link.href = file.content;
    link.download = file.name;
    link.click();
  }
}
