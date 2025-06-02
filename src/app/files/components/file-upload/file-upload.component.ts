import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-file-upload',
    standalone: false,
  template: `
    <div class="container">
      <h2>Upload File</h2>
      <form [formGroup]="uploadForm" (ngSubmit)="onSubmit()">
        <div class="mb-3">
          <label for="file" class="form-label">Select File</label>
          <input 
            type="file" 
            class="form-control" 
            id="file" 
            (change)="onFileChange($event)"
            required>
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
    private router: Router
  ) {
    this.uploadForm = this.fb.group({
      description: [''],
      category: ['', Validators.required]
    });
  }
  
  onFileChange(event: any) {
    if (event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }
  
  onSubmit() {
    if (this.uploadForm.valid && this.selectedFile) {
      // Here you would normally upload the file to your backend
      console.log('File to upload:', this.selectedFile);
      console.log('Form data:', this.uploadForm.value);
      
      // Navigate back to file list after successful upload
      this.router.navigate(['/files/list']);
    }
  }
  
  cancel() {
    this.router.navigate(['/files/list']);
  }
}
