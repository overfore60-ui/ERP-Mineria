import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BRAND, NOTIFS } from '../core/data';
import { PageService } from '../core/page.service';
import { SessionService } from '../core/session.service';
import { SimService } from '../core/sim.service';
import { nf } from '../core/util';
import { Icon } from '../shared/icon';
import { Modal } from '../shared/modal';
import { Menu } from '../shared/ui';

/** Cabecera: marca, estado de conexión, notificaciones, ayuda y menú de la persona usuaria. */
@Component({
  selector: 'app-header',
  host: { class: 'sticky top-0 z-50 flex items-center gap-1 md:gap-3 h-15 px-2.5 md:px-4 bg-pizarra text-white no-print' },
  templateUrl: './header.html',
  imports: [RouterLink, Icon, Menu, Modal],
})
export class Header {
  readonly ses = inject(SessionService);
  readonly page = inject(PageService);
  readonly sim = inject(SimService);
  readonly auth = input(false);
  readonly brand = BRAND;
  /** El operador de pala no tiene sesión ni acceso a datos (SD4): no recibe notificaciones. */
  readonly verNotifs = computed(() => this.ses.user()?.role !== 'operador');
  readonly notifs = computed(() => {
    const rol = this.ses.user()?.role ?? '';
    return NOTIFS.filter(n => (!n.solo || n.solo.includes(rol)) && !n.no?.includes(rol) && this.ses.permitidoRuta(n.h));
  });
  confirmarSalida = false;
  /** Cómo se identificó la persona según su perfil. */
  readonly acceso = computed(() => {
    const rol = this.ses.user()?.role;
    return rol === 'operador' ? 'toque de credencial, sin sesión' : rol === 'guardia' ? 'credencial de faena y PIN'
      : this.ses.externo() ? 'cuenta de empresa externa con segundo factor' : 'sesión federada con el directorio corporativo';
  });

  readonly conexion = computed(() => {
    const m = this.sim.mode();
    return m === 'down' ? `Sin enlace · modo local · ${nf(this.sim.pending())} pendientes`
      : m === 'sync' ? `Sincronizando ${nf(this.sim.pending())}…` : 'Conectado · todo sincronizado';
  });
  readonly punto = computed(() => ({ down: 'bg-[#FFC24A]', sync: 'bg-[#8CC7FF] animate-pulso', ok: 'bg-[#58D3A5]' })[this.sim.mode()]);

  repetirTour() { this.ses.tourActivo.set(true); }
}
