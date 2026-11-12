import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NAV } from '../core/data';
import { PageService } from '../core/page.service';
import { SessionService } from '../core/session.service';
import { Icon } from '../shared/icon';

/** Menú lateral: solo muestra lo que el perfil puede usar (RBAC). En pantallas angostas se abre como cajón. */
@Component({
  selector: 'app-sidebar',
  host: {
    id: 'nav', 'aria-label': 'Menú principal', role: 'navigation',
    class: 'no-print bg-white border-r border-arena-2 px-3 pt-4 pb-24 overflow-auto h-[calc(100vh-60px)] top-15 fixed z-80 left-0 w-[min(300px,86vw)] shadow-suave transition-transform lg:sticky lg:w-auto lg:shadow-none max-lg:-translate-x-[102%]',
    '[class]': "page.navAbierto() ? 'max-lg:translate-x-0!' : ''",
  },
  template: `
    @for (g of grupos(); track g.g) {
      <h6 [class]="h6">{{ g.g }}</h6>
      @for (i of g.items; track i.id) {
        <a [routerLink]="i.h" routerLinkActive #rla="routerLinkActive" [routerLinkActiveOptions]="{ paths: 'subset', queryParams: 'ignored', fragment: 'ignored', matrixParams: 'ignored' }"
          [attr.aria-current]="activo(i.id, rla.isActive) ? 'page' : null" [class]="activo(i.id, rla.isActive) ? a + on : a"
          [attr.data-tour]="i.id === 'trazabilidad' ? 'nav' : null" (click)="page.navAbierto.set(false)">
          <app-icon [name]="i.i" /><span>{{ i.l }}</span>
          @if (i.id === 'acreditacion' && ses.user()?.role !== 'contratista') { <span class="badge-n ml-auto" aria-label="4 pendientes">4</span> }
        </a>
      }
    }`,
  imports: [RouterLink, RouterLinkActive, Icon],
})
export class Sidebar {
  readonly ses = inject(SessionService);
  readonly page = inject(PageService);
  readonly h6 = 'mt-4 mx-2 mb-1 text-xs font-semibold tracking-wider uppercase text-acero';
  readonly a = 'flex items-center gap-3 min-h-11 px-3 py-1 leading-tight rounded-lg no-underline text-pizarra font-medium text-[0.9375rem] transition-colors hover:bg-acero-xl hover:text-pizarra';
  readonly on = ' bg-pizarra text-white! hover:bg-pizarra';
  readonly grupos = computed(() => {
    const items = this.ses.rol()?.items || [];
    return NAV.map(g => ({ g: g.g, items: g.items.filter(i => items.includes(i.id)) })).filter(g => g.items.length);
  });
  /** Una sección queda marcada también en sus subpantallas (p. ej. Administración en /admin/roles). */
  activo(id: string, porRuta: boolean) { return porRuta || this.page.item() === id; }
}
