import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth/auth.guard';
import { LoginRedirectGuard } from './guards/login/login-redirect.guard';
import { AdminGuard } from './guards/admin/admin.guard';

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
  {
    path: 'publicacion/:id',
    loadComponent: () =>
      import('./pages/publicacion/publicacion.component').then(
        (m) => m.PublicacionComponent
      ),
    canActivate: [AuthGuard], // Solo usuarios logueados
  },
  {
    path: 'dashboard/usuarios',
    loadComponent: () =>
      import('./pages/dashboard-usuarios/dashboard-usuarios.component').then(
        (m) => m.DashboardUsuariosComponent
      ),
    canActivate: [AdminGuard], // Solo admins si corresponde
  },
  {
    path: 'dashboard/estadisticas',
    loadComponent: () =>
      import(
        './pages/dashboard-estadisticas/dashboard-estadisticas.component'
      ).then((m) => m.DashboardEstadisticasComponent),
    canActivate: [AdminGuard], // Solo admins si corresponde
  },
  { path: '**', redirectTo: 'login' },
];
