import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PublicacionService {
  private apiUrl = 'http://localhost:3000/publicaciones';

  getPublicaciones(params: any = {}): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, { params });
  }

  darLike(id: string): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
    return this.http.post(`${this.apiUrl}/${id}/like`, {}, { headers });
  }

  quitarLike(id: string): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
    return this.http.delete(`${this.apiUrl}/${id}/like`, { headers });
  }

  crearPublicacion(formData: FormData) {
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
    return this.http.post(this.apiUrl, formData, { headers });
  }

  eliminarPublicacion(id: string) {
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
    return this.http.delete(`${this.apiUrl}/${id}`, { headers });
  }

  constructor(private http: HttpClient) {}
}
