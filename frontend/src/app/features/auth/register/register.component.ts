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
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule, RouterLink,
    MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatSnackBarModule
  ],
  template: `
    <div class="auth-container">
      <mat-card class="auth-card">
        <mat-card-header>
          <mat-icon mat-card-avatar>person_add</mat-icon>
          <mat-card-title>Create Account</mat-card-title>
          <mat-card-subtitle>Join DocAssist</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Full Name</mat-label>
              <input matInput formControlName="fullName" />
              @if (form.controls.fullName.hasError('required')) {
                <mat-error>Full name is required</mat-error>
              }
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput formControlName="email" type="email" />
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
              @if (form.controls.password.hasError('minlength')) {
                <mat-error>Password must be at least 8 characters</mat-error>
              }
            </mat-form-field>
            <button mat-raised-button color="primary" type="submit" class="full-width submit-btn"
                    [disabled]="loading()">
              {{ loading() ? 'Creating account...' : 'Create Account' }}
            </button>
          </form>
        </mat-card-content>
        <mat-card-actions align="end">
          <span>Already have an account? <a routerLink="/login">Sign In</a></span>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .auth-container {
      display: flex; justify-content: center; align-items: center;
      min-height: calc(100vh - 64px); padding: 24px;
    }
    .auth-card { max-width: 420px; width: 100%; background: var(--bg-card); border: 1px solid var(--border); }
    .full-width { width: 100%; }
    .submit-btn { margin-top: 16px; height: 48px; font-size: 1rem; }
    mat-card-actions { padding: 16px; }
    mat-card-actions span { color: var(--text-secondary); }
  `]
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  loading = signal(false);
  hidePassword = signal(true);

  form = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    const { fullName, email, password } = this.form.getRawValue();

    this.authService.register(fullName, email, password).subscribe({
      next: () => {
        this.authService.loadCurrentUser();
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        this.snackBar.open(err.error?.message || 'Registration failed', 'Close', { duration: 3000 });
      }
    });
  }
}
