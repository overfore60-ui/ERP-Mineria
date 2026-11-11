import { Component, inject, input, output } from '@angular/core';
import { CAUSAS, EQ } from '../../core/data';
import { ToastService } from '../../core/toast.service';
import { Modal } from '../../shared/modal';

/** Clasificar la causa de una detención con un toque (lo usan Equipos y la vista única del equipo). */
@Component({
  selector: 'app-clasificar-detencion',
  template: `
    <app-modal [titulo]="'Clasificar detención de ' + equipo()" [abierto]="!!equipo()" (abiertoChange)="!$event && cerrar.emit()">
      <p>Elige la causa con <strong>un toque</strong>. Todas las detenciones deben quedar clasificadas dentro del turno siguiente.</p>
      <div class="grid grid-cols-2 gap-2.5">
        @for (c of causas; track c) {
          <button type="button" class="min-h-14 rounded-[14px] border-[3px] border-pizarra bg-white font-titulo font-bold text-[0.9375rem] uppercase cursor-pointer hover:bg-cobre-l" (click)="elegir(c)">{{ c }}</button>
        }
      </div>
      <div pie><button type="button" class="btn btn-sec" (click)="cerrar.emit()">Cancelar</button></div>
    </app-modal>`,
  imports: [Modal],
})
export class ClasificarDetencion {
  private toast = inject(ToastService);
  readonly equipo = input<string | null>(null);
  readonly cerrar = output<void>();
  readonly listo = output<void>();
  readonly causas = CAUSAS.filter(c => c !== 'Sin clasificar');

  elegir(c: string) {
    const e = EQ(this.equipo()!)!;
    e.det!.causa = c;
    this.toast.show(`${e.id}: detención clasificada como “${c}”. Queda auditado.`, 'ok');
    this.listo.emit();
  }
}
