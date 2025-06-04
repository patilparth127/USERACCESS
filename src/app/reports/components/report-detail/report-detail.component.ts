import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReportService } from '../../services/report.service';
import { Report } from '../../models/report.model';

@Component({
  selector: 'app-report-detail',
  standalone: false,
  template: `
    <nav aria-label="breadcrumb" class="p-3">
      <ol class="breadcrumb">
        <li class="breadcrumb-item"><a routerLink="/home"><i class="bi bi-house-door"></i></a></li>
        <li class="breadcrumb-item"><a routerLink="/reports">Reports</a></li>
        <li class="breadcrumb-item active">Report Details</li>
      </ol>
    </nav>

    <div class="container">
      <h2>Report Details</h2>

      <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h3>{{report.name}}</h3>
          <div>
            <button
              class="btn btn-primary me-2"
              [routerLink]="['/reports', report.id, 'edit']"
              *ngIf="canUpdateReport">Edit</button>
            <button class="btn btn-secondary" (click)="goBack()">Back</button>
          </div>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-8">
              <div class="mb-3">
                <strong>Type:</strong> {{ report.type }}
              </div>
              <div class="mb-3">
                <strong>Status:</strong> <span class="badge" [ngClass]="getStatusClass()">{{report.status}}</span>
              </div>
              <div class="mb-3">
                <strong>Created Date:</strong> {{report.createdAt | date:'medium'}}
              </div>
              <div class="mb-3">
                <strong>Description:</strong>
                <p>{{ report.description }}</p>
              </div>
              <div class="mb-3">
                <strong>Active Status:</strong>
                <span class="badge" [ngClass]="report.isActive ? 'bg-success' : 'bg-danger'">
                  {{ report.isActive ? 'Active' : 'Inactive' }}
                </span>
              </div>
            </div>
            <div class="col-md-4" *ngIf="report.image">
              <div class="mb-3">
                <strong>Report Image:</strong>
                <div class="border rounded p-2 text-center">
                  <img [src]="report.image" alt="Report Image" class="img-fluid" style="max-height: 300px;">
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ReportDetailComponent implements OnInit {
  report: Report = {
    id: 0,
    name: 'Loading...',
    type: '',
    description: '',
    status: 'Draft',
    isActive: false,
    createdAt: ''
  };

  canUpdateReport = false;
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private reportService: ReportService
  ) {}

  ngOnInit() {
    this.checkPermissions();
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.loadReportData(parseInt(id));
    }
  }
  checkPermissions() {
    const userData = JSON.parse(localStorage.getItem('current_user') || '{}');
    const reportPermissions = userData.permissions?.find((p: any) => p.moduleName === 'ReportManagement')?.permissions || [];

    this.canUpdateReport = reportPermissions.includes('Report.UpdateReport');
  }

  loadReportData(id: number) {
    this.loading = true;
    this.reportService.getById(id).subscribe({
      next: (report) => {
        this.report = report;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading report:', error);
        this.loading = false;
        alert('Error loading report data');
      }
    });
  }

  getStatusClass() {
    switch (this.report.status) {
      case 'Active': return 'bg-success';
      case 'Draft': return 'bg-warning';
      case 'Archived': return 'bg-secondary';
      default: return 'bg-info';
    }
  }

  goBack() {
    this.router.navigate(['/reports/list']);
  }
}
