import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatToolbarModule, MatButtonModule, MatIconModule],
  template: `
    <mat-toolbar class="navbar">
      <a routerLink="/dashboard" class="logo">
        <mat-icon>description</mat-icon>
        <span>DocAssist</span>
      </a>
      <span class="spacer"></span>
      @if (authService.user(); as user) {
        <a mat-button routerLink="/dashboard" routerLinkActive="active">Dashboard</a>
        <a mat-button routerLink="/chat" routerLinkActive="active">Chat</a>
        <span class="user-name">{{ user.fullName }}</span>
        <button mat-button (click)="logout()">
          <mat-icon>logout</mat-icon> Logout
        </button>
      }
    </mat-toolbar>
  `,
  styles: [`
    .navbar {
      background: var(--bg-card);
      border-bottom: 1px solid var(--border);
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .logo {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--accent);
      font-weight: 700;
      font-size: 1.2rem;
      text-decoration: none;
    }
    .spacer { flex: 1; }
    .user-name {
      color: var(--text-secondary);
      margin: 0 12px;
      font-size: 0.9rem;
    }
    .active { color: var(--accent) !important; }
  `]
})
export class NavbarComponent {
  authService = inject(AuthService);
  private router = inject(Router);

  logout(): void {
    this.authService.logout();
  }
}
