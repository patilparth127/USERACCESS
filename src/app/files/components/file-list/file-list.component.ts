import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-file-list',
  templateUrl: './file-list.component.html'
})
export class FileListComponent implements OnInit {
  files = [
    { id: 1, name: 'document.pdf', size: 245, type: 'PDF', uploadedAt: new Date() },
    { id: 2, name: 'image.jpg', size: 1024, type: 'Image', uploadedAt: new Date() },
    { id: 3, name: 'spreadsheet.xlsx', size: 522, type: 'Excel', uploadedAt: new Date() }
  ];
  
  canUploadFile = false;
  canDeleteFile = false;
  
  constructor(private authService: AuthService) {}
  
  ngOnInit() {
    // Check individual permissions
    this.canUploadFile = this.authService.hasPermission('Files.UploadFile');
    this.canDeleteFile = this.authService.hasPermission('Files.DeleteFile');
  }
  
  deleteFile(id: number) {
    this.files = this.files.filter(file => file.id !== id);
  }
}
