import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { UsuarioPerfil, Publicacion } from '../../interfaces/red-social-model';
import { UsuarioService } from '../../services/usuario/usuario.service';
import { PublicacionService } from '../../services/publicacion/publicacion.service';
import { AuthService } from '../../services/auth/auth.service';
import { PublicacionCardComponent } from '../../shared/publicacion-card/publicacion-card.component';
import { ImagenUtilService } from '../../services/imagen-util/imagen-util.service';
import { LoadingSpinnerComponent } from '../../shared/loading-spinner/loading-spinner.component';
import { SesionModalComponent } from '../../shared/sesion-modal/sesion-modal.component';

@Component({
  selector: 'app-mi-perfil',
  imports: [
    CommonModule,
    PublicacionCardComponent,
    LoadingSpinnerComponent,
    SesionModalComponent,
  ],
  templateUrl: './mi-perfil.component.html',
  styleUrls: ['./mi-perfil.component.css'],
})
export class MiPerfilComponent implements OnInit {
  usuario?: UsuarioPerfil;
  cargando = false;
  publicaciones: Publicacion[] = [];

  modalInfo = {
    visible: false,
    mensaje: '',
  };

  constructor(
    private usuarioService: UsuarioService,
    private publicacionService: PublicacionService,
    public authService: AuthService,
    public imagenUtil: ImagenUtilService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarPerfil();
    this.cargarPublicaciones();
  }

  cargarPerfil() {
    this.usuarioService.getPerfil().subscribe({
      next: (perfil) => {
        this.usuario = perfil;
      },
      error: () => {
        this.usuario = undefined;
      },
    });
  }

  cargarPublicaciones() {
    this.cargando = true;
    this.publicacionService
      .getPublicaciones({
        usuario: this.authService.getUser()?._id,
        orden: 'fecha',
        limit: 3,
      })
      .subscribe({
        next: (pubs) => {
          this.publicaciones = pubs;
          this.cargando = false;
        },
        error: () => {
          this.cargando = false;
        },
      });
  }

  eliminarPublicacionLocal(id: string) {
    this.publicaciones = this.publicaciones.filter((pub) => pub._id !== id);
    this.cdr.detectChanges();
  }

  editarPerfil() {
    this.modalInfo.visible = true;
    this.modalInfo.mensaje = 'Funcionalidad de edición próximamente';
  }

  cerrarModalInfo() {
    this.modalInfo.visible = false;
    this.modalInfo.mensaje = '';
  }

  test(url: string) {
    console.log(url);
    console.log(this.usuario);
  }
}
