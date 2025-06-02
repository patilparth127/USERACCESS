import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AccessService } from '../../../core/services/access.service';

@Component({
  selector: 'app-report-detail',
    standalone: false,
  template: `
    <div class="container">
      <h2>Report Details</h2>
      
      <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h3>{{report.name}}</h3>
          <div>
            <button 
              class="btn btn-primary me-2" 
              [routerLink]="['/', 'reports', report.id, 'edit']"
              *ngIf="canUpdateReport">Edit</button>
            <button class="btn btn-danger" (click)="goBack()">Back</button>
          </div>
        </div>
        <div class="card-body">
          <div class="mb-3">
            <strong>Status:</strong> <span class="badge" [ngClass]="getStatusClass()">{{report.status}}</span>
          </div>
          <div class="mb-3">
            <strong>Created Date:</strong> {{report.createdAt | date:'medium'}}
          </div>
          <div class="mb-3">
            <strong>Description:</strong>
            <p>This is a detailed description of the report and its findings. The content would be dynamically loaded from the API in a real application.</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ReportDetailComponent implements OnInit {
  report = {
    id: 1,
    name: 'Loading...',
    createdAt: new Date(),
    status: 'Active'
  };
  
  canUpdateReport = false;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private accessService: AccessService
  ) {}
  
  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    
    // In a real app, you would fetch the report from a service
    // Here we're just simulating it with static data
    if (id) {
      this.report = {
        id: parseInt(id),
        name: `Report #${id}`,
        createdAt: new Date(),
        status: ['Active', 'Draft', 'Archived'][Math.floor(Math.random() * 3)]
      };
    }
    
    // Check permissions
    this.accessService.hasPermission('Reports.UpdateReport').subscribe(
      can => this.canUpdateReport = can
    );
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
