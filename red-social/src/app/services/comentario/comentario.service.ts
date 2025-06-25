import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ComentarioService {
  private apiUrl = environment.apiUrl + '/comentarios';

  getComentarios(publicacionId: string, offset = 0, limit = 5) {
    return this.http.get<any[]>(`${this.apiUrl}/${publicacionId}`, {
      params: { offset, limit },
    });
  }

  agregarComentario(publicacionId: string, texto: string) {
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
    return this.http.post(
      `${this.apiUrl}/${publicacionId}`,
      { texto },
      { headers }
    );
  }

  constructor(private http: HttpClient) {}
}
