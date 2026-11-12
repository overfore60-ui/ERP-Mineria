import { Component, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LIMITES, CHAIN_STEPS, EMB, Eslabon, chain } from '../../core/data';
import { donut, hbar } from '../../core/charts';
import { ToastService } from '../../core/toast.service';
import { fd, nd, nf } from '../../core/util';
import { ExportDialog } from '../../shared/export-dialog';
import { HtmlPipe } from '../../shared/html.pipe';
import { Icon } from '../../shared/icon';
import { Modal } from '../../shared/modal';
import { PageHeader } from '../../shared/page-header';
import { Banner, Card, Empty, Estado, Skeleton, Timeline, Tip } from '../../shared/ui';

const PASO: Record<string, number> = { Programado: 6, 'En conformación': 7, 'En muestreo': 7, 'Pendiente de aprobación': 7, Embarcado: 8, Liquidado: 9 };

/** Detalle de un lote de embarque: ciclo de 8 pasos, reconstrucción de origen, aprobación y excepción de arsénico. */
@Component({
  selector: 'app-lote',
  templateUrl: './lote.html',
  imports: [FormsModule, RouterLink, ExportDialog, HtmlPipe, Icon, Modal, PageHeader, Banner, Card, Empty, Estado, Skeleton, Timeline, Tip],
})
export class Lote {
  private toast = inject(ToastService);
  /** Parámetro :id de la ruta (withComponentInputBinding). */
  readonly id = input.required<string>();
  readonly nf = nf;
  readonly nd = nd;
  readonly fd = fd;
  readonly asLim = LIMITES.as;
  readonly tipLimite = `El límite de ${nd(LIMITES.as, 2)} % lo fija el contrato con cada comprador. Se cambia en Administración, Parametrización.`;
  /** Sube con cada cambio del lote para volver a leerlo. */
  private ver = signal(0);
  readonly e = computed(() => { this.ver(); const e = EMB(this.id()); return e ? { ...e } : undefined; });
  readonly paso = computed(() => PASO[this.e()?.estado || ''] || 6);
  readonly ciclo = computed(() => CHAIN_STEPS.map((s, i) => {
    const cur = this.paso();
    return { t: `${i + 1}. ${s.t} · ${s.dato}`, s: i + 1 < cur ? 'done' : i + 1 === cur ? 'cur' : '', w: i + 1 < cur ? `Completado · ${s.sys}` : i + 1 === cur ? 'En curso' : 'Pendiente', d: s.s + (s.regla ? ' Regla: ' + s.regla : '') };
  }));

  exportar = false;
  aprobar = false;
  resolver = false;
  opcion = 'remix';
  justificacion = '';
  readonly errJust = signal('');

  readonly reconstruyendo = signal(false);
  readonly origen = signal<{ c: Eslabon[]; tot: number; dona: string; barras: string } | null>(null);

  reconstruir() {
    this.reconstruyendo.set(true);
    this.origen.set(null);
    setTimeout(() => {
      const c = chain(this.id()), tot = c.reduce((a, x) => a + x.t, 0);
      this.origen.set({
        c, tot,
        dona: donut({ items: c.map(x => ({ label: x.poli.id, value: x.t })), big: nf(tot), small: 'toneladas rastreadas', label: 'Aporte de cada polígono al lote' }),
        barras: hbar({ labels: c.map(x => x.poli.id), values: c.map(x => Math.round(x.pct * 1000) / 10), fmt: v => nd(v, 1) + ' %', ml: 96, w: 360, label: 'Porcentaje de aporte por polígono' }),
      });
      this.reconstruyendo.set(false);
      this.toast.show('Origen del lote reconstruido.', 'ok', 2500);
    }, 900 + Math.random() * 400);
  }

  pedirAprobacion() {
    if (this.e()!.as > LIMITES.as) { this.toast.show('Primero resuelve la excepción de arsénico: el lote no puede aprobarse sobre el límite.', 'warn', 5500); return; }
    this.aprobar = true;
  }
  confirmarAprobacion() {
    EMB(this.id())!.estado = 'Embarcado';
    this.aprobar = false;
    this.ver.update(v => v + 1);
    this.toast.show(`Lote ${this.id()} aprobado. SAP emitirá los documentos; la plataforma le entrega los datos.`, 'ok', 5500);
  }
  aplicarDecision() {
    const e = EMB(this.id())!;
    if (this.opcion === 'just') {
      const t = this.justificacion.trim();
      this.errJust.set(!t ? 'Este campo es obligatorio.' : t.length < 20 ? 'Mínimo 20 caracteres.' : '');
      if (this.errJust()) return;
      e.exc = false;
      this.toast.show('Excepción aprobada con justificación. Segunda aprobación solicitada.', 'warn', 5500);
    } else {
      e.as = 0.36; e.exc = false;
      this.toast.show('Mezcla ajustada: arsénico proyectado 0,36 %. Excepción cerrada.', 'ok', 5000);
    }
    this.resolver = false;
    this.ver.update(v => v + 1);
  }
}
