import { Component, inject } from '@angular/core';
import { ToastService } from '../core/toast.service';
import { HtmlPipe } from '../shared/html.pipe';
import { Icon } from '../shared/icon';

/** Contenedor de avisos breves (se anuncian con aria-live). */
@Component({
  selector: 'app-toasts',
  host: { class: 'no-print fixed right-4 top-[72px] z-120 flex flex-col gap-2.5 w-[min(380px,calc(100vw-32px))]', role: 'status', 'aria-live': 'polite' },
  template: `
    @for (t of toast.lista(); track t.id) {
      <div class="flex gap-3 items-start px-3.5 py-3 bg-white border-l-[6px] rounded-lg shadow-suave animate-entrar text-[0.9375rem]"
        [class]="t.tipo === 'ok' ? 'border-senal' : t.tipo === 'err' ? 'border-error' : t.tipo === 'warn' ? 'border-[#C58A10]' : 'border-acero'">
        <app-icon [name]="t.tipo === 'ok' ? 'check' : t.tipo === 'info' ? 'info' : 'alert'" />
        <div class="flex-1 min-w-0" [innerHTML]="t.msg | html"></div>
        <button type="button" class="ibtn -my-2 -mr-2" aria-label="Cerrar notificación" (click)="toast.cerrar(t.id)"><app-icon name="x" /></button>
      </div>
    }`,
  imports: [Icon, HtmlPipe],
})
export class Toasts {
  readonly toast = inject(ToastService);
}
