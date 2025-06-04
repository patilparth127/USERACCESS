import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Report, CreateReportRequest, UpdateReportRequest } from '../models/report.model';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private apiUrl = 'http://localhost:3000/reports';

  constructor(private http: HttpClient) {}
  // Get all reports
  list(): Observable<Report[]> {
    return this.http.get<Report[]>(this.apiUrl);
  }

  // Get report by ID
  getById(id: number): Observable<Report> {
    return this.http.get<Report>(`${this.apiUrl}/${id}`);
  }

  // Create new report
  create(report: CreateReportRequest): Observable<Report> {
    const reportData = {
      ...report,
      status: 'Draft' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<Report>(this.apiUrl, reportData, { headers });
  }
  // Update existing report - Use PUT for full update
  update(id: number, report: UpdateReportRequest): Observable<Report> {
    const updateData = {
      ...report,
      updatedAt: new Date().toISOString()
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.put<Report>(`${this.apiUrl}/${id}`, updateData, { headers });
  }

  // Alternative update method using PATCH
  updatePartial(id: number, report: Partial<UpdateReportRequest>): Observable<Report> {
    const updateData = {
      ...report,
      updatedAt: new Date().toISOString()
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.patch<Report>(`${this.apiUrl}/${id}`, updateData, { headers });
  }

  // Delete report
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Convert file to base64
  convertToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  }

  // Get reports with permission filtering
  listWithPermissions(): Observable<{reports: Report[], userPermissions: string[]}> {
    const userData = JSON.parse(localStorage.getItem('current_user') || '{}');
    const reportPermissions = userData.permissions?.find((p: any) => p.moduleName === 'ReportManagement')?.permissions || [];

    return this.list().pipe(
      map(reports => ({
        reports,
        userPermissions: reportPermissions
      }))
    );
  }
}
