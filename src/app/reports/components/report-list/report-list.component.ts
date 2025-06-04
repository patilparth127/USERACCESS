import { Component, OnInit } from '@angular/core';
import { ReportService } from '../../services/report.service';
import { Report } from '../../models/report.model';

@Component({
  selector: 'app-report-list',
  standalone: false,
  templateUrl: './report-list.component.html'
})
export class ReportListComponent implements OnInit {
  reports: Report[] = [];
  canCreateReport = false;
  canUpdateReport = false;
  canDeleteReport = false;
  canViewReports = false;
  canViewReportDetail = false;
  loading = false;
  errorMessage = '';

  constructor(private reportService: ReportService) {}

  ngOnInit() {
    this.checkPermissions();
    this.loadReports();
  }

  checkPermissions() {
    const userData = JSON.parse(localStorage.getItem('current_user') || '{}');
    console.log('User Data:', userData);

    const reportPermissions = userData.permissions?.find((p: any) => p.moduleName === 'ReportManagement')?.permissions || [];

    this.canCreateReport = reportPermissions.includes('Report.CreateReport');
    this.canUpdateReport = reportPermissions.includes('Report.UpdateReport');
    this.canDeleteReport = reportPermissions.includes('Report.DeleteReport');
    this.canViewReports = reportPermissions.includes('Report.ViewReports');
    this.canViewReportDetail = reportPermissions.includes('Report.ViewReportDetail');

    console.log('Report Permissions:', {
      canCreate: this.canCreateReport,
      canUpdate: this.canUpdateReport,
      canDelete: this.canDeleteReport,
      canView: this.canViewReports,
      canViewDetail: this.canViewReportDetail,
      allPermissions: reportPermissions
    });
  }

  loadReports() {
    if (!this.canViewReports && !this.canViewReportDetail) {
      this.errorMessage = 'You do not have permission to view reports.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.reportService.list().subscribe({
      next: (reports) => {
        this.reports = reports;
        this.loading = false;
        console.log('Loaded reports:', reports);
      },
      error: (error) => {
        console.error('Error loading reports:', error);
        this.errorMessage = 'Failed to load reports. Please try again.';
        this.loading = false;
      }
    });
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
    if (!this.canDeleteReport || !confirm('Are you sure you want to delete this report?')) {
      return;
    }

    this.reportService.delete(id).subscribe({
      next: () => {
        this.reports = this.reports.filter(report => report.id !== id);
        alert('Report deleted successfully!');
      },
      error: (error) => {
        console.error('Error deleting report:', error);
        alert('Error deleting report. Please try again.');
      }
    });
  }
}
