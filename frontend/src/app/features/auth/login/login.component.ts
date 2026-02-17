import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule, RouterLink,
    MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatSnackBarModule
  ],
  template: `
    <div class="auth-container">
      <mat-card class="auth-card">
        <mat-card-header>
          <mat-icon mat-card-avatar>description</mat-icon>
          <mat-card-title>Welcome to DocAssist</mat-card-title>
          <mat-card-subtitle>Sign in to continue</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput formControlName="email" type="email" />
              @if (form.controls.email.hasError('required')) {
                <mat-error>Email is required</mat-error>
              }
              @if (form.controls.email.hasError('email')) {
                <mat-error>Enter a valid email</mat-error>
              }
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <input matInput formControlName="password" [type]="hidePassword() ? 'password' : 'text'" />
              <button mat-icon-button matSuffix type="button" (click)="hidePassword.set(!hidePassword())">
                <mat-icon>{{ hidePassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              @if (form.controls.password.hasError('required')) {
                <mat-error>Password is required</mat-error>
              }
            </mat-form-field>
            <button mat-raised-button color="primary" type="submit" class="full-width submit-btn"
                    [disabled]="loading()">
              {{ loading() ? 'Signing in...' : 'Sign In' }}
            </button>
          </form>
        </mat-card-content>
        <mat-card-actions align="end">
          <span>Don't have an account? <a routerLink="/register">Register</a></span>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .auth-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: calc(100vh - 64px);
      padding: 24px;
    }
    .auth-card {
      max-width: 420px;
      width: 100%;
      background: var(--bg-card);
      border: 1px solid var(--border);
    }
    .full-width { width: 100%; }
    .submit-btn { margin-top: 16px; height: 48px; font-size: 1rem; }
    mat-card-actions { padding: 16px; }
    mat-card-actions span { color: var(--text-secondary); }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  loading = signal(false);
  hidePassword = signal(true);

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    const { email, password } = this.form.getRawValue();

    this.authService.login(email, password).subscribe({
      next: () => {
        this.authService.loadCurrentUser();
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        this.snackBar.open(err.error?.message || 'Login failed', 'Close', { duration: 3000 });
      }
    });
  }
}
