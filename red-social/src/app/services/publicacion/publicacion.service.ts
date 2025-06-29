import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Publicacion } from '../../interfaces/red-social-model';

@Injectable({
  providedIn: 'root',
})
export class PublicacionService {
  private apiUrl = environment.apiUrl + '/publicaciones';

  constructor(private http: HttpClient) {}

  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : undefined;
  }

  getPublicaciones(params: any = {}): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, { params });
  }

  darLike(id: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/${id}/like`,
      {},
      { headers: this.getAuthHeaders() }
    );
  }

  quitarLike(id: string): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/${id}/like`,
      { headers: this.getAuthHeaders() }
    );
  }

  crearPublicacion(formData: FormData) {
    return this.http.post(
      this.apiUrl,
      formData,
      { headers: this.getAuthHeaders() }
    );
  }

  eliminarPublicacion(id: string) {
    return this.http.delete(
      `${this.apiUrl}/${id}`,
      { headers: this.getAuthHeaders() }
    );
  }

  getPublicacion(id: string) {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  editarPublicacion(id: string, data: any): Observable<Publicacion> {
    return this.http.put<Publicacion>(
      `${this.apiUrl}/${id}`,
      data,
      { headers: this.getAuthHeaders() }
    );
  }
}
