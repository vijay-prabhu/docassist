import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'documents/:id',
    loadComponent: () => import('./features/document/document-detail/document-detail.component').then(m => m.DocumentDetailComponent),
    canActivate: [authGuard]
  },
  {
    path: 'chat',
    loadComponent: () => import('./features/chat/chat/chat.component').then(m => m.ChatComponent),
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: '/dashboard' }
];
