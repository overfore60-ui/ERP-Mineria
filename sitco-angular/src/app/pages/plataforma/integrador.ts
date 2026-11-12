import { Component, computed, inject } from '@angular/core';
import { SISTEMAS, Sistema } from '../../core/data';
import { hbar } from '../../core/charts';
import { SimService } from '../../core/sim.service';
import { ToastService } from '../../core/toast.service';
import { nf } from '../../core/util';
import { Cell, Col, DataTable } from '../../shared/data-table';
import { HtmlPipe } from '../../shared/html.pipe';
import { Icon } from '../../shared/icon';
import { PageHeader } from '../../shared/page-header';
import { Banner, Card, Estado, Kpi, Timeline } from '../../shared/ui';

const TRATAMIENTO: Record<string, string> = { 'Se integra': 'ok', 'Solo lectura': '', 'Se amplía': 'cu', 'Se reemplaza': 'dk' };

/** Integrador de sistemas: un conector por cada sistema existente, con su estado según el simulador. */
@Component({
  selector: 'app-integrador',
  templateUrl: './integrador.html',
  imports: [DataTable, Cell, HtmlPipe, Icon, PageHeader, Banner, Card, Estado, Kpi, Timeline],
})
export class Integrador {
  readonly sim = inject(SimService);
  private toast = inject(ToastService);
  readonly tratamiento = TRATAMIENTO;
  readonly cols: Col<Sistema>[] = [
    { key: 'n', label: 'Sistema' }, { key: 't', label: 'Tratamiento' }, { key: 'dir', label: 'Sentido' }, { key: 'loc', label: 'Dónde corre' },
    { key: 'mod', label: 'Lo usa' }, { key: 'est', label: 'Estado', sortv: r => this.estado(r).t }, { key: 'acc', label: '', nosort: true },
  ];
  /** Cambia con el simulador: la tabla se vuelve a dibujar con el nuevo estado de cada conector. */
  readonly sistemas = computed(() => { this.sim.link; this.sim.path(); return [...SISTEMAS]; });
  readonly pasos = [
    { t: '1 · Lee o recibe del sistema', s: 'done', d: 'Por la interfaz que ese sistema ya ofrece. La red de control de planta solo se lee, a través de un diodo de datos.' },
    { t: '2 · Valida y traduce', s: 'done', d: 'Convierte el dato al modelo común de SITCO y rechaza lo incompleto con un motivo.' },
    { t: '3 · Registra con identificador único', s: 'done', d: 'Si el mensaje llega dos veces, se descarta el duplicado.' },
    { t: '4 · Entrega al módulo', s: 'cur', d: 'Si no hay enlace con la nube, el mensaje espera en el Nodo de Faena y sale solo al volver.' },
  ];
  readonly mensajes = hbar({ labels: SISTEMAS.filter(s => s.lat).map(s => s.n.replace(' (3 portales)', '')), values: [1840, 9620, 1210, 4380, 290, 17280, 7, 2460, 1930], fmt: v => nf(v), ml: 190, label: 'Mensajes procesados por conector en las últimas 24 horas' });

  estado(s: Sistema) {
    if (s.t === 'Se reemplaza') return { t: 'Migrado a SITCO', k: '' };
    if (s.loc === 'nube' && this.sim.link === 'down') return { t: 'En bandeja de salida', k: 'warn' };
    if (s.loc === 'nube' && this.sim.slow()) return { t: 'Conectado por satélite', k: 'warn' };
    return { t: 'Conectado', k: 'ok' };
  }
  probar(s: Sistema) {
    const st = this.estado(s);
    if (st.k === 'warn' && this.sim.link === 'down') { this.toast.show(`<strong>${s.n}:</strong> sin camino a la nube. Los mensajes esperan en el Nodo de Faena y salen solos al volver el enlace.`, 'warn', 5500); return; }
    const ms = Math.round(s.lat * (this.sim.slow() && s.loc === 'nube' ? 3.2 : 1) * (0.85 + Math.random() * 0.3));
    this.toast.show(`<strong>${s.n}:</strong> responde en ${nf(ms)} ms.`, 'ok');
  }
  probarTodos() {
    const con = SISTEMAS.filter(s => s.lat), ok = con.filter(s => this.estado(s).k === 'ok').length, w = con.length - ok;
    this.toast.show(`Prueba completa: <strong>${ok} conectores responden</strong>${w ? `, ${w} con aviso (revisa la columna Estado)` : ''}.`, w ? 'warn' : 'ok', 5500);
  }
}
