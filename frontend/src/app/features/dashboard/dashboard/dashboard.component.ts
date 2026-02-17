import { Component, inject, signal, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DocumentService, DocumentResponse } from '../../../core/services/document.service';
import { AuthService } from '../../../core/services/auth.service';
import { DocumentCardComponent } from '../document-card/document-card.component';
import { UploadDialogComponent } from '../upload-dialog/upload-dialog.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    MatButtonModule, MatIconModule, MatDialogModule, MatSnackBarModule,
    DocumentCardComponent, LoadingSpinnerComponent
  ],
  template: `
    <div class="dashboard">
      <div class="header">
        <div>
          <h1>My Documents</h1>
          <p class="subtitle">Upload and manage your documents for AI-powered Q&A</p>
        </div>
        <button mat-raised-button color="primary" (click)="openUpload()">
          <mat-icon>upload</mat-icon> Upload Document
        </button>
      </div>

      @if (loading()) {
        <app-loading-spinner />
      } @else if (documents().length === 0) {
        <div class="empty-state">
          <mat-icon class="empty-icon">folder_open</mat-icon>
          <h2>No documents yet</h2>
          <p>Upload a PDF, DOCX, or TXT file to get started</p>
          <button mat-raised-button color="primary" (click)="openUpload()">
            <mat-icon>upload</mat-icon> Upload Your First Document
          </button>
        </div>
      } @else {
        <div class="stats">
          <div class="stat-card">
            <span class="stat-value">{{ documents().length }}</span>
            <span class="stat-label">Documents</span>
          </div>
          <div class="stat-card">
            <span class="stat-value">{{ readyCount() }}</span>
            <span class="stat-label">Ready</span>
          </div>
          <div class="stat-card">
            <span class="stat-value">{{ totalChunks() }}</span>
            <span class="stat-label">Chunks</span>
          </div>
        </div>
        <div class="doc-grid">
          @for (doc of documents(); track doc.id) {
            <app-document-card [doc]="doc" (deleteDoc)="onDelete($event)" />
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .dashboard { max-width: 1200px; margin: 0 auto; padding: 32px 24px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; }
    h1 { margin: 0; font-size: 1.8rem; }
    .subtitle { color: var(--text-secondary); margin: 4px 0 0; }
    .stats { display: flex; gap: 16px; margin-bottom: 24px; }
    .stat-card {
      background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px;
      padding: 20px 28px; display: flex; flex-direction: column;
    }
    .stat-value { font-size: 1.8rem; font-weight: 700; color: var(--accent); }
    .stat-label { color: var(--text-secondary); font-size: 0.85rem; }
    .doc-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; }
    .empty-state {
      text-align: center; padding: 80px 24px;
      background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px;
    }
    .empty-icon { font-size: 64px; width: 64px; height: 64px; color: var(--text-secondary); }
    .empty-state h2 { margin: 16px 0 8px; }
    .empty-state p { color: var(--text-secondary); margin-bottom: 24px; }
  `]
})
export class DashboardComponent implements OnInit {
  private documentService = inject(DocumentService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  documents = signal<DocumentResponse[]>([]);
  loading = signal(true);

  readyCount = () => this.documents().filter(d => d.status === 'READY').length;
  totalChunks = () => this.documents().reduce((sum, d) => sum + d.chunkCount, 0);

  ngOnInit(): void {
    this.loadDocuments();
  }

  loadDocuments(): void {
    this.loading.set(true);
    this.documentService.list().subscribe({
      next: res => {
        this.documents.set(res.data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  openUpload(): void {
    const dialogRef = this.dialog.open(UploadDialogComponent, { width: '500px' });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadDocuments();
    });
  }

  onDelete(id: string): void {
    if (confirm('Are you sure you want to delete this document?')) {
      this.documentService.delete(id).subscribe({
        next: () => {
          this.documents.update(docs => docs.filter(d => d.id !== id));
          this.snackBar.open('Document deleted', 'Close', { duration: 3000 });
        },
        error: () => this.snackBar.open('Failed to delete document', 'Close', { duration: 3000 })
      });
    }
  }
}
