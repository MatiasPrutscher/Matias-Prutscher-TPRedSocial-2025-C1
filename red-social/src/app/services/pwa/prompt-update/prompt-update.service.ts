import { Injectable, inject } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

@Injectable({ providedIn: 'root' })
export class PromptUpdateService {
  constructor(private toastr: ToastrService) {
    const swUpdate = inject(SwUpdate);
    swUpdate.versionUpdates
      .pipe(
        filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY')
      )
      .subscribe((evt) => {
        this.toastr.info('Hay una nueva versión disponible. Recargando...', 'Actualización', { timeOut: 5000 });
        document.location.reload();
      });

    // Mostrar mensaje si ya está en la última versión
    swUpdate.versionUpdates
      .pipe(
        filter((evt) => evt.type === 'NO_NEW_VERSION_DETECTED')
      )
      .subscribe(() => {
        this.toastr.success('Estás usando la última versión de la aplicación.', '¡Actualizado!', { timeOut: 3000 });
      });
  }
}
