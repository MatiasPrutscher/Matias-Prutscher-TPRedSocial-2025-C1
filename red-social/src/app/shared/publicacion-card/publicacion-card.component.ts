import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ImagenUtilService } from '../../services/imagen-util/imagen-util.service';
import { PublicacionService } from '../../services/publicacion/publicacion.service';
import { AuthService } from '../../services/auth/auth.service';
import { SesionModalComponent } from '../sesion-modal/sesion-modal.component';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Publicacion } from '../../interfaces/red-social-model';

@Component({
  selector: 'app-publicacion-card',
  imports: [CommonModule, SesionModalComponent, FormsModule],
  templateUrl: './publicacion-card.component.html',
  styleUrl: './publicacion-card.component.css',
})
export class PublicacionCardComponent {
  @Input() publicacion: any;
  @Input() usuarioActual: any;
  @Input() detalle = false;
  @Output() eliminada = new EventEmitter<string>();
  mostrarModalConfirmar = false;
  modalEditarVisible = false;
  modalErrorVisible = false;
  editTitulo = '';
  editMensaje = '';
  modalErrorMsg = '';

  constructor(
    public imagenUtil: ImagenUtilService,
    private publicacionService: PublicacionService,
    private authService: AuthService,
    private router: Router
  ) {}

  puedeEliminar(): boolean {
    return (
      this.publicacion?.usuario?._id === this.usuarioActual?._id ||
      this.usuarioActual?.perfil === 'administrador'
    );
  }

  isLikedByCurrentUser(): boolean {
    const userId = this.usuarioActual?._id || this.usuarioActual?.userId;
    if (!userId) return false;
    return (this.publicacion.usuariosLike || [])
      .map((id: any) => id.toString())
      .includes(userId.toString());
  }

  getAvatarUrl(usuario: any): string {
    return this.imagenUtil.getAvatarUrl(usuario);
  }

  getImagenUrl(imagen: string): string {
    return this.imagenUtil.getImagenUrl(imagen);
  }

  toggleLike() {
    const user = this.authService.getUser();
    const userId = user?._id || user?.userId;
    if (!userId) return;
    const likeList = (this.publicacion.usuariosLike || []).map((id: any) =>
      id.toString()
    );
    if (likeList.includes(userId.toString())) {
      this.publicacionService.quitarLike(this.publicacion._id).subscribe(() => {
        this.publicacion.usuariosLike = this.publicacion.usuariosLike.filter(
          (id: any) => id.toString() !== userId.toString()
        );
        this.publicacion.likes = (this.publicacion.likes || 1) - 1;
      });
    } else {
      this.publicacionService.darLike(this.publicacion._id).subscribe(() => {
        if (!this.publicacion.usuariosLike) this.publicacion.usuariosLike = [];
        this.publicacion.usuariosLike.push(userId);
        this.publicacion.likes = (this.publicacion.likes || 0) + 1;
      });
    }
  }

  eliminarPublicacion() {
    this.mostrarModalConfirmar = true;
  }
  confirmarEliminar() {
    this.mostrarModalConfirmar = false;
    this.publicacionService
      .eliminarPublicacion(this.publicacion._id)
      .subscribe(() => {
        this.eliminada.emit(this.publicacion._id);
      });
  }
  cancelarEliminar() {
    this.mostrarModalConfirmar = false;
  }

  abrirComentarios() {
    this.router.navigate(['/publicacion', this.publicacion._id]);
  }

  abrirModalEditar() {
    this.editTitulo = this.publicacion.titulo;
    this.editMensaje = this.publicacion.mensaje;
    this.modalEditarVisible = true;
  }

  cerrarModalEditar() {
    this.modalEditarVisible = false;
  }

  guardarEdicion() {
    this.publicacionService
      .editarPublicacion(this.publicacion._id, {
        titulo: this.editTitulo,
        mensaje: this.editMensaje,
      })
      .subscribe({
        next: (pubEditada: Publicacion) => {
          this.publicacion.titulo = pubEditada.titulo;
          this.publicacion.mensaje = pubEditada.mensaje;
          this.cerrarModalEditar();
        },
        error: () => {
          this.modalErrorMsg = 'No se pudo editar la publicación';
          this.modalErrorVisible = true;
        },
      });
  }

  cerrarModalError() {
    this.modalErrorVisible = false;
  }
}
