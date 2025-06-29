import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): Observable<boolean> {
    const token = this.auth.getToken();
    if (!token) {
      this.router.navigate(['/login']);
      return of(false);
    }
    // Valida el token con el backend
    return this.auth.autorizar().pipe(
      map(() => true),
      catchError(() => {
        this.auth.logout();
        return of(false);
      })
    );
  }
}
