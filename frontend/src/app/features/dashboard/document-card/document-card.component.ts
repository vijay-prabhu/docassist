import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DocumentResponse } from '../../../core/services/document.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { FileSizePipe } from '../../../shared/pipes/file-size.pipe';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-document-card',
  standalone: true,
  imports: [RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule, FileSizePipe, DatePipe],
  template: `
    <mat-card class="doc-card" [routerLink]="['/documents', doc().id]">
      <mat-card-header>
        <mat-icon mat-card-avatar class="doc-icon">
          {{ getIcon(doc().contentType) }}
        </mat-icon>
        <mat-card-title class="doc-title">{{ doc().filename }}</mat-card-title>
        <mat-card-subtitle>{{ doc().createdAt | date:'medium' }}</mat-card-subtitle>
      </mat-card-header>
      <mat-card-content>
        <div class="doc-meta">
          <mat-chip-set>
            <mat-chip [class]="'status-' + doc().status.toLowerCase()">
              {{ doc().status }}
            </mat-chip>
          </mat-chip-set>
          <span class="meta-item">{{ doc().fileSize | fileSize }}</span>
          @if (doc().chunkCount > 0) {
            <span class="meta-item">{{ doc().chunkCount }} chunks</span>
          }
        </div>
      </mat-card-content>
      <mat-card-actions align="end">
        <button mat-icon-button color="warn" (click)="onDelete($event)">
          <mat-icon>delete</mat-icon>
        </button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [`
    .doc-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      cursor: pointer;
      transition: border-color 0.2s, transform 0.2s;
    }
    .doc-card:hover { border-color: var(--accent); transform: translateY(-2px); }
    .doc-icon { color: var(--accent); }
    .doc-title {
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px;
    }
    .doc-meta { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
    .meta-item { color: var(--text-secondary); font-size: 0.85rem; }
    .status-ready { background-color: var(--success) !important; color: white !important; }
    .status-processing { background-color: #f59e0b !important; color: white !important; }
    .status-failed { background-color: var(--error) !important; color: white !important; }
    .status-uploading { background-color: #6366f1 !important; color: white !important; }
  `]
})
export class DocumentCardComponent {
  doc = input.required<DocumentResponse>();
  deleteDoc = output<string>();

  getIcon(contentType: string): string {
    if (contentType?.includes('pdf')) return 'picture_as_pdf';
    if (contentType?.includes('word') || contentType?.includes('docx')) return 'article';
    return 'text_snippet';
  }

  onDelete(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.deleteDoc.emit(this.doc().id);
  }
}
