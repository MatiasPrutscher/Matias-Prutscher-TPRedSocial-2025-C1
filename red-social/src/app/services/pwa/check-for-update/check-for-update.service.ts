import { ApplicationRef, inject, Injectable } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { concat, interval } from 'rxjs';
import { first } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

@Injectable({ providedIn: 'root' })
export class CheckForUpdateService {
  private appRef = inject(ApplicationRef);
  private updates = inject(SwUpdate);
  constructor(private toastr: ToastrService) {
    // Allow the app to stabilize first, before starting
    // polling for updates with `interval()`.
    const appIsStable$ = this.appRef.isStable.pipe(
      first((isStable) => isStable === true)
    );
    const everySixHours$ = interval(6 * 60 * 60 * 1000);
    const everySixHoursOnceAppIsStable$ = concat(appIsStable$, everySixHours$);
    everySixHoursOnceAppIsStable$.subscribe(async () => {
      try {
        const updateFound = await this.updates.checkForUpdate();
        if (updateFound) {
          this.toastr.info(
            'Hay una nueva versión disponible. Se actualizará pronto.',
            'Actualización',
            { timeOut: 5000 }
          );
        } else {
          this.toastr.success(
            'Estás usando la última versión de la aplicación.',
            '¡Actualizado!',
            { timeOut: 3000 }
          );
        }
      } catch (err) {
        this.toastr.error('No se pudo buscar actualizaciones.', 'Error', {
          timeOut: 4000,
        });
      }
    });
  }
}
