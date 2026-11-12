import { Component, inject } from '@angular/core';
import { INTERFACES, ROLES } from '../core/data';
import { SessionService } from '../core/session.service';
import { Icon } from '../shared/icon';
import { Modal } from '../shared/modal';

/** Tarjetas de perfil, agrupadas por las seis interfaces de la plataforma. */
@Component({
  selector: 'app-role-cards',
  host: { class: 'flex flex-col gap-5' },
  template: `
    @for (g of grupos; track g.i) {
      <section [attr.aria-label]="g.i">
        <h3 class="text-base mb-2">{{ g.i }}</h3>
        <div class="grid gap-4 grid-cols-[repeat(auto-fill,minmax(210px,1fr))]">
          @for (r of g.roles; track r[0]) {
            <button type="button" class="flex flex-col gap-1.5 text-left bg-white border border-arena-2 rounded-xl p-4 cursor-pointer min-h-30 transition hover:-translate-y-0.5 hover:border-cobre" (click)="elegir(r[0])">
              <span class="grid place-items-center size-11 rounded-[10px] bg-cobre-l text-cobre-d"><app-icon [name]="r[1].ico" /></span>
              <strong>{{ r[1].label }}</strong>
              <span class="text-[0.8125rem] muted">{{ r[1].desc }}</span>
            </button>
          }
        </div>
      </section>
    }`,
  imports: [Icon],
})
export class RoleCards {
  private ses = inject(SessionService);
  readonly grupos = INTERFACES.map(i => ({ i, roles: Object.entries(ROLES).filter(([, r]) => r.interfaz === i) })).filter(g => g.roles.length);
  elegir(k: string) { this.ses.cambiarPerfil.set(false); this.ses.login(k, true); }
}

@Component({
  selector: 'app-role-picker',
  template: `
    <app-modal titulo="Cambiar de perfil" [ancho]="true" [abierto]="ses.cambiarPerfil()" (abiertoChange)="ses.cambiarPerfil.set($event)">
      <p class="muted">Cada perfil entra por su interfaz y ve solo las secciones y los datos que le corresponden.</p>
      <app-role-cards />
    </app-modal>`,
  imports: [Modal, RoleCards],
})
export class RolePicker {
  readonly ses = inject(SessionService);
}
