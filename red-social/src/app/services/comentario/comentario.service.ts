import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Comentario } from '../../interfaces/red-social-model';

@Injectable({ providedIn: 'root' })
export class ComentarioService {
  private apiUrl = environment.apiUrl + '/comentarios';

  constructor(private http: HttpClient) {}

  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : undefined;
  }

  getComentarios(publicacionId: string, offset = 0, limit = 5) {
    return this.http.get<any[]>(`${this.apiUrl}/${publicacionId}`, {
      params: { offset, limit },
    });
  }

  agregarComentario(publicacionId: string, texto: string) {
    return this.http.post<Comentario>(
      `${this.apiUrl}/${publicacionId}`,
      { texto },
      { headers: this.getAuthHeaders() }
    );
  }

  editarComentario(id: string, texto: string) {
    return this.http.put(
      `${this.apiUrl}/${id}`,
      { texto },
      { headers: this.getAuthHeaders() }
    );
  }

  eliminarComentario(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }
}
