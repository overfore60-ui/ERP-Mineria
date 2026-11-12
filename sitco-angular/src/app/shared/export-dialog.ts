import { Component, inject, input, model, signal } from '@angular/core';
import { ToastService } from '../core/toast.service';
import { csv } from '../core/util';
import { Modal } from './modal';

export interface DatosCsv { name: string; head: string[]; rows: (string | number)[][] }

/** Exportación simulada de informes, con barra de progreso. El CSV se descarga de verdad. */
@Component({
  selector: 'app-export-dialog',
  template: `
    <app-modal titulo="Exportar informe" [(abierto)]="abierto">
      <p>{{ titulo() }}</p>
      <fieldset class="border-0 p-0 m-0 mb-3"><legend class="lbl-t">Formato</legend>
        <div class="grid gap-2.5 grid-cols-[repeat(auto-fit,minmax(160px,1fr))]">
          @for (f of formatos; track f.v) {
            <label class="choice"><input type="radio" name="fmt" [value]="f.v" [checked]="fmt() === f.v" (change)="fmt.set(f.v)"> {{ f.l }}</label>
          }
        </div>
      </fieldset>
      <label class="check"><input type="checkbox" checked> Incluir trazabilidad hasta la medición de origen</label>
      @if (progreso() > 0) {
        <div class="flex items-center gap-3 mt-2"><div class="bar cu"><i [style.width.%]="progreso()"></i></div><span class="text-[0.8125rem]">Generando…</span></div>
      }
      <div pie>
        <button type="button" class="btn btn-sec" (click)="abierto.set(false)">Cancelar</button>
        <button type="button" class="btn" [disabled]="progreso() > 0" (click)="generar()">Generar informe</button>
      </div>
    </app-modal>`,
  imports: [Modal],
})
export class ExportDialog {
  private toast = inject(ToastService);
  readonly abierto = model(false);
  readonly titulo = input('');
  readonly csv = input<DatosCsv | null>(null);
  readonly fmt = signal('csv');
  readonly progreso = signal(0);
  readonly formatos = [{ v: 'csv', l: 'CSV (Excel)' }, { v: 'pdf', l: 'PDF firmado' }, { v: 'xlsx', l: 'XLSX' }];

  generar() {
    const t = setInterval(() => {
      this.progreso.update(p => Math.min(100, p + 14 + Math.random() * 18));
      if (this.progreso() >= 100) {
        clearInterval(t);
        this.abierto.set(false);
        this.progreso.set(0);
        const c = this.csv();
        if (this.fmt() === 'csv' && c) { csv(c.name, c.head, c.rows); this.toast.show('Informe CSV descargado.', 'ok'); }
        else this.toast.show(`Informe ${this.fmt().toUpperCase()} generado, firmado y archivado con su hash.`, 'ok', 6000);
      }
    }, 160);
  }
}
