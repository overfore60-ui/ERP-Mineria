import { Component, computed, inject } from '@angular/core';
import { ActivatedRouteSnapshot, NavigationEnd, NavigationStart, Router, RouterLink, RouterOutlet } from '@angular/router';
import { DatosRuta, PageService } from './core/page.service';
import { SessionService } from './core/session.service';
import { SimService } from './core/sim.service';
import { nd, nf } from './core/util';
import { Header } from './layout/header';
import { QuickMenu } from './layout/quick-menu';
import { RolePicker } from './layout/role-picker';
import { Sidebar } from './layout/sidebar';
import { SimWidget } from './layout/sim-widget';
import { Toasts } from './layout/toasts';
import { Tour } from './layout/tour';
import { Icon } from './shared/icon';
import { Empty, Skeleton } from './shared/ui';

/** Marco de la aplicación: cabecera, menú lateral, migas, esqueleto de carga y control de acceso por rol. */
@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  imports: [RouterOutlet, RouterLink, Header, Sidebar, QuickMenu, SimWidget, Toasts, Tour, RolePicker, Icon, Empty, Skeleton],
})
export class App {
  private router = inject(Router);
  readonly page = inject(PageService);
  readonly ses = inject(SessionService);
  readonly sim = inject(SimService);
  readonly nd = nd;
  readonly nf = nf;

  /** Marco autenticado (con menú) o público. */
  readonly auth = computed(() => !!this.ses.user() && !this.page.publico());
  readonly restringido = computed(() => this.auth() && !this.ses.permitido(this.page.item() || undefined));

  constructor() {
    let espera: ReturnType<typeof setTimeout>;
    this.router.events.subscribe(e => {
      if (e instanceof NavigationStart) { clearTimeout(espera); this.page.cargando.set(true); }
      if (e instanceof NavigationEnd) {
        let s: ActivatedRouteSnapshot = this.router.routerState.snapshot.root;
        while (s.firstChild) s = s.firstChild;
        const d = s.data as DatosRuta;
        this.page.publico.set(!!d.publico);
        this.page.item.set(d.item || null);
        this.page.migas.set(d.migas ? d.migas(s.params) : []);
        this.page.navAbierto.set(false);
        espera = setTimeout(() => {
          this.page.cargando.set(false);
          window.scrollTo(0, 0);
          setTimeout(() => (document.getElementById('pgh') || document.querySelector('main h1') as HTMLElement | null)?.focus({ preventScroll: true }));
          if (this.auth() && !this.ses.tourVisto() && e.urlAfterRedirects === this.ses.inicio()) setTimeout(() => this.ses.tourActivo.set(true), 600);
        }, d.rapido ? 40 : 260);
      }
    });
  }

  saltar(e: Event) {
    e.preventDefault();
    document.getElementById('main')?.focus();
  }
}
