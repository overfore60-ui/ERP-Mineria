import { Component, HostListener, effect, inject, signal } from '@angular/core';
import { PageService } from '../core/page.service';
import { SessionService } from '../core/session.service';
import { ToastService } from '../core/toast.service';

const PASOS = [
  { sel: '[data-tour="nav"]', t: 'Tu menú, a tu medida', d: 'El menú muestra solo lo que tu perfil necesita. Cualquier función principal está a tres interacciones o menos.' },
  { sel: '#conn', t: 'Estado de conexión siempre visible', d: 'Si se corta la fibra, la operación sigue en modo local y esta señal te avisa. Todo se sincroniza solo al volver el enlace.' },
  { sel: '[data-tour="widgets"]', t: 'Tablero configurable', d: 'Presiona “Personalizar” para ocultar o reordenar los componentes de tu inicio.' },
  { sel: '[data-tour="fab"]', t: 'Acciones rápidas', d: 'Las tareas más frecuentes de tu perfil, siempre a un toque.' },
];

/** Recorrido guiado del primer ingreso: resalta cada elemento y explica para qué sirve. Esc lo cierra. */
@Component({
  selector: 'app-tour',
  template: `
    @if (ses.tourActivo() && caja(); as c) {
      <div class="fixed z-151 rounded-[10px] pointer-events-none transition-all shadow-[0_0_0_9999px_rgba(20,30,38,.65)]"
        [style.left.px]="c.l" [style.top.px]="c.t" [style.width.px]="c.w" [style.height.px]="c.h"></div>
      <div class="fixed z-152 w-[min(340px,calc(100vw-24px))] bg-white rounded-xl p-4 shadow-[0_12px_40px_rgba(0,0,0,.4)]" role="dialog" aria-modal="true" aria-label="Recorrido guiado"
        [style.left.px]="c.pl" [style.top.px]="c.pt">
        <div class="text-[13px] muted">Paso {{ i() + 1 }} de {{ pasos().length }}</div>
        <h3>{{ pasos()[i()].t }}</h3>
        <p class="text-sm">{{ pasos()[i()].d }}</p>
        <div class="flex justify-between items-center gap-3">
          <button type="button" class="btn btn-sm btn-ter" (click)="terminar()">Omitir</button>
          <div class="flex gap-3">
            <button type="button" class="btn btn-sm btn-sec" [disabled]="i() === 0" (click)="ir(i() - 1)">Atrás</button>
            <button type="button" class="btn btn-sm" id="tour-sig" (click)="siguiente()">{{ i() === pasos().length - 1 ? 'Entendido' : 'Siguiente' }}</button>
          </div>
        </div>
      </div>
    }`,
})
export class Tour {
  readonly ses = inject(SessionService);
  private page = inject(PageService);
  private toast = inject(ToastService);
  /** Solo los pasos cuyo elemento existe para este perfil y esta pantalla: así el contador no se descuadra. */
  readonly pasos = signal(PASOS);
  readonly i = signal(0);
  readonly caja = signal<{ l: number; t: number; w: number; h: number; pl: number; pt: number } | null>(null);

  constructor() {
    effect(() => {
      if (!this.ses.tourActivo()) return;
      setTimeout(() => {
        this.pasos.set(PASOS.filter(p => document.querySelector(p.sel)));
        this.i.set(0);
        this.mostrar();
      });
    });
  }

  private mostrar() {
    const lista = this.pasos();
    let k = this.i();
    let el = lista[k] ? document.querySelector(lista[k].sel) : null;
    while (!el && k < lista.length - 1) el = document.querySelector(lista[++k].sel);
    if (!el) { this.terminar(); return; }
    this.i.set(k);
    if (el.closest('#nav') && window.innerWidth < 1024) this.page.navAbierto.set(true);
    setTimeout(() => {
      const r = el!.getBoundingClientRect();
      const pw = Math.min(340, window.innerWidth - 24);
      let pt = r.bottom + 14;
      if (pt + 190 > window.innerHeight) pt = Math.max(12, r.top - 200);
      this.caja.set({ l: r.left - 6, t: r.top - 6, w: r.width + 12, h: r.height + 12, pl: Math.min(Math.max(12, r.left), window.innerWidth - pw - 12), pt });
      setTimeout(() => document.getElementById('tour-sig')?.focus());
    }, 220);
  }

  ir(k: number) { this.i.set(k); this.mostrar(); }
  siguiente() {
    if (this.i() === this.pasos().length - 1) { this.terminar(); this.toast.show('¡Listo! Puedes repetir el recorrido desde tu menú de usuario.', 'ok'); }
    else this.ir(this.i() + 1);
  }
  terminar() { this.caja.set(null); this.page.navAbierto.set(false); this.ses.terminarTour(); }
  @HostListener('document:keydown.escape') esc() { if (this.ses.tourActivo()) this.terminar(); }
}
