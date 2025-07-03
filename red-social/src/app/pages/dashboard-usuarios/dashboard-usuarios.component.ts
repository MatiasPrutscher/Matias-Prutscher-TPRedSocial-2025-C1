import { Component, OnInit } from '@angular/core';
import { UsuarioService } from '../../services/usuario/usuario.service';
import { AuthService } from '../../services/auth/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SesionModalComponent } from '../../shared/sesion-modal/sesion-modal.component';
import { LoadingSpinnerComponent } from '../../shared/loading-spinner/loading-spinner.component';
import { ImagenUtilService } from '../../services/imagen-util/imagen-util.service';

@Component({
  selector: 'app-dashboard-usuarios',
  imports: [
    CommonModule,
    FormsModule,
    SesionModalComponent,
    LoadingSpinnerComponent,
  ],
  templateUrl: './dashboard-usuarios.component.html',
  styleUrls: ['./dashboard-usuarios.component.css'],
})
export class DashboardUsuariosComponent implements OnInit {
  usuarios: any[] = [];
  cargando = false;
  modalError = { visible: false, mensaje: '' };
  modalConfirmar = { visible: false, id: '', accion: '' };
  nuevoUsuario = {
    nombre: '',
    apellido: '',
    mail: '',
    nombreUsuario: '',
    password: '',
    repetirPassword: '',
    perfil: 'usuario',
  };
  creando = false;

  constructor(
    private usuarioService: UsuarioService,
    private authService: AuthService,
    public imagenUtil: ImagenUtilService
  ) {}

  ngOnInit() {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.cargando = true;
    this.usuarioService.listarUsuarios().subscribe({
      next: (usuarios) => {
        this.usuarios = usuarios;
        this.cargando = false;
      },
      error: (err) => {
        this.modalError.visible = true;
        this.modalError.mensaje =
          err.error?.message || 'Error al cargar usuarios';
        this.cargando = false;
      },
    });
  }

  abrirModalConfirmar(id: string, accion: string) {
    this.modalConfirmar = { visible: true, id, accion };
  }

  cerrarModalConfirmar() {
    this.modalConfirmar = { visible: false, id: '', accion: '' };
  }

  confirmarAccion() {
    if (this.modalConfirmar.accion === 'baja') {
      this.usuarioService.bajaUsuario(this.modalConfirmar.id).subscribe({
        next: () => {
          this.cargarUsuarios();
          this.cerrarModalConfirmar();
        },
        error: (err) => {
          this.modalError.visible = true;
          this.modalError.mensaje =
            err.error?.message || 'Error al deshabilitar usuario';
        },
      });
    } else if (this.modalConfirmar.accion === 'alta') {
      this.usuarioService.altaUsuario(this.modalConfirmar.id).subscribe({
        next: () => {
          this.cargarUsuarios();
          this.cerrarModalConfirmar();
        },
        error: (err) => {
          this.modalError.visible = true;
          this.modalError.mensaje =
            err.error?.message || 'Error al habilitar usuario';
        },
      });
    }
  }

  crearUsuario() {
    this.creando = true;
    this.usuarioService.crearUsuario(this.nuevoUsuario).subscribe({
      next: () => {
        this.cargarUsuarios();
        this.nuevoUsuario = {
          nombre: '',
          apellido: '',
          mail: '',
          nombreUsuario: '',
          password: '',
          repetirPassword: '',
          perfil: 'usuario',
        };
        this.creando = false;
      },
      error: (err) => {
        this.modalError.visible = true;
        this.modalError.mensaje =
          err.error?.message || 'Error al crear usuario';
        this.creando = false;
      },
    });
  }

  cerrarModalError() {
    this.modalError.visible = false;
    this.modalError.mensaje = '';
  }

  esAdmin() {
    return this.authService.getUser()?.perfil === 'administrador';
  }

  cambiarPerfil(usuarioId: string, nuevoPerfil: string) {
    this.usuarioService
      .editarUsuario(usuarioId, { perfil: nuevoPerfil })
      .subscribe({
        next: () => {
          console.log('Perfil actualizado');
        },
        error: (err) => {
          this.modalError.visible = true;
          this.modalError.mensaje =
            err.error?.message || 'Error al cambiar perfil';
          this.cargarUsuarios(); // Revertir cambio
        },
      });
  }
}
