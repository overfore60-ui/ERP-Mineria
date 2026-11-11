import { Component, ElementRef, effect, input, model, viewChild } from '@angular/core';
import { Icon } from './icon';

/** Diálogo modal accesible sobre <dialog> nativo: atrapa el foco, Esc lo cierra y devuelve el foco al cerrar.
    Uso: `<app-modal titulo="…" [(abierto)]="ver"> cuerpo <div pie> botones </div></app-modal>` */
@Component({
  selector: 'app-modal',
  template: `
    <dialog #dlg (close)="abierto.set(false)" (click)="fuera($event)" [attr.aria-labelledby]="id"
      class="m-auto w-[calc(100%-32px)] max-h-[92vh] overflow-auto rounded-2xl bg-white p-4 md:p-6 text-pizarra shadow-[0_20px_60px_rgba(0,0,0,.35)] backdrop:bg-[rgba(20,30,38,.6)]"
      [class]="ancho() ? 'max-w-[760px]' : 'max-w-[560px]'">
      @if (abierto()) {
        <div class="flex justify-between items-start gap-3">
          <h2 [id]="id" class="text-[1.375rem]">{{ titulo() }}</h2>
          <button type="button" class="ibtn" aria-label="Cerrar diálogo" (click)="abierto.set(false)"><app-icon name="x" /></button>
        </div>
        <ng-content />
        <div class="flex gap-3 justify-end flex-wrap mt-4"><ng-content select="[pie]" /></div>
      }
    </dialog>`,
  imports: [Icon],
})
export class Modal {
  private static n = 0;
  readonly titulo = input.required<string>();
  readonly ancho = input(false);
  readonly abierto = model(false);
  readonly id = 'mdl-' + ++Modal.n;
  private dlg = viewChild.required<ElementRef<HTMLDialogElement>>('dlg');

  constructor() {
    effect(() => {
      const d = this.dlg().nativeElement;
      if (this.abierto() && !d.open) d.showModal();
      else if (!this.abierto() && d.open) d.close();
    });
  }
  fuera(e: MouseEvent) { if (e.target === this.dlg().nativeElement) this.abierto.set(false); }
}
