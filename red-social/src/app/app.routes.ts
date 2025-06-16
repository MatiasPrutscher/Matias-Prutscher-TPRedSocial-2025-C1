import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { LoginRedirectGuard } from './guards/login-redirect-guard.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then((m) => m.LoginComponent),
    canActivate: [LoginRedirectGuard], // Redirige a publicaciones si ya está logueado
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/register/register.component').then(
        (m) => m.RegisterComponent
      ),
    canActivate: [LoginRedirectGuard], // Redirige a publicaciones si ya está logueado
  },
  {
    path: 'publicaciones',
    loadComponent: () =>
      import('./pages/publicaciones/publicaciones.component').then(
        (m) => m.PublicacionesComponent
      ),
    canActivate: [AuthGuard], // Solo usuarios logueados
  },
  {
    path: 'mi-perfil',
    loadComponent: () =>
      import('./pages/mi-perfil/mi-perfil.component').then(
        (m) => m.MiPerfilComponent
      ),
    canActivate: [AuthGuard], // Solo usuarios logueados
  },
  { path: '**', redirectTo: 'login' },
];
