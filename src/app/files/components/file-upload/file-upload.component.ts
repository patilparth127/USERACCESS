import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FileService } from '../../services/file.service';
import { FileRecord } from '../../models/file.model';

@Component({
  selector: 'app-file-upload',
    standalone: false,
  template: `
    <div class="container">
      <h2>Upload File</h2>
      <form [formGroup]="uploadForm" (ngSubmit)="onSubmit()">        <div class="mb-3">
          <label for="file" class="form-label">Select File</label>
          <input
            type="file"
            class="form-control"
            id="file"
            (change)="onFileChange($event)"
            required>
          <div class="form-text">Maximum file size: 50KB</div>
        </div>
        <div class="mb-3">
          <label for="description" class="form-label">Description</label>
          <textarea
            class="form-control"
            id="description"
            formControlName="description"
            rows="3"></textarea>
        </div>
        <div class="mb-3">
          <label for="category" class="form-label">Category</label>
          <select class="form-control" id="category" formControlName="category">
            <option value="">Select Category</option>
            <option value="documents">Documents</option>
            <option value="images">Images</option>
            <option value="presentations">Presentations</option>
            <option value="spreadsheets">Spreadsheets</option>
            <option value="other">Other</option>
          </select>
        </div>
        <button type="submit" class="btn btn-primary" [disabled]="!selectedFile || uploadForm.invalid">Upload</button>
        <button type="button" class="btn btn-secondary ms-2" (click)="cancel()">Cancel</button>
      </form>
    </div>
  `
})
export class FileUploadComponent {
  uploadForm: FormGroup;
  selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private fileService: FileService,
    private router: Router
  ) {
    this.uploadForm = this.fb.group({
      description: [''],
      category: ['', Validators.required]
    });
  }
  onFileChange(event: any) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      const maxSizeInBytes = 50 * 1024;

      if (file.size > maxSizeInBytes) {
        alert('File size must be less than 50KB. Please select a smaller file.');
        event.target.value = '';
        this.selectedFile = null;
        return;
      }

      this.selectedFile = file;
    }
  }

  onSubmit() {
    if (this.uploadForm.valid && this.selectedFile) {
      const reader = new FileReader();
      reader.onload = () => {
        const content = reader.result as string;
        const record: FileRecord = {
          name: this.selectedFile!.name,
          size: this.selectedFile!.size,
          type: this.selectedFile!.type,
          uploadedAt: new Date().toISOString(),
          description: this.uploadForm.value.description,
          category: this.uploadForm.value.category,
          content
        };
        this.fileService.create(record).subscribe(() => this.router.navigate(['/files/list']));
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  cancel() {
    this.router.navigate(['/files/list']);
  }
}
