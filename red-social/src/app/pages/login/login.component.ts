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

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, NgClass],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  loginForm: FormGroup;
  passwordVisible = false;
  isSubmitting = false;

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
    const { userOrEmail, password } = this.loginForm.value;
    if (this.loginForm.valid) {
      this.authService.login(userOrEmail, password).subscribe({
        next: (usuario) => {
          this.authService.saveUser(usuario);
          console.log('Usuario logueado:', usuario);
          this.router.navigate(['/publicaciones']);
        },
        error: (err) => {
          alert('Error en el login: ' + (err.error?.message || ''));
          this.isSubmitting = false;
        },
      });
    } else {
      this.isSubmitting = false;
      this.loginForm.markAllAsTouched();
    }
  }
}
