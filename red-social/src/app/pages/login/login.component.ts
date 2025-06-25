import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { NgClass } from '@angular/common';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';
import { SesionModalComponent } from '../../shared/sesion-modal/sesion-modal.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, NgClass, SesionModalComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  loginForm: FormGroup;
  passwordVisible = false;
  isSubmitting = false;

  modalError = {
    visible: false,
    mensaje: '',
  };

  quickUsers = [
    {
      label: '1',
      userOrEmail: 'usuario1@mail.com.ar',
      password: 'ContraseñaUsuario1',
    },
    {
      label: '2',
      userOrEmail: 'usuario2@mail.com.ar',
      password: 'ContraseñaUsuario2',
    },
    {
      label: '3',
      userOrEmail: 'usuario3@mail.com.ar',
      password: 'ContraseñaUsuario3',
    },
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      userOrEmail: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  getErrorMessage(field: string): string {
    const control = this.loginForm.get(field);
    if (!control || (!control.touched && !control.dirty)) return '';

    if (control.hasError('required')) {
      return field === 'userOrEmail'
        ? 'Ingrese su usuario o correo'
        : 'La contraseña es obligatoria';
    }
    if (control.hasError('minlength'))
      return 'Debe tener al menos 8 caracteres';
    if (control.hasError('pattern') && field === 'password')
      return 'Debe tener una mayúscula y un número';
    return '';
  }

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }

  onSubmit() {
    this.isSubmitting = true;
    if (this.loginForm.valid) {
      const { userOrEmail, password } = this.loginForm.value;
      this.authService.login(userOrEmail, password).subscribe({
        next: (usuario) => {
          this.authService.saveUser(usuario);
          this.authService.iniciarContadorSesion();
          this.router.navigate(['/publicaciones']);
        },
        error: (err) => {
          this.modalError.visible = true;
          this.modalError.mensaje =
            'Error en el login: ' + (err.error?.message || '');
          this.isSubmitting = false;
        },
      });
    } else {
      this.isSubmitting = false;
      this.loginForm.markAllAsTouched();
    }
  }

  cerrarModalError() {
    this.modalError.visible = false;
    this.modalError.mensaje = '';
  }

  quickLogin(userOrEmail: string, password: string) {
    this.loginForm.patchValue({ userOrEmail, password });
    this.onSubmit();
  }
}
