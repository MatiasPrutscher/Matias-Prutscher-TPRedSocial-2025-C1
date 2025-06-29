import { Component } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { SesionModalComponent } from './shared/sesion-modal/sesion-modal.component';
import { AuthService } from './services/auth/auth.service';
import { LoadingSpinnerComponent } from './shared/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    NavbarComponent,
    SesionModalComponent,
    LoadingSpinnerComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  cargando = true;

  constructor(public authService: AuthService, private router: Router) {
    // Validar token al iniciar la app
    this.authService.autorizar().subscribe({
      next: () => {
        this.cargando = false;
        // Si ya está en login/register, redirigir a publicaciones
        if (['/login', '/register', '/'].includes(this.router.url)) {
          this.router.navigate(['/publicaciones']);
        }
      },
      error: () => {
        this.cargando = false;
        // Si no está en login/register, redirigir a login
        if (!['/login', '/register'].includes(this.router.url)) {
          this.router.navigate(['/login']);
        }
      },
    });

    // Seguir reiniciando el contador en cada navegación
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        if (this.authService.getToken()) {
          this.authService.iniciarContadorSesion();
        } else {
          this.authService.mostrarModalSesion = false;
          clearTimeout(this.authService.timeoutSesion);
          clearTimeout(this.authService.timeoutAdvertencia);
        }
      }
    });
  }

  renovarSesion() {
    this.authService.refrescarToken().subscribe({
      next: () => {
        this.authService.mostrarModalSesion = false;
        this.authService.iniciarContadorSesion();
      },
      error: () => {
        this.authService.logout();
      },
    });
  }

  cerrarSesionPorInactividad() {
    this.authService.mostrarModalSesion = false;
    this.authService.logout();
  }
}
