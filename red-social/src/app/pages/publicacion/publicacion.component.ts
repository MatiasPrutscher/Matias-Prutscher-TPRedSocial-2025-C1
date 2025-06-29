import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PublicacionService } from '../../services/publicacion/publicacion.service';
import { ComentarioService } from '../../services/comentario/comentario.service';
import { AuthService } from '../../services/auth/auth.service';
import { PublicacionCardComponent } from '../../shared/publicacion-card/publicacion-card.component';
import { CommonModule } from '@angular/common';
import { LoadingSpinnerComponent } from '../../shared/loading-spinner/loading-spinner.component';
import { FormsModule } from '@angular/forms';
import { ImagenUtilService } from '../../services/imagen-util/imagen-util.service';
import { Comentario } from '../../interfaces/red-social-model';
import { SesionModalComponent } from '../../shared/sesion-modal/sesion-modal.component';

@Component({
  selector: 'app-publicacion',
  imports: [
    PublicacionCardComponent,
    CommonModule,
    LoadingSpinnerComponent,
    FormsModule,
    SesionModalComponent,
  ],
  templateUrl: './publicacion.component.html',
  styleUrls: ['./publicacion.component.css'],
})
export class PublicacionComponent implements OnInit {
  publicacion: any;
  comentarios: any[] = [];
  cargando = false;
  cargandoComentarios = false;
  errorMsg = '';
  comentarioNuevo = '';
  pagina = 0;
  limite = 5;
  finComentarios = false;
  errorModalVisible = false;
  errorModalMsg = '';

  // Para el modal de confirmación de eliminación
  comentarioAEliminar: Comentario | null = null;
  confirmarEliminarVisible = false;

  constructor(
    private route: ActivatedRoute,
    private publicacionService: PublicacionService,
    private comentarioService: ComentarioService,
    public authService: AuthService,
    public imagenUtil: ImagenUtilService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cargarPublicacion(id);
      this.cargarComentarios(id);
    }
  }

  cargarPublicacion(id: string) {
    this.cargando = true;
    this.publicacionService.getPublicacion(id).subscribe({
      next: (pub) => {
        this.publicacion = pub;
        this.cargando = false;
      },
      error: (err) => {
        this.errorMsg =
          err.status === 404
            ? 'La publicación no existe o fue eliminada.'
            : 'No se pudo cargar la publicación';
        this.cargando = false;
      },
    });
  }

  cargarComentarios(id: string, append = false) {
    if (this.cargandoComentarios || this.finComentarios) return;
    this.cargandoComentarios = true;
    this.comentarioService
      .getComentarios(id, this.pagina * this.limite, this.limite)
      .subscribe({
        next: (coms) => {
          if (append) {
            this.comentarios = [...this.comentarios, ...coms];
          } else {
            this.comentarios = coms;
          }
          if (coms.length < this.limite) this.finComentarios = true;
          this.cargandoComentarios = false;
        },
        error: (err) => {
          this.errorMsg = 'No se pudieron cargar los comentarios';
          this.cargandoComentarios = false;
        },
      });
  }

  cargarMasComentarios() {
    this.pagina++;
    this.cargarComentarios(this.publicacion._id, true);
  }

  agregarComentario() {
    if (!this.comentarioNuevo.trim()) return;
    this.comentarioService
      .agregarComentario(this.publicacion._id, this.comentarioNuevo)
      .subscribe({
        next: (nuevo: Comentario) => {
          nuevo.usuario = this.authService.getUser();
          this.comentarios.unshift(nuevo);
          this.comentarioNuevo = '';
          if (
            this.publicacion &&
            typeof this.publicacion.comentariosCount === 'number'
          ) {
            this.publicacion.comentariosCount++;
          }
        },
        error: () => {
          this.errorMsg = 'No se pudo agregar el comentario';
        },
      });
  }

  editarComentario(com: Comentario) {
    com.editando = true;
    com.textoEdit = com.texto;
  }

  cancelarEdicionComentario(com: Comentario) {
    com.editando = false;
  }

  guardarComentario(com: Comentario) {
    if (!com._id || !com.textoEdit) return;
    this.comentarioService.editarComentario(com._id, com.textoEdit).subscribe({
      next: () => {
        com.texto = com.textoEdit!;
        com.editando = false;
        com.modificado = true;
      },
      error: () => {
        this.errorModalMsg = 'No se pudo editar el comentario';
        this.errorModalVisible = true;
      },
    });
  }

  cerrarErrorModal() {
    this.errorModalVisible = false;
  }

  // --- Eliminación con modal de confirmación ---
  pedirConfirmacionEliminar(com: Comentario) {
    this.comentarioAEliminar = com;
    this.confirmarEliminarVisible = true;
  }

  confirmarEliminarComentario() {
    if (!this.comentarioAEliminar) return;
    this.comentarioService.eliminarComentario(this.comentarioAEliminar._id!).subscribe({
      next: () => {
        this.comentarios = this.comentarios.filter(
          (c) => c._id !== this.comentarioAEliminar!._id
        );
        if (
          this.publicacion &&
          typeof this.publicacion.comentariosCount === 'number' &&
          this.publicacion.comentariosCount > 0
        ) {
          this.publicacion.comentariosCount--;
        }
        this.confirmarEliminarVisible = false;
        this.comentarioAEliminar = null;
      },
      error: () => {
        this.errorModalMsg = 'No se pudo eliminar el comentario';
        this.errorModalVisible = true;
        this.confirmarEliminarVisible = false;
        this.comentarioAEliminar = null;
      },
    });
  }

  cancelarEliminarComentario() {
    this.confirmarEliminarVisible = false;
    this.comentarioAEliminar = null;
  }
}
