import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl; // URL base del backend
  private timeoutSesion: any;
  private timeoutAdvertencia: any;
  mostrarModalSesion = false;

  constructor(private http: HttpClient, private router: Router) {}

  //Registra un nuevo usuario enviando un FormData al backend.
  register(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, formData);
  }

  //Inicia sesión enviando usuario/correo y contraseña al backend.
  login(mailOrUser: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { mailOrUser, password });
  }

  //Guarda los datos del usuario (o token) en localStorage.
  saveUser(userData: any): void {
    localStorage.setItem('user', JSON.stringify(userData.usuario || userData));
    if (userData.token) {
      localStorage.setItem('token', userData.token);
    }
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Obtiene los datos del usuario guardados en localStorage.
  getUser(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  //Elimina los datos del usuario de localStorage (logout).
  logout(): void {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  // Verifica si el usuario está autenticado comprobando la existencia del token.
  autorizar() {
    const token = localStorage.getItem('token');
    return this.http.post(
      '/auth/autorizar',
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  }

  // Refresca el token enviando una solicitud al backend.
  refrescarToken() {
    const token = this.getToken();
    return this.http.post<{ token: string }>(
      `${this.apiUrl}/refrescar`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
  }

  // Inicia un contador para la sesión del usuario, mostrando un modal de advertencia a los 10 minutos y cerrando la sesión a los 15 minutos.
  iniciarContadorSesion() {
    clearTimeout(this.timeoutSesion);
    clearTimeout(this.timeoutAdvertencia);
    this.timeoutAdvertencia = setTimeout(() => {
      this.mostrarModalSesion = true;
    }, 10 * 60 * 1000);
    this.timeoutSesion = setTimeout(() => {
      this.logout();
    }, 15 * 60 * 1000);
  }

  // Cierra el modal de sesión y renueva el token.
  renovarSesion() {
    this.refrescarToken().subscribe({
      next: (resp) => {
        localStorage.setItem('token', resp.token);
        this.iniciarContadorSesion();
        this.mostrarModalSesion = false;
      },
      error: () => this.logout(),
    });
  }
}
