import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DocumentService, DocumentResponse } from '../../../core/services/document.service';
import { ChatService, ChatMessageResponse } from '../../../core/services/chat.service';
import { MessageBubbleComponent } from '../../chat/message-bubble/message-bubble.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { FileSizePipe } from '../../../shared/pipes/file-size.pipe';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-document-detail',
  standalone: true,
  imports: [
    FormsModule, MessageBubbleComponent, LoadingSpinnerComponent, FileSizePipe, DatePipe,
    MatCardModule, MatButtonModule, MatIconModule, MatChipsModule,
    MatFormFieldModule, MatInputModule, MatSnackBarModule
  ],
  template: `
    <div class="detail-page">
      @if (loading()) {
        <app-loading-spinner />
      } @else if (document()) {
        <div class="doc-header">
          <button mat-icon-button (click)="goBack()">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <div class="doc-info">
            <h1>{{ document()!.filename }}</h1>
            <div class="meta">
              <mat-chip [class]="'status-' + document()!.status.toLowerCase()">{{ document()!.status }}</mat-chip>
              <span>{{ document()!.fileSize | fileSize }}</span>
              <span>{{ document()!.chunkCount }} chunks</span>
              <span>Uploaded {{ document()!.createdAt | date:'medium' }}</span>
            </div>
          </div>
          <button mat-raised-button color="warn" (click)="deleteDocument()">
            <mat-icon>delete</mat-icon> Delete
          </button>
        </div>

        @if (document()!.status === 'READY') {
          <div class="chat-section">
            <h2>Ask about this document</h2>
            <div class="messages-area">
              @for (msg of messages(); track msg.id) {
                <app-message-bubble [message]="msg" />
              }
            </div>
            <div class="input-area">
              <mat-form-field appearance="outline" class="full-width">
                <input matInput [(ngModel)]="question" placeholder="Ask a question about this document..."
                       (keyup.enter)="askQuestion()" [disabled]="sending()" />
              </mat-form-field>
              <button mat-fab color="primary" (click)="askQuestion()" [disabled]="!question().trim() || sending()">
                <mat-icon>{{ sending() ? 'hourglass_empty' : 'send' }}</mat-icon>
              </button>
            </div>
          </div>
        } @else if (document()!.status === 'PROCESSING') {
          <mat-card class="status-card">
            <mat-icon>hourglass_top</mat-icon>
            <p>Document is being processed. Please check back shortly.</p>
          </mat-card>
        } @else if (document()!.status === 'FAILED') {
          <mat-card class="status-card error">
            <mat-icon>error</mat-icon>
            <p>Document processing failed. Please try uploading again.</p>
          </mat-card>
        }
      }
    </div>
  `,
  styles: [`
    .detail-page { max-width: 1000px; margin: 0 auto; padding: 32px 24px; }
    .doc-header { display: flex; align-items: flex-start; gap: 16px; margin-bottom: 32px; }
    .doc-info { flex: 1; }
    .doc-info h1 { margin: 0; font-size: 1.5rem; }
    .meta { display: flex; align-items: center; gap: 12px; margin-top: 8px; color: var(--text-secondary); font-size: 0.9rem; }
    .chat-section { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 24px; }
    .chat-section h2 { margin: 0 0 16px; }
    .messages-area { max-height: 500px; overflow-y: auto; margin-bottom: 16px; }
    .input-area { display: flex; align-items: center; gap: 12px; }
    .full-width { flex: 1; }
    .status-card { text-align: center; padding: 40px; background: var(--bg-card); border: 1px solid var(--border); }
    .status-card mat-icon { font-size: 48px; width: 48px; height: 48px; color: var(--text-secondary); }
    .status-card.error mat-icon { color: var(--error); }
    .status-ready { background-color: var(--success) !important; color: white !important; }
    .status-processing { background-color: #f59e0b !important; color: white !important; }
    .status-failed { background-color: var(--error) !important; color: white !important; }
  `]
})
export class DocumentDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private documentService = inject(DocumentService);
  private chatService = inject(ChatService);
  private snackBar = inject(MatSnackBar);

  document = signal<DocumentResponse | null>(null);
  messages = signal<ChatMessageResponse[]>([]);
  question = signal('');
  loading = signal(true);
  sending = signal(false);
  private sessionId: string | null = null;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.documentService.get(id).subscribe({
      next: res => {
        this.document.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.router.navigate(['/dashboard']);
      }
    });
  }

  askQuestion(): void {
    const q = this.question().trim();
    if (!q || !this.document()) return;
    this.sending.set(true);

    const userMsg: ChatMessageResponse = {
      id: crypto.randomUUID(), role: 'USER', content: q, sourceChunks: [], createdAt: new Date().toISOString()
    };
    this.messages.update(msgs => [...msgs, userMsg]);
    this.question.set('');

    this.chatService.chat({
      question: q,
      documentId: this.document()!.id,
      sessionId: this.sessionId ?? undefined
    }).subscribe({
      next: res => {
        this.sessionId = res.data.sessionId;
        const assistantMsg: ChatMessageResponse = {
          id: crypto.randomUUID(), role: 'ASSISTANT', content: res.data.answer,
          sourceChunks: res.data.sources, createdAt: new Date().toISOString()
        };
        this.messages.update(msgs => [...msgs, assistantMsg]);
        this.sending.set(false);
      },
      error: () => {
        this.sending.set(false);
        this.snackBar.open('Failed to get response', 'Close', { duration: 3000 });
      }
    });
  }

  deleteDocument(): void {
    if (!this.document() || !confirm('Delete this document?')) return;
    this.documentService.delete(this.document()!.id).subscribe({
      next: () => {
        this.snackBar.open('Document deleted', 'Close', { duration: 3000 });
        this.router.navigate(['/dashboard']);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
