import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SessionService } from '../core/session.service';
import { Icon } from '../shared/icon';
import { Menu } from '../shared/ui';

const ACCIONES: Record<string, [string, string, string][]> = {
  operador: [['/terreno', 'truck', 'Abrir app de terreno']],
  supervisor: [['/terreno', 'alert', 'Registrar incidente'], ['/equipos', 'truck', 'Ver equipos detenidos']],
  planificacion: [['/plan', 'cal', 'Publicar versión del plan']],
  metalurgia: [['/trazabilidad/nuevo', 'plus', 'Conformar lote de embarque'], ['/conciliacion', 'scale', 'Conciliación del mes']],
  seguridad: [['/acreditacion/nueva', 'plus', 'Nueva acreditación'], ['/seguridad', 'alert', 'Alertas de fatiga']],
  sustentabilidad: [['/ambiental', 'leaf', 'Generar reporte a la autoridad']],
  contratista: [['/acreditacion/nueva', 'plus', 'Solicitar acreditación']],
  guardia: [['/porteria', 'lock', 'Abrir consola de portería']],
  comprador: [['/compradores', 'box', 'Ver mis embarques']],
  gerencia: [['/tablero', 'chart', 'Tablero analítico']],
  admin: [['/admin/usuarios', 'users', 'Gestionar usuarios']],
};

/** Botón flotante con las tareas más frecuentes del perfil. */
@Component({
  selector: 'app-quick-menu',
  host: { class: 'no-print fixed right-3 bottom-3 md:right-5 md:bottom-5 z-60', 'data-tour': 'fab' },
  template: `
    <app-menu claseBoton="btn btn-lg rounded-[28px] shadow-[0_6px_20px_rgba(30,43,53,.35)]" ancho="top-auto! bottom-16 min-w-60">
      <span boton class="contents"><app-icon name="zap" /> Acciones rápidas</span>
      @for (i of items(); track i[0] + i[2]) { <a role="menuitem" [routerLink]="i[0]" class="menu-item"><app-icon [name]="i[1]" /> {{ i[2] }}</a> }
      @if (ses.permitidoRuta('/tablero')) { <a role="menuitem" routerLink="/tablero" class="menu-item"><app-icon name="chart" /> Ir al tablero</a> }
      <a role="menuitem" routerLink="/ayuda" class="menu-item"><app-icon name="help" /> Ayuda</a>
    </app-menu>`,
  imports: [RouterLink, Icon, Menu],
})
export class QuickMenu {
  readonly ses = inject(SessionService);
  readonly items = computed(() => ACCIONES[this.ses.user()?.role || ''] || []);
}
