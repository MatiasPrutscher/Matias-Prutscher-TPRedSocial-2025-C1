import {
  Component,
  OnInit,
  HostListener,
  ChangeDetectorRef,
} from '@angular/core';
import { PublicacionService } from '../../services/publicacion/publicacion.service';
import { AuthService } from '../../services/auth/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PublicacionCardComponent } from '../../shared/publicacion-card/publicacion-card.component';
import { ImagenUtilService } from '../../services/imagen-util/imagen-util.service';
import { LoadingSpinnerComponent } from '../../shared/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-publicaciones',
  imports: [
    CommonModule,
    FormsModule,
    PublicacionCardComponent,
    LoadingSpinnerComponent,
  ],
  templateUrl: './publicaciones.component.html',
  styleUrls: ['./publicaciones.component.css'],
})
export class PublicacionesComponent implements OnInit {
  cargando = false;
  publicaciones: any[] = [];
  orden: 'fecha' | 'likes' = 'fecha';
  pagina = 0;
  limite = 5;
  fin = false;
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
    public authService: AuthService,
    public imagenUtil: ImagenUtilService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarPublicaciones();
  }

  cargarPublicaciones(append = false) {
    if (this.cargando || this.fin) return;
    this.cargando = true;
    this.publicacionService
      .getPublicaciones({
        orden: this.orden,
        offset: this.pagina * this.limite,
        limit: this.limite,
      })
      .subscribe({
        next: (pubs) => {
          console.log('Primer publicación:', pubs[0]);
          if (append) {
            this.publicaciones = [...this.publicaciones, ...pubs];
          } else {
            this.publicaciones = pubs;
          }
          if (pubs.length < this.limite) {
            this.fin = true;
          }
          this.cargando = false;
        },
        error: () => {
          this.cargando = false;
        },
      });
  }

  cambiarOrden(nuevoOrden: 'fecha' | 'likes') {
    this.orden = nuevoOrden;
    this.pagina = 0;
    this.fin = false;
    this.cargarPublicaciones();
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
      next: () => {
        this.pagina = 0;
        this.fin = false;
        this.cargarPublicaciones();
      },
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

  eliminarPublicacionLocal(id: string) {
    this.publicaciones = this.publicaciones.filter((pub) => pub._id !== id);
    this.cdr.detectChanges();
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (this.cargando || this.fin) return;
    const scrollPosition = window.innerHeight + window.scrollY;
    const threshold = document.body.offsetHeight - 100;
    if (scrollPosition >= threshold) {
      this.pagina++;
      this.cargarPublicaciones(true);
    }
  }
}
