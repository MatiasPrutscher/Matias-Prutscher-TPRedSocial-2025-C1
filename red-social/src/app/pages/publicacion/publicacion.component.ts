import { Component, NgModule, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PublicacionService } from '../../services/publicacion/publicacion.service';
import { ComentarioService } from '../../services/comentario/comentario.service';
import { AuthService } from '../../services/auth/auth.service';
import { PublicacionCardComponent } from '../../shared/publicacion-card/publicacion-card.component';
import { CommonModule } from '@angular/common';
import { LoadingSpinnerComponent } from '../../shared/loading-spinner/loading-spinner.component';
import { FormsModule } from '@angular/forms';
import { ImagenUtilService } from '../../services/imagen-util/imagen-util.service';

@Component({
  selector: 'app-publicacion',
  imports: [
    PublicacionCardComponent,
    CommonModule,
    LoadingSpinnerComponent,
    FormsModule,
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
          console.log('Comentarios recibidos:', coms);
          if (append) {
            this.comentarios = [...this.comentarios, ...coms];
          } else {
            this.comentarios = coms;
          }
          if (coms.length < this.limite) this.finComentarios = true;
          this.cargandoComentarios = false;
          console.log('Array comentarios en componente:', this.comentarios);
        },
        error: (err) => {
          this.errorMsg = 'No se pudieron cargar los comentarios';
          this.cargandoComentarios = false;
          console.error('Error al cargar comentarios:', err);
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
        next: (nuevo) => {
          this.comentarios.unshift(nuevo);
          this.comentarioNuevo = '';
        },
        error: () => {
          this.errorMsg = 'No se pudo agregar el comentario';
        },
      });
  }
}
