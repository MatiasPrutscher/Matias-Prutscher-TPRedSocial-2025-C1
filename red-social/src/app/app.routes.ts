import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { PublicacionesComponent } from './pages/publicaciones/publicaciones.component';
import { MiPerfilComponent } from './pages/mi-perfil/mi-perfil.component';

export const routes: Routes = [
  { path: '', redirectTo: 'publicaciones', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'publicaciones', component: PublicacionesComponent },
  { path: 'mi-perfil', component: MiPerfilComponent },
  { path: '**', redirectTo: 'publicaciones' },
];
