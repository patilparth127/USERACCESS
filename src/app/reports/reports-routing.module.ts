import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReportListComponent } from './components/report-list/report-list.component';
import { ReportCreateComponent } from './components/report-create/report-create.component';
import { ReportDetailComponent } from './components/report-detail/report-detail.component';
import { PermissionGuard } from '../core/guards/permission.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full'
  },
  {
    path: 'list',
    component: ReportListComponent,
    canActivate: [PermissionGuard],
    data: { permission: 'Report.ViewReports' }
  },
  {
    path: 'new',
    component: ReportCreateComponent,
    canActivate: [PermissionGuard],
    data: { permission: 'Report.CreateReport' }
  },
  {
    path: ':id',
    component: ReportDetailComponent,
    canActivate: [PermissionGuard],
    data: { permission: 'Report.ViewReportDetail' }
  },
  {
    path: ':id/edit',
    component: ReportCreateComponent,
    canActivate: [PermissionGuard],
    data: { permission: 'Report.UpdateReport' }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportsRoutingModule { }
