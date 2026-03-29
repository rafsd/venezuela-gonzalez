import { Routes } from '@angular/router';
import { authGuard, adminGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'schedule', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'pending',
    loadComponent: () => import('./features/auth/pending/pending.component').then(m => m.PendingComponent)
  },
  {
    path: 'schedule',
    loadComponent: () => import('./features/schedule/schedule.component').then(m => m.ScheduleComponent),
    canActivate: [authGuard]
  },
  {
    path: 'places',
    loadComponent: () => import('./features/places/places.component').then(m => m.PlacesComponent),
    canActivate: [authGuard]
  },
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/admin.component').then(m => m.AdminComponent),
    canActivate: [authGuard, adminGuard]
  },
  { path: '**', redirectTo: 'schedule' }
];
