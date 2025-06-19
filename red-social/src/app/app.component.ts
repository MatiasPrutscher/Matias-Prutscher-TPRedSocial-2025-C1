import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { SesionModalComponent } from './shared/sesion-modal/sesion-modal.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, SesionModalComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'red-social';
}
