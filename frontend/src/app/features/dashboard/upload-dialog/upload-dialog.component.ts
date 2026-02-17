import { Component, inject, signal } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { DocumentService } from '../../../core/services/document.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-upload-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule, MatProgressBarModule, MatSnackBarModule],
  template: `
    <h2 mat-dialog-title>Upload Document</h2>
    <mat-dialog-content>
      <div class="upload-zone" (drop)="onDrop($event)" (dragover)="$event.preventDefault()"
           (click)="fileInput.click()">
        <mat-icon class="upload-icon">cloud_upload</mat-icon>
        <p>Drag & drop a file here or click to browse</p>
        <p class="hint">Supports PDF, DOCX, TXT (max 50MB)</p>
        <input #fileInput type="file" hidden accept=".pdf,.docx,.txt" (change)="onFileSelected($event)" />
      </div>
      @if (selectedFile()) {
        <div class="file-info">
          <mat-icon>insert_drive_file</mat-icon>
          <span>{{ selectedFile()!.name }}</span>
          <span class="file-size">{{ formatSize(selectedFile()!.size) }}</span>
        </div>
      }
      @if (uploading()) {
        <mat-progress-bar mode="indeterminate"></mat-progress-bar>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close [disabled]="uploading()">Cancel</button>
      <button mat-raised-button color="primary" [disabled]="!selectedFile() || uploading()" (click)="upload()">
        {{ uploading() ? 'Uploading...' : 'Upload' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .upload-zone {
      border: 2px dashed var(--border);
      border-radius: 12px;
      padding: 40px;
      text-align: center;
      cursor: pointer;
      transition: border-color 0.2s;
    }
    .upload-zone:hover { border-color: var(--accent); }
    .upload-icon { font-size: 48px; width: 48px; height: 48px; color: var(--accent); }
    .hint { color: var(--text-secondary); font-size: 0.85rem; }
    .file-info {
      display: flex; align-items: center; gap: 8px;
      margin-top: 16px; padding: 12px;
      background: var(--bg-dark); border-radius: 8px;
    }
    .file-size { margin-left: auto; color: var(--text-secondary); }
  `]
})
export class UploadDialogComponent {
  private documentService = inject(DocumentService);
  private dialogRef = inject(MatDialogRef<UploadDialogComponent>);
  private snackBar = inject(MatSnackBar);

  selectedFile = signal<File | null>(null);
  uploading = signal(false);

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedFile.set(input.files[0]);
    }
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer?.files.length) {
      this.selectedFile.set(event.dataTransfer.files[0]);
    }
  }

  upload(): void {
    const file = this.selectedFile();
    if (!file) return;
    this.uploading.set(true);

    this.documentService.upload(file).subscribe({
      next: (res) => {
        this.snackBar.open('Document uploaded successfully', 'Close', { duration: 3000 });
        this.dialogRef.close(res.data);
      },
      error: (err) => {
        this.uploading.set(false);
        this.snackBar.open(err.error?.message || 'Upload failed', 'Close', { duration: 3000 });
      }
    });
  }

  formatSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + units[i];
  }
}
