import { Component, inject, input, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SessionService } from '../core/session.service';
import { SimService } from '../core/sim.service';
import { ToastService } from '../core/toast.service';
import { nd, nf } from '../core/util';
import { Icon } from '../shared/icon';

/** Controles del simulador de conectividad: corta fibras, satélite y LTE, y adelanta el reloj del corte. */
@Component({
  selector: 'app-sim-panel',
  host: { class: 'block' },
  template: `
    <h3 class="text-lg">Simulador de conectividad</h3>
    <p class="text-sm muted">Herramienta de demostración para evaluadores. Aquí no hay servicios reales: se simula el comportamiento esperado.</p>
    <label class="switch"><input type="checkbox" [checked]="sim.fibA === 'down'" (change)="sim.setPath('A', $any($event.target).checked)"><span class="tr"></span><span>Cortar fibra A (proveedor actual)</span></label>
    <label class="switch"><input type="checkbox" [checked]="sim.fibB === 'down'" (change)="sim.setPath('B', $any($event.target).checked)"><span class="tr"></span><span>Cortar fibra B (otro proveedor y camino)</span></label>
    <label class="switch"><input type="checkbox" [checked]="sim.leo === 'down'" (change)="sim.setPath('L', $any($event.target).checked)"><span class="tr"></span><span>Cortar satélite de órbita baja</span></label>
    <p class="text-[13px] muted mt-1 mb-2">El modo local solo se activa si caen las dos fibras y el satélite. El satélite geoestacionario existente sigue solo para telefonía y correo.</p>
    <label class="switch"><input type="checkbox" [checked]="sim.lte === 'shadow'" (change)="sim.setLte($any($event.target).checked)"><span class="tr"></span><span>Equipo en zona sin cobertura (fondo del rajo)</span></label>
    <div class="mt-2">
      <div class="flex justify-between text-sm"><strong>Autonomía local usada</strong><span>{{ nd(sim.hours, 0) }} h de 48 h</span></div>
      <div class="bar" [class.err]="sim.hours > 48" [class.warn]="sim.hours > 36 && sim.hours <= 48" role="progressbar" aria-valuemin="0" aria-valuemax="48" [attr.aria-valuenow]="sim.hours"><i [style.width.%]="min(100, sim.hours / 48 * 100)"></i></div>
    </div>
    <div class="flex flex-wrap gap-2 mt-2">
      @for (h of [6, 20, 48]; track h) {
        <button type="button" class="btn btn-sm btn-sec" [disabled]="sim.link !== 'down'" (click)="sim.advance(h)">+{{ h }} h{{ h === 20 ? ' (corte más largo)' : '' }}</button>
      }
    </div>
    <div class="grid grid-cols-3 gap-2 mt-4">
      <div class="card-flat px-2.5! py-2!"><div class="text-[13px] muted">En equipo</div><strong class="tabular-nums">{{ nf(sim.onDevice()) }}</strong></div>
      <div class="card-flat px-2.5! py-2!"><div class="text-[13px] muted">En el Nodo</div><strong class="tabular-nums">{{ nf(sim.onEdge()) }}</strong></div>
      <div class="card-flat px-2.5! py-2!"><div class="text-[13px] muted">Sincronizados</div><strong class="tabular-nums">{{ nf(sim.total - sim.pending()) }}</strong></div>
    </div>
    <ul class="list-none p-0 mt-3 mb-0 text-sm">
      @for (n of sim.nodes(); track n.id) {
        <li class="flex gap-2 py-1">
          <span class="badge px-1.5! self-start" [class]="n.s === 'ok' ? 'badge-ok' : n.s === 'warn' ? 'badge-warn' : 'badge-err'">{{ n.s === 'ok' ? '●' : n.s === 'warn' ? '▲' : '✕' }}</span>
          <span><strong>{{ n.n }}</strong><br><span class="muted text-[13px]">{{ n.t }}</span></span>
        </li>
      }
    </ul>
    <div class="flex flex-wrap gap-2 mt-2">
      @if (enlace() && ses.permitidoRuta('/conectividad')) { <a class="btn btn-sm" routerLink="/conectividad" (click)="ir.emit()">Ver arquitectura animada</a> }
      <button type="button" class="btn btn-sm btn-ter" (click)="restablecer()">Restablecer</button>
    </div>`,
  imports: [RouterLink],
})
export class SimPanel {
  readonly sim = inject(SimService);
  readonly ses = inject(SessionService);
  /** El enlace a Conectividad no se ofrece dentro de esa misma pantalla ni a quien no puede abrirla. */
  readonly enlace = input(true);
  private toast = inject(ToastService);
  readonly ir = output<void>();
  readonly nd = nd;
  readonly nf = nf;
  readonly min = Math.min;
  restablecer() { this.sim.reset(); this.toast.show('Simulación restablecida.', 'info', 2500); }
}

/** Botón flotante que abre el simulador de conectividad (demostración para evaluadores). */
@Component({
  selector: 'app-sim-widget',
  host: { class: 'no-print fixed left-4 bottom-4 z-70' },
  template: `
    <button type="button" class="btn btn-dark shadow-[0_4px_14px_rgba(0,0,0,.3)]" [attr.aria-expanded]="abierto()" aria-controls="sim-panel"
      aria-label="Simulador de conectividad (demostración)" (click)="abierto.set(!abierto())"><app-icon name="cloud" /> Simular nube</button>
    @if (abierto()) {
      <div id="sim-panel" role="dialog" aria-label="Simulador de conectividad"
        class="absolute left-0 bottom-14 w-[min(380px,calc(100vw-32px))] max-h-[78vh] overflow-auto bg-white border-2 border-pizarra rounded-xl p-4 shadow-[0_10px_40px_rgba(0,0,0,.3)]">
        <app-sim-panel (ir)="abierto.set(false)" />
      </div>
    }`,
  imports: [Icon, SimPanel],
})
export class SimWidget {
  readonly abierto = signal(false);
}
