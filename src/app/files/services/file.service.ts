import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FileRecord } from '../models/file.model';

@Injectable({ providedIn: 'root' })
export class FileService {
  private apiUrl = 'http://localhost:3000/files';

  constructor(private http: HttpClient) {}

  list(): Observable<FileRecord[]> {
    return this.http.get<FileRecord[]>(this.apiUrl);
  }

  get(id: number): Observable<FileRecord> {
    return this.http.get<FileRecord>(`${this.apiUrl}/${id}`);
  }

  create(record: FileRecord): Observable<FileRecord> {
    return this.http.post<FileRecord>(this.apiUrl, record);
  }

  update(id: number, record: Partial<FileRecord>): Observable<FileRecord> {
    return this.http.patch<FileRecord>(`${this.apiUrl}/${id}`, record);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
