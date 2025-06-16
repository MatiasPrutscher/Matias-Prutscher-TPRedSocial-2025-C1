import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/auth'; // URL base del backend

  constructor(private http: HttpClient) {}

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
  }
}
