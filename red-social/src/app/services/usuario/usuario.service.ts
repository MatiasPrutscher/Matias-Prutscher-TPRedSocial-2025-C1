import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { UsuarioPerfil } from '../../interfaces/red-social-model';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private usuario: UsuarioPerfil = {
    nombre: 'Matias Prutscher',
    verificado: true,
    avatarUrl:
      'https://i.pinimg.com/736x/6c/b5/4f/6cb54fd9dc5a20f1399faf45cb12c8c3.jpg',
    seguidores: -1,
    siguiendo: 111111,
    descripcion: 'Esto es una descripción de mi perfil',
    email: 'mm@email.com',
    fechaNacimiento: '1996-08-17',
    publicaciones: [], // Las publicaciones se manejan en el otro service
  };

  getPerfil(): Observable<UsuarioPerfil> {
    return of(this.usuario);
  }
}
