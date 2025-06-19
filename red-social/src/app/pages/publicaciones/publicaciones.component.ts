import { Component, OnInit } from '@angular/core';
import { PublicacionService } from '../../services/publicacion/publicacion.service';
import { AuthService } from '../../services/auth/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-publicaciones',
  imports: [CommonModule, FormsModule],
  templateUrl: './publicaciones.component.html',
  styleUrls: ['./publicaciones.component.css'],
})
export class PublicacionesComponent implements OnInit {
  publicaciones: any[] = [];
  orden: 'fecha' | 'likes' = 'fecha';
  pagina = 0;
  limite = 10;
  nuevaPublicacion = { titulo: '', mensaje: '', imagen: null as File | null };
  isSubmitting = false;
  errorMsg = '';

  modalConfirmar = {
    visible: false,
    id: '',
    titulo: 'Confirmar eliminación',
    mensaje: '¿Seguro que deseas eliminar esta publicación?',
  };
  modalError = {
    visible: false,
    mensaje: '',
  };

  constructor(
    private publicacionService: PublicacionService,
    public authService: AuthService
  ) {}

  ngOnInit() {
    this.cargarPublicaciones();
  }

  cargarPublicaciones() {
    this.publicacionService
      .getPublicaciones({
        orden: this.orden,
        offset: this.pagina * this.limite,
        limit: this.limite,
      })
      .subscribe((pubs) => (this.publicaciones = pubs));
  }

  cambiarOrden(nuevoOrden: 'fecha' | 'likes') {
    this.orden = nuevoOrden;
    this.pagina = 0;
    this.cargarPublicaciones();
  }

  paginaSiguiente() {
    this.pagina++;
    this.cargarPublicaciones();
  }

  paginaAnterior() {
    if (this.pagina > 0) this.pagina--;
    this.cargarPublicaciones();
  }

  toggleLike(pub: any) {
    const user = this.authService.getUser();
    const userId = user?._id || user?.userId;
    if (!userId) return;
    const likeList = (pub.usuariosLike || []).map((id: any) => id.toString());
    if (likeList.includes(userId.toString())) {
      this.publicacionService
        .quitarLike(pub._id)
        .subscribe(() => this.cargarPublicaciones());
    } else {
      this.publicacionService
        .darLike(pub._id)
        .subscribe(() => this.cargarPublicaciones());
    }
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    this.nuevaPublicacion.imagen = file ? file : null;
  }

  onSubmit() {
    this.isSubmitting = true;
    this.errorMsg = '';
    if (!this.nuevaPublicacion.titulo || !this.nuevaPublicacion.mensaje) {
      this.errorMsg = 'El título y el mensaje son obligatorios.';
      this.isSubmitting = false;
      return;
    }
    const formData = new FormData();
    formData.append('titulo', this.nuevaPublicacion.titulo);
    formData.append('mensaje', this.nuevaPublicacion.mensaje);
    if (this.nuevaPublicacion.imagen) {
      formData.append('imagen', this.nuevaPublicacion.imagen);
    }
    this.publicacionService.crearPublicacion(formData).subscribe({
      next: () => {
        this.nuevaPublicacion = { titulo: '', mensaje: '', imagen: null };
        (
          document.querySelector(
            'input[type="file"][name="imagen"]'
          ) as HTMLInputElement
        ).value = '';
        this.isSubmitting = false;
        this.cargarPublicaciones();
      },
      error: (err) => {
        this.errorMsg = err.error?.message || 'Error al publicar';
        this.isSubmitting = false;
      },
    });
  }

  getImagenUrl(imagen: string) {
    if (!imagen) return 'assets/avatar-default.png';
    if (imagen.startsWith('http')) return imagen;
    return environment.assetsUrl + imagen;
  }

  getAvatarUrl(usuario: any) {
    if (usuario?.imagen) {
      if (usuario.imagen.startsWith('http')) return usuario.imagen;
      return environment.assetsUrl + usuario.imagen;
    }
    return 'assets/avatar-default.png';
  }

  trackById(index: number, item: any) {
    return item._id;
  }

  abrirModalConfirmar(id: string) {
    this.modalConfirmar.visible = true;
    this.modalConfirmar.id = id;
  }
  cerrarModalConfirmar() {
    this.modalConfirmar.visible = false;
    this.modalConfirmar.id = '';
  }
  confirmarEliminarPublicacion() {
    const id = this.modalConfirmar.id;
    this.cerrarModalConfirmar();
    this.publicacionService.eliminarPublicacion(id).subscribe({
      next: () => this.cargarPublicaciones(),
      error: () => {
        this.modalError.visible = true;
        this.modalError.mensaje = 'No se pudo eliminar la publicación';
      },
    });
  }

  cerrarModalError() {
    this.modalError.visible = false;
    this.modalError.mensaje = '';
  }

  isLikedByCurrentUser(pub: any): boolean {
    const user = this.authService.getUser();
    const userId = user?._id || user?.userId;
    if (!userId) return false;
    return (pub.usuariosLike || [])
      .map((id: any) => id.toString())
      .includes(userId.toString());
  }
}
