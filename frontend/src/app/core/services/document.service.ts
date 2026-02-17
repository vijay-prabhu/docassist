import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from './auth.service';

export interface DocumentResponse {
  id: string;
  filename: string;
  contentType: string;
  fileSize: number;
  status: 'UPLOADING' | 'PROCESSING' | 'READY' | 'FAILED';
  pageCount: number;
  chunkCount: number;
  createdAt: string;
}

export interface DocumentStatusResponse {
  id: string;
  status: string;
  chunkCount: number;
}

@Injectable({ providedIn: 'root' })
export class DocumentService {
  constructor(private http: HttpClient) {}

  upload(file: File): Observable<ApiResponse<DocumentResponse>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ApiResponse<DocumentResponse>>('/api/documents', formData);
  }

  list(): Observable<ApiResponse<DocumentResponse[]>> {
    return this.http.get<ApiResponse<DocumentResponse[]>>('/api/documents');
  }

  get(id: string): Observable<ApiResponse<DocumentResponse>> {
    return this.http.get<ApiResponse<DocumentResponse>>(`/api/documents/${id}`);
  }

  getStatus(id: string): Observable<ApiResponse<DocumentStatusResponse>> {
    return this.http.get<ApiResponse<DocumentStatusResponse>>(`/api/documents/${id}/status`);
  }

  delete(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`/api/documents/${id}`);
  }
}
