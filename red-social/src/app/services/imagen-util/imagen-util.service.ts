import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { UsuarioPerfil } from '../../interfaces/red-social-model';

@Injectable({
  providedIn: 'root',
})
export class ImagenUtilService {
  getImagenUrl(imagen: string): string {
    if (!imagen) return 'assets/avatar-default.png';
    if (imagen.startsWith('http')) return imagen;
    return environment.apiUrl + imagen;
  }

  getAvatarUrl(usuario?: UsuarioPerfil | any): string {
    if (!usuario) return 'assets/avatar-default.png';
    const img = usuario.avatarUrl || usuario.imagen;
    if (!img) return 'assets/avatar-default.png';
    if (img.startsWith('http')) return img;
    return `${environment.apiUrl}${img}`;
  }
}
