import { Component, inject } from '@angular/core';
import { ROLES } from '../core/data';
import { SessionService } from '../core/session.service';
import { Icon } from '../shared/icon';
import { Modal } from '../shared/modal';

/** Tarjetas de perfil para entrar como otra persona usuaria (demostración de RBAC). */
@Component({
  selector: 'app-role-cards',
  host: { class: 'grid gap-4 grid-cols-[repeat(auto-fill,minmax(210px,1fr))]' },
  template: `
    @for (r of roles; track r[0]) {
      <button type="button" class="flex flex-col gap-1.5 text-left bg-white border border-arena-2 rounded-xl p-4 cursor-pointer min-h-30 transition hover:-translate-y-0.5 hover:border-cobre" (click)="elegir(r[0])">
        <span class="grid place-items-center size-11 rounded-[10px] bg-cobre-l text-cobre-d"><app-icon [name]="r[1].ico" /></span>
        <strong>{{ r[1].label }}</strong>
        <span class="text-[0.8125rem] muted">{{ r[1].desc }}</span>
      </button>
    }`,
  imports: [Icon],
})
export class RoleCards {
  private ses = inject(SessionService);
  readonly roles = Object.entries(ROLES);
  elegir(k: string) { this.ses.cambiarPerfil.set(false); this.ses.login(k, true); }
}

@Component({
  selector: 'app-role-picker',
  template: `
    <app-modal titulo="Explorar como otra persona usuaria" [ancho]="true" [abierto]="ses.cambiarPerfil()" (abiertoChange)="ses.cambiarPerfil.set($event)">
      <p class="muted">Cada perfil ve un menú, un inicio y permisos distintos (RBAC). Es una función de demostración: en producción el perfil lo entrega el directorio corporativo.</p>
      <app-role-cards />
    </app-modal>`,
  imports: [Modal, RoleCards],
})
export class RolePicker {
  readonly ses = inject(SessionService);
}
