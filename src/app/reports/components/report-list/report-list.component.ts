import { Component, OnInit } from '@angular/core';
import { AccessService } from '../../../core/services/access.service';

@Component({
  selector: 'app-report-list',
    standalone: false,
  template: `
    <div class="container">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>Reports</h2>
        <button 
          class="btn btn-primary" 
          routerLink="/reports/new"
          *ngIf="canCreateReport">Create Report</button>
      </div>
      
      <div class="table-responsive">
        <table class="table table-striped">
          <thead>
            <tr>
              <th>Name</th>
              <th>Created Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let report of reports">
              <td>{{ report.name }}</td>
              <td>{{ report.createdAt | date }}</td>
              <td>
                <span class="badge" [ngClass]="getStatusClass(report.status)">
                  {{ report.status }}
                </span>
              </td>
              <td>
                <button 
                  class="btn btn-sm btn-info me-2" 
                  [routerLink]="['/reports', report.id]">View</button>
                <button 
                  class="btn btn-sm btn-primary me-2" 
                  [routerLink]="['/reports', report.id, 'edit']"
                  *ngIf="canUpdateReport">Edit</button>
                <button 
                  class="btn btn-sm btn-danger" 
                  (click)="deleteReport(report.id)"
                  *ngIf="canDeleteReport">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class ReportListComponent implements OnInit {
  reports = [
    { id: 1, name: 'Monthly Sales Report', createdAt: new Date(), status: 'Active' },
    { id: 2, name: 'Customer Feedback Analysis', createdAt: new Date(), status: 'Draft' },
    { id: 3, name: 'Inventory Status', createdAt: new Date(), status: 'Active' },
    { id: 4, name: 'Employee Performance', createdAt: new Date(), status: 'Archived' }
  ];
  
  canCreateReport = false;
  canUpdateReport = false;
  canDeleteReport = false;
  
  constructor(private accessService: AccessService) {}
  
  ngOnInit() {
    // Load permissions for this module
    this.accessService.loadModulePermissions(['Reports']).subscribe();
    
    // Check individual permissions
    this.accessService.hasPermission('Reports.CreateReport').subscribe(
      can => this.canCreateReport = can
    );
    
    this.accessService.hasPermission('Reports.UpdateReport').subscribe(
      can => this.canUpdateReport = can
    );
    
    this.accessService.hasPermission('Reports.DeleteReport').subscribe(
      can => this.canDeleteReport = can
    );
  }
  
  getStatusClass(status: string) {
    switch (status) {
      case 'Active': return 'bg-success';
      case 'Draft': return 'bg-warning';
      case 'Archived': return 'bg-secondary';
      default: return 'bg-info';
    }
  }
  
  deleteReport(id: number) {
    // In a real app, call service to delete
    this.reports = this.reports.filter(report => report.id !== id);
  }
}
