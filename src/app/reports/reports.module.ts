import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ReportsRoutingModule } from './reports-routing.module';
import { ReportListComponent } from './components/report-list/report-list.component';
// import { ReportCreateComponent } from './components/report-create/report-create.component';
import { ReportDetailComponent } from './components/report-detail/report-detail.component';
import { ReportCreateComponent } from './components/report-create/report-create.component';



@NgModule({
  declarations: [
    ReportListComponent,
    ReportCreateComponent,
    ReportDetailComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ReportsRoutingModule,
  ]
})
export class ReportsModule { }
