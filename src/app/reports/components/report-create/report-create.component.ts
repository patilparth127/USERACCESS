import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-report-create',
    standalone: false,
  template: `
    <div class="container">
      <h2>{{ isEditMode ? 'Edit Report' : 'Create New Report' }}</h2>
      
      <div class="card">
        <div class="card-body">
          <form [formGroup]="reportForm" (ngSubmit)="onSubmit()">
            <div class="mb-3">
              <label for="name" class="form-label">Report Name</label>
              <input 
                type="text" 
                class="form-control" 
                id="name" 
                formControlName="name"
                [ngClass]="{'is-invalid': submitted && f['name'].errors}">
              <div *ngIf="submitted && f['name'].errors" class="invalid-feedback">
                <div *ngIf="f['name'].errors?.['required']">Report name is required</div>
              </div>
            </div>
            
            <div class="mb-3">
              <label for="type" class="form-label">Report Type</label>
              <select 
                class="form-control" 
                id="type" 
                formControlName="type"
                [ngClass]="{'is-invalid': submitted && f['type'].errors}">
                <option value="">Select a type</option>
                <option value="financial">Financial</option>
                <option value="operational">Operational</option>
                <option value="sales">Sales</option>
                <option value="marketing">Marketing</option>
                <option value="other">Other</option>
              </select>
              <div *ngIf="submitted && f['type'].errors" class="invalid-feedback">
                <div *ngIf="f['type'].errors?.['required']">Report type is required</div>
              </div>
            </div>
            
            <div class="mb-3">
              <label for="description" class="form-label">Description</label>
              <textarea 
                class="form-control" 
                id="description" 
                formControlName="description" 
                rows="3"
                [ngClass]="{'is-invalid': submitted && f['description'].errors}"></textarea>
              <div *ngIf="submitted && f['description'].errors" class="invalid-feedback">
                <div *ngIf="f['description'].errors?.['required']">Description is required</div>
              </div>
            </div>
            
            <div class="mb-3 form-check">
              <input 
                type="checkbox" 
                class="form-check-input" 
                id="isActive" 
                formControlName="isActive">
              <label class="form-check-label" for="isActive">Active</label>
            </div>
            
            <div class="d-flex justify-content-end">
              <button type="button" class="btn btn-secondary me-2" (click)="cancel()">Cancel</button>
              <button type="submit" class="btn btn-primary">{{ isEditMode ? 'Update' : 'Create' }}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class ReportCreateComponent implements OnInit {
  reportForm!: FormGroup;
  isEditMode = false;
  reportId: string | null = null;
  submitted = false;
  
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {}
  
  ngOnInit() {
    this.initForm();
    
    // Check if we're in edit mode
    this.reportId = this.route.snapshot.paramMap.get('id');
    if (this.reportId) {
      this.isEditMode = true;
      this.loadReportData(this.reportId);
    }
  }
  
  // Convenience getter for easy access to form fields
  get f() { 
    return this.reportForm.controls; 
  }
  
  initForm() {
    this.reportForm = this.fb.group({
      name: ['', Validators.required],
      type: ['', Validators.required],
      description: ['', Validators.required],
      isActive: [true]
    });
  }
  
  loadReportData(id: string) {
    // In a real app, you'd fetch the report from a service
    // Here we're just simulating with dummy data
    this.reportForm.patchValue({
      name: `Report #${id}`,
      type: 'financial',
      description: 'This is a sample report description for editing.',
      isActive: true
    });
  }
  
  onSubmit() {
    this.submitted = true;
    
    if (this.reportForm.invalid) {
      return;
    }
    
    const reportData = this.reportForm.value;
    console.log('Form submitted:', reportData);
    
    // In a real app, you'd send this data to a service
    
    if (this.isEditMode) {
      // Update existing report
      setTimeout(() => {
        alert('Report updated successfully!');
        this.router.navigate(['/reports/list']);
      }, 500);
    } else {
      // Create new report
      setTimeout(() => {
        alert('Report created successfully!');
        this.router.navigate(['/reports/list']);
      }, 500);
    }
  }
  
  cancel() {
    this.router.navigate(['/reports/list']);
  }
}
