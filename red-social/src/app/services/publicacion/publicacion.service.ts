import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Publicacion } from '../../interfaces/red-social-model';

@Injectable({
  providedIn: 'root',
})
export class PublicacionService {
  private publicaciones: Publicacion[] = [
    {
      titulo: '¡Mi primera publicación!',
      mensaje: 'Hola a todos, esta es mi primera publicación en la red social.',
      fecha: '05/06/2025',
    },
    {
      titulo: 'Compartiendo una foto',
      mensaje: '¡Miren esta imagen!',
      imagen:
        'https://i.pinimg.com/736x/ef/f4/63/eff4638c5f39de96f910362ebfa7f087.jpg',
      fecha: '03/06/2025',
      likes: 12,
      comentarios: [
        { usuario: 'Usuario2', texto: 'Comentario 1' },
        { usuario: 'Usiario3', texto: 'Comentario 2' },
      ],
    },
  ];

  getPublicaciones(): Observable<Publicacion[]> {
    return of(this.publicaciones);
  }

  agregarPublicacion(pub: Publicacion) {
    this.publicaciones.unshift(pub);
  }

  agregarComentario(
    index: number,
    comentario: { usuario: string; texto: string }
  ) {
    if (!this.publicaciones[index].comentarios) {
      this.publicaciones[index].comentarios = [];
    }
    this.publicaciones[index].comentarios!.push(comentario);
  }
}
