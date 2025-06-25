import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { SesionModalComponent } from '../../shared/sesion-modal/sesion-modal.component';

@Component({
  selector: 'app-register',
  imports: [FormsModule, ReactiveFormsModule, NgClass, SesionModalComponent],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  registerForm: FormGroup;
  profilePreview: string | ArrayBuffer | null = null;
  passwordVisible = false;
  confirmPasswordVisible = false;
  passwordStrength: 'Débil' | 'Media' | 'Fuerte' | '' = '';
  imageError: string = '';
  isSubmitting = false;
  modalError = {
    visible: false,
    mensaje: '',
  };

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.formBuilder.group(
      {
        name: ['', Validators.required],
        surname: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        username: ['', Validators.required],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern(/(?=.*[0-9])(?=.*[A-Z])/),
          ],
        ],
        confirmPassword: ['', Validators.required],
        dateOfBirth: ['', Validators.required],
        description: [''],
        profileImage: [null],
      },
      { validator: this.passwordMatchValidator }
    );
  }

  passwordMatchValidator(formGroup: FormGroup) {
    return formGroup.get('password')?.value ===
      formGroup.get('confirmPassword')?.value
      ? null
      : { mismatch: true };
  }

  onSubmit() {
    this.isSubmitting = true;
    if (this.registerForm.valid && !this.imageError) {
      const formData = new FormData();
      formData.append('nombre', this.registerForm.value.name);
      formData.append('apellido', this.registerForm.value.surname);
      formData.append('mail', this.registerForm.value.email);
      formData.append('nombreUsuario', this.registerForm.value.username);
      formData.append('password', this.registerForm.value.password);
      formData.append(
        'repetirPassword',
        this.registerForm.value.confirmPassword
      );
      // Convierte la fecha a dd-mm-aaaa si es necesario
      const fecha = this.registerForm.value.dateOfBirth;
      if (fecha) {
        const [yyyy, mm, dd] = fecha.split('-'); // yyyy-mm-dd
        formData.append('fechaNacimiento', `${dd}-${mm}-${yyyy}`);
      }
      formData.append('descripcion', this.registerForm.value.description || '');
      formData.append('perfil', 'usuario');
      if (this.registerForm.value.profileImage) {
        formData.append('imagen', this.registerForm.value.profileImage);
      }
      this.authService.register(formData).subscribe({
        next: (usuario) => {
          this.authService.saveUser(usuario);
          this.authService.iniciarContadorSesion();
          this.router.navigate(['/publicaciones']);
        },
        error: (err) => {
          this.modalError.visible = true;
          this.modalError.mensaje =
            'Error en el registro: ' + (err.error?.message || '');
          this.isSubmitting = false;
        },
      });
    } else {
      this.isSubmitting = false;
      this.registerForm.markAllAsTouched();
    }
  }

  cerrarModalError() {
    this.modalError.visible = false;
    this.modalError.mensaje = '';
  }

  onFileChange(event: any) {
    this.imageError = '';
    const file = event.target.files[0];
    if (file) {
      // Validación de tipo y tamaño
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        this.imageError = 'Solo se permiten imágenes JPG, PNG o WEBP.';
        this.profilePreview = null;
        this.registerForm.patchValue({ profileImage: null });
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        this.imageError = 'La imagen no debe superar los 2MB.';
        this.profilePreview = null;
        this.registerForm.patchValue({ profileImage: null });
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          this.profilePreview = reader.result;
          this.registerForm.patchValue({ profileImage: file });
        } else {
          this.profilePreview = null;
        }
      };
      reader.readAsDataURL(file);
    } else {
      this.profilePreview = null;
      this.registerForm.patchValue({ profileImage: null });
    }
  }

  removeImage() {
    this.profilePreview = null;
    this.registerForm.patchValue({ profileImage: null });
    this.imageError = '';
    // Limpia el input file visualmente
    const input = document.getElementById('profileImage') as HTMLInputElement;
    if (input) input.value = '';
  }

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }

  toggleConfirmPasswordVisibility() {
    this.confirmPasswordVisible = !this.confirmPasswordVisible;
  }

  onPasswordInput() {
    const value = this.registerForm.get('password')?.value || '';
    if (value.length < 8) {
      this.passwordStrength = 'Débil';
    } else if (
      /[A-Z]/.test(value) &&
      /[0-9]/.test(value) &&
      /[a-z]/.test(value) &&
      value.length >= 12
    ) {
      this.passwordStrength = 'Fuerte';
    } else if (/[A-Z]/.test(value) && /[0-9]/.test(value)) {
      this.passwordStrength = 'Media';
    } else {
      this.passwordStrength = 'Débil';
    }
  }

  getErrorMessage(field: string): string {
    const control = this.registerForm.get(field);
    if (!control || (!control.touched && !control.dirty)) return '';

    if (control.hasError('required')) {
      switch (field) {
        case 'name':
          return 'El nombre es obligatorio';
        case 'surname':
          return 'El apellido es obligatorio';
        case 'email':
          return 'El correo electrónico es obligatorio';
        case 'username':
          return 'El nombre de usuario es obligatorio';
        case 'password':
          return 'La contraseña es obligatoria';
        case 'confirmPassword':
          return 'Debe repetir la contraseña';
        case 'dateOfBirth':
          return 'La fecha de nacimiento es obligatoria';
        default:
          return 'Este campo es obligatorio';
      }
    }
    if (control.hasError('email')) return 'Correo electrónico inválido';
    if (control.hasError('minlength'))
      return 'Debe tener al menos 8 caracteres';
    if (control.hasError('pattern') && field === 'password')
      return 'Debe tener una mayúscula y un número';
    if (field === 'confirmPassword' && this.registerForm.errors?.['mismatch'])
      return 'Las contraseñas no coinciden';

    return '';
  }
}
