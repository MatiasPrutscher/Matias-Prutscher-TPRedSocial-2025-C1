import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  UsuarioPerfil,
  Publicacion,
  Comentario,
} from '../../interfaces/red-social-model';
import { UsuarioService } from '../../services/usuario/usuario.service';
import { PublicacionService } from '../../services/publicacion/publicacion.service';

@Component({
  selector: 'app-mi-perfil',
  imports: [CommonModule],
  templateUrl: './mi-perfil.component.html',
  styleUrls: ['./mi-perfil.component.css'],
})
export class MiPerfilComponent implements OnInit {
  usuario!: UsuarioPerfil;
  publicaciones: Publicacion[] = [];

  nuevaPublicacion: Publicacion = {
    titulo: '',
    mensaje: '',
    fecha: '',
  };

  nuevoComentario: Comentario = {
    usuario: '',
    texto: '',
  };

  constructor(
    private usuarioService: UsuarioService,
    private publicacionService: PublicacionService
  ) {}

  ngOnInit() {
    this.usuarioService.getPerfil().subscribe((usuario) => {
      this.usuario = usuario;
    });
    this.publicacionService.getPublicaciones().subscribe((pubs) => {
      this.publicaciones = pubs;
    });
  }

  agregarPublicacion(pub: Publicacion) {
    this.publicacionService.agregarPublicacion(pub);
    this.publicaciones = [pub, ...this.publicaciones];
  }

  agregarComentario(index: number, comentario: Comentario) {
    this.publicacionService.agregarComentario(index, comentario);
    this.publicaciones[index].comentarios =
      this.publicaciones[index].comentarios || [];
    this.publicaciones[index].comentarios!.push(comentario);
  }

  editarPerfil() {
    // Reemplazar por modal en el futuro o funcionalidad de edición
    alert('Funcionalidad de edición próximamente');
  }
}
