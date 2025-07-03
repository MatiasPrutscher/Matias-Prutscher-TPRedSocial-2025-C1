import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class EstadisticasService {
  private apiUrl =
    environment.apiUrl + '/estadisticas/publicaciones-por-usuario';

  constructor(private http: HttpClient) {}

  getPublicacionesPorUsuario(
    desde: string,
    hasta: string
  ): Observable<{ usuario: string; cantidad: number }[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<{ usuario: string; cantidad: number }[]>(
      `${this.apiUrl}?desde=${desde}&hasta=${hasta}`,
      { headers }
    );
  }

  getPrimerFechaPublicacion(): Observable<{ fecha: string }> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<{ fecha: string }>(
      environment.apiUrl + '/estadisticas/primer-fecha-publicacion',
      { headers }
    );
  }

  getComentariosTotales(desde: string, hasta: string) {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<{ total: number }>(
      environment.apiUrl +
        `/estadisticas/comentarios-totales?desde=${desde}&hasta=${hasta}`,
      { headers }
    );
  }

  getComentariosPorPublicacion(desde: string, hasta: string) {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<any[]>(
      environment.apiUrl +
        `/estadisticas/comentarios-por-publicacion?desde=${desde}&hasta=${hasta}`,
      { headers }
    );
  }

  getComentariosPorUsuario(desde: string, hasta: string) {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<any[]>(
      environment.apiUrl +
        `/estadisticas/comentarios-por-usuario?desde=${desde}&hasta=${hasta}`,
      { headers }
    );
  }
}
