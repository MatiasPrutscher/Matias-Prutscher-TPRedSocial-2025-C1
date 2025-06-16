import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  UsuarioPerfil,
  Publicacion,
  Comentario,
} from '../../interfaces/red-social-model';
import { UsuarioService } from '../../services/usuario/usuario.service';
import { PublicacionService } from '../../services/publicacion/publicacion.service';
import { AuthService } from '../../services/auth/auth.service'; // Agregá este import ☺

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
    private publicacionService: PublicacionService,
    public authService: AuthService
  ) {}

  ngOnInit() {
    this.usuarioService.getPerfil().subscribe((usuario) => {
      this.usuario = usuario;
    });
    this.publicacionService
      .getPublicaciones({
        usuario: this.authService.getUser()?._id,
        orden: 'fecha',
        limit: 3,
      })
      .subscribe((pubs) => {
        this.publicaciones = pubs;
      });
  }

  agregarPublicacion(pub: Publicacion) {
    this.publicaciones = [pub, ...this.publicaciones];
  }

  agregarComentario(index: number, comentario: Comentario) {
    this.publicaciones[index].comentarios =
      this.publicaciones[index].comentarios || [];
    this.publicaciones[index].comentarios!.push(comentario);
  }

  editarPerfil() {
    // Reemplazar por modal en el futuro o funcionalidad de edición
    alert('Funcionalidad de edición próximamente');
  }
}
