import { Component } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-sesion-modal',
  imports: [],
  templateUrl: './sesion-modal.component.html',
  styleUrls: ['./sesion-modal.component.css'],
  standalone: true,
})
export class SesionModalComponent {
  constructor(public authService: AuthService) {}
}
