import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sesion-modal',
  imports: [CommonModule],
  templateUrl: './sesion-modal.component.html',
  styleUrls: ['./sesion-modal.component.css'],
  standalone: true,
})
export class SesionModalComponent {
  @Input() visible = false;
  @Input() titulo = '';
  @Input() mensaje = '';
  @Input() textoAceptar = 'Aceptar';
  @Input() textoCancelar = 'Cancelar';
  @Input() icono = 'fa-question-circle';

  @Output() aceptar = new EventEmitter<void>();
  @Output() cancelar = new EventEmitter<void>();

  constructor(public authService: AuthService) {}

  onBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.cancelar.emit();
    }
  }
}
