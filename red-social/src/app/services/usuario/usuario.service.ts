import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UsuarioPerfil } from '../../interfaces/red-social-model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private apiUrl = environment.apiUrl + '/usuarios';

  constructor(private http: HttpClient) {}

  getPerfil(): Observable<UsuarioPerfil> {
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
    return this.http.get<UsuarioPerfil>(`${this.apiUrl}/perfil`, { headers });
  }
}
