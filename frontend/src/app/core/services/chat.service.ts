import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from './auth.service';

export interface ChatRequest {
  question: string;
  documentId?: string;
  sessionId?: string;
}

export interface SourceChunk {
  chunkId: string;
  documentId: string;
  content: string;
  score: number;
}

export interface ChatResponse {
  sessionId: string;
  answer: string;
  sources: SourceChunk[];
}

export interface ChatSessionResponse {
  id: string;
  documentId: string;
  title: string;
  messageCount: number;
  createdAt: string;
}

export interface ChatMessageResponse {
  id: string;
  role: 'USER' | 'ASSISTANT';
  content: string;
  sourceChunks: SourceChunk[];
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  constructor(private http: HttpClient) {}

  chat(request: ChatRequest): Observable<ApiResponse<ChatResponse>> {
    return this.http.post<ApiResponse<ChatResponse>>('/api/ai/chat', request);
  }

  getSessions(): Observable<ApiResponse<ChatSessionResponse[]>> {
    return this.http.get<ApiResponse<ChatSessionResponse[]>>('/api/ai/sessions');
  }

  getSession(id: string): Observable<ApiResponse<ChatMessageResponse[]>> {
    return this.http.get<ApiResponse<ChatMessageResponse[]>>(`/api/ai/sessions/${id}`);
  }

  deleteSession(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`/api/ai/sessions/${id}`);
  }
}
