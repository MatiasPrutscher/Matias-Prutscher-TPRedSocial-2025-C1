import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UsuarioPerfil } from '../../interfaces/red-social-model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private apiUrl = environment.apiUrl + '/usuarios';

  constructor(private http: HttpClient) {}

  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();
  }

  getPerfil(): Observable<UsuarioPerfil> {
    return this.http.get<UsuarioPerfil>(`${this.apiUrl}/perfil`, {
      headers: this.getAuthHeaders(),
    });
  }

  listarUsuarios() {
    return this.http.get<any[]>(this.apiUrl, {
      headers: this.getAuthHeaders(),
    });
  }

  bajaUsuario(id: string) {
    return this.http.delete(this.apiUrl + '/' + id, {
      headers: this.getAuthHeaders(),
    });
  }

  altaUsuario(id: string) {
    return this.http.post(
      this.apiUrl + '/' + id + '/alta',
      {},
      { headers: this.getAuthHeaders() }
    );
  }

  crearUsuario(data: any) {
    return this.http.post(this.apiUrl, data, {
      headers: this.getAuthHeaders(),
    });
  }

  editarUsuario(id: string, data: any): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.put(`${environment.apiUrl}/usuarios/${id}`, data, {
      headers,
    });
  }
}
