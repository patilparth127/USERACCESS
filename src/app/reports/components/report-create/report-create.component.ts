import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ReportService } from '../../services/report.service';
import { Report } from '../../models/report.model';

@Component({
  selector: 'app-report-create',
  standalone: false,
  template: `
    <nav aria-label="breadcrumb" class="p-3">
      <ol class="breadcrumb">
        <li class="breadcrumb-item"><a routerLink="/home"><i class="bi bi-house-door"></i></a></li>
        <li class="breadcrumb-item"><a routerLink="/reports">Reports</a></li>
        <li class="breadcrumb-item active">{{ isEditMode ? 'Edit Report' : 'Create Report' }}</li>
      </ol>
    </nav>

    <div class="container">
      <h2>{{ isEditMode ? 'Edit Report' : 'Create New Report' }}</h2>

      <div class="card">
        <div class="card-body">
          <form [formGroup]="reportForm" (ngSubmit)="onSubmit()">
            <div class="row">
              <div class="col-md-6">
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
              </div>

              <div class="col-md-6">
                <div class="mb-3">
                  <label for="image" class="form-label">Report Image</label>
                  <input
                    type="file"
                    class="form-control"
                    id="image"
                    accept="image/*"
                    (change)="onImageChange($event)">
                  <small class="form-text text-muted">Upload an image for the report (optional)</small>
                </div>

                <div *ngIf="imagePreview" class="mb-3">
                  <label class="form-label">Preview:</label>
                  <div class="border rounded p-2 text-center">
                    <img [src]="imagePreview" alt="Preview" class="img-fluid" style="max-height: 200px;">
                  </div>
                </div>
              </div>
            </div>

            <div class="d-flex justify-content-end">
              <button type="button" class="btn btn-secondary me-2" (click)="cancel()">Cancel</button>
              <button type="submit" class="btn btn-primary" [disabled]="loading">
                <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
                {{ isEditMode ? 'Update' : 'Create' }}
              </button>
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
  loading = false;
  imagePreview: string | null = null;
  currentReport: Report | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private reportService: ReportService
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
    this.loading = true;
    this.reportService.getById(parseInt(id)).subscribe({
      next: (report) => {
        this.currentReport = report;
        this.reportForm.patchValue({
          name: report.name,
          type: report.type,
          description: report.description,
          isActive: report.isActive
        });
        if (report.image) {
          this.imagePreview = report.image;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading report:', error);
        this.loading = false;
        alert('Error loading report data');
      }
    });
  }

  async onImageChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      try {
        const base64 = await this.reportService.convertToBase64(file);
        this.imagePreview = base64;
      } catch (error) {
        console.error('Error converting image:', error);
        alert('Error processing image');
      }
    }
  }
  onSubmit() {
    this.submitted = true;

    if (this.reportForm.invalid) {
      return;
    }

    this.loading = true;

    const reportData = {
      ...this.reportForm.value,
      image: this.imagePreview
    };

    if (this.isEditMode && this.reportId && this.currentReport) {
      // Update existing report - merge with current data
      const updateData = {
        ...this.currentReport,
        ...reportData,
        id: this.currentReport.id
      };

      this.reportService.update(parseInt(this.reportId), updateData).subscribe({
        next: () => {
          alert('Report updated successfully!');
          this.router.navigate(['/reports/list']);
        },
        error: (error) => {
          console.error('Error updating report:', error);
          alert('Error updating report. Please try again.');
          this.loading = false;
        }
      });
    } else {
      // Create new report
      this.reportService.create(reportData).subscribe({
        next: () => {
          alert('Report created successfully!');
          this.router.navigate(['/reports/list']);
        },
        error: (error) => {
          console.error('Error creating report:', error);
          alert('Error creating report. Please try again.');
          this.loading = false;
        }
      });
    }
  }

  cancel() {
    this.router.navigate(['/reports/list']);
  }
}
