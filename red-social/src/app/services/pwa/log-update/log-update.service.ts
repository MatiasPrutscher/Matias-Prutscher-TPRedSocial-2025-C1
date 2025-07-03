import { Injectable, inject } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { ToastrService } from 'ngx-toastr';

@Injectable({ providedIn: 'root' })
export class LogUpdateService {
  private updates = inject(SwUpdate);
  constructor(private toastr: ToastrService) {
    this.updates.versionUpdates.subscribe((evt) => {
      switch (evt.type) {
        case 'VERSION_DETECTED':
          this.toastr.info(
            `Descargando nueva versión: ${evt.version.hash}`,
            'Actualización',
            { timeOut: 4000 }
          );
          break;
        case 'VERSION_READY':
          this.toastr.info(
            `Nueva versión lista para usar: ${evt.latestVersion.hash}`,
            'Actualización',
            { timeOut: 4000 }
          );
          break;
        case 'VERSION_INSTALLATION_FAILED':
          this.toastr.error(
            `Error al instalar la versión '${evt.version.hash}': ${evt.error}`,
            'Error de actualización',
            { timeOut: 6000 }
          );
          break;
      }
    });
  }
}
