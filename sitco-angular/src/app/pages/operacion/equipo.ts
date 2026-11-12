import { Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EQ } from '../../core/data';
import { hbar } from '../../core/charts';
import { ToastService } from '../../core/toast.service';
import { desde, ft, hace, rng } from '../../core/util';
import { HtmlPipe } from '../../shared/html.pipe';
import { Icon } from '../../shared/icon';
import { Modal } from '../../shared/modal';
import { PageHeader } from '../../shared/page-header';
import { Banner, Card, Empty, Estado, Timeline } from '../../shared/ui';
import { ClasificarDetencion } from './clasificar';

/** Vista única del equipo: estado, historial, alarmas de los tres portales y pautas de SAP. */
@Component({
  selector: 'app-equipo',
  templateUrl: './equipo.html',
  imports: [RouterLink, HtmlPipe, Icon, Modal, PageHeader, Banner, Card, Empty, Estado, Timeline, ClasificarDetencion],
})
export class Equipo {
  private toast = inject(ToastService);
  readonly id = input.required<string>();
  readonly desde = desde;
  private ver = signal(0);
  readonly e = computed(() => { this.ver(); const e = EQ(this.id()); return e ? { ...e, det: e.det ? { ...e.det } : null } : undefined; });

  /** Alarmas y órdenes de trabajo de ejemplo, siempre iguales para el mismo equipo. */
  readonly extra = computed(() => {
    const e = this.e(); if (!e) return null;
    const r = rng(+e.id.split('-')[1] * 31 + e.id.charCodeAt(0));
    const alarmas = [
      ['Código F-' + (200 + Math.floor(r() * 90)), e.fab, 'Alta', 'Temperatura de freno en límite'],
      ['Código W-' + (100 + Math.floor(r() * 90)), e.fab, 'Media', 'Presión de neumático baja (delantero derecho)'],
      ['Código I-' + (10 + Math.floor(r() * 60)), e.fab, 'Baja', 'Aviso informativo de consumo'],
    ];
    const ots = [
      ['OT-' + (410000 + Math.floor(r() * 9999)), 'Pauta preventiva 250 h', '212 h restantes', 'Planificada'],
      ['OT-' + (410000 + Math.floor(r() * 9999)), 'Inspección de frenos', 'Vencida hace 2 días', 'Atrasada'],
    ];
    const historial = [
      { t: e.det ? 'Detención' : 'Operación normal', w: ft(hace(20)) + ' · hoy', s: e.det ? 'bad' : 'done', d: e.det ? e.det.causa : 'Ciclo de 36 min' },
      { t: 'Cambio de destino (material)', w: '07:12 · hoy', s: 'done', d: 'Razón registrada con 1 toque' },
      { t: 'Inicio de turno', w: '08:00', s: 'done' },
      { t: 'Carga en PA-03', w: 'Ayer 19:41', s: 'done', d: '238 t' },
    ];
    const comparado = hbar({ labels: ['Este equipo', 'Promedio flota', 'Mejor de la flota'], values: [e.util, 74, 91], fmt: v => v + ' %', ml: 120, colors: ['#9C4A1F', '#6C8294', '#1F7A5C'], label: 'Utilización efectiva comparada' });
    return { alarmas, ots, historial, comparado };
  });

  clasificar = false;
  crearAviso = false;

  clasificado() { this.clasificar = false; this.ver.update(v => v + 1); }
  avisoCreado() { this.crearAviso = false; this.toast.show('Aviso creado en SAP, sin transcribir desde la radio.', 'ok', 5000); }
  falsaAlarma() { this.toast.show('Gracias: la alerta se marcó como falsa y el modelo la considerará en su próximo ajuste.', 'ok'); }
}
