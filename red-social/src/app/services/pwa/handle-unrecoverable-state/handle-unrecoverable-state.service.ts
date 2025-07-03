import { Injectable, inject } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { ToastrService } from 'ngx-toastr';

@Injectable({ providedIn: 'root' })
export class HandleUnrecoverableStateService {
  private updates = inject(SwUpdate);
  constructor(private toastr: ToastrService) {
    this.updates.unrecoverable.subscribe((event) => {
      this.toastr.error(
        'Ocurrió un error irrecuperable: ' +
          event.reason +
          '\nPor favor, recargue la página.',
        'Error crítico',
        { timeOut: 8000 }
      );
    });
  }
}
