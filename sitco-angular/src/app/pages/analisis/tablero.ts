import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LIMITES, EMBARQUES, HUELLA } from '../../core/data';
import { bar, donut, gauge, hbar, heat, line, scatter, stack } from '../../core/charts';
import { nd, nf } from '../../core/util';
import { ExportDialog } from '../../shared/export-dialog';
import { HtmlPipe } from '../../shared/html.pipe';
import { Icon } from '../../shared/icon';
import { PageHeader } from '../../shared/page-header';
import { Empty, Estado, Kpi, Skeleton } from '../../shared/ui';
import { CATS, INDICADORES, PERIODOS, datosPeriodo } from './tablero-datos';

interface Grafico { cat: string; t: string; svg: string; ley?: [string, string][]; enlace?: [string, string] }

/** Tablero analítico: indicadores con filtros por período y categoría, y gráficos con detalle al hacer clic. */
@Component({
  selector: 'app-tablero',
  templateUrl: './tablero.html',
  imports: [RouterLink, ExportDialog, HtmlPipe, Icon, PageHeader, Empty, Estado, Kpi, Skeleton],
})
export class Tablero {
  private router = inject(Router);
  readonly periodos = Object.entries(PERIODOS).map(([k, v]) => ({ v: +k, l: v[0] }));
  readonly cats = CATS;
  readonly periodo = signal(30);
  readonly categoria = signal('Todas');
  readonly cargando = signal(false);
  exportar = false;
  readonly csv = { name: 'tablero.csv', head: ['Indicador', 'Valor', 'Unidad', 'Categoría'], rows: INDICADORES.map(k => [k.l, k.v, k.u, k.cat]) };

  private ver = (c: string) => this.categoria() === 'Todas' || this.categoria() === c;
  readonly indicadores = computed(() => INDICADORES.filter(k => this.ver(k.cat)));
  readonly graficos = computed<Grafico[]>(() => {
    const D = datosPeriodo(this.periodo()), F = PERIODOS[this.periodo()][0];
    const g: Grafico[] = [
      { cat: 'Mina', t: 'Utilización efectiva de flota', svg: line({ labels: D.L, series: [{ name: 'Utilización', values: D.util, color: '#9C4A1F' }], ref: 80, refLabel: 'Meta interna 80 %', min: 60, max: 90, fmt: v => nf(Math.round(v)) + '%', label: `Utilización de flota, ${F}` }) },
      { cat: 'Mina', t: 'Detenciones por causa (clic para ver detalle)', svg: bar({ labels: ['Mecánica', 'Eléctrica', 'Esp. pala', 'Esp. camión', 'Clima', 'Turno', 'Comb.', 'Otras'], values: D.det, colors: ['#9C4A1F', '#9C4A1F', '#6C8294', '#6C8294', '#6C8294', '#8A6A3E', '#8A6A3E', '#1E2B35'], drill: () => 'data-href="/tablero/detalle/detenciones"', label: `Detenciones por causa, ${F}` }), enlace: ['Ver detalle de detenciones', '/tablero/detalle/detenciones'] },
      { cat: 'Mina', t: 'Destino del mineral', svg: donut({ items: [{ label: 'Planta', value: 61, color: '#1E2B35' }, { label: 'Stock baja ley', value: 24, color: '#9C4A1F' }, { label: 'Botadero', value: 15, color: '#8A6A3E' }], big: '82 Mt', small: 'movidas al año', label: 'Distribución del material por destino' }), ley: [['Planta 61 %', '#1E2B35'], ['Stock baja ley 24 %', '#9C4A1F'], ['Botadero 15 %', '#8A6A3E']] },
      { cat: 'Mina', t: 'Tonelaje por destino (kt)', svg: stack({ labels: D.L, series: [{ name: 'Planta', values: D.stack.a, color: '#1E2B35' }, { name: 'Stock baja ley', values: D.stack.b, color: '#9C4A1F' }, { name: 'Botadero', values: D.stack.c, color: '#8A6A3E' }], label: `Tonelaje por destino, ${F}` }), ley: [['Planta', '#1E2B35'], ['Stock baja ley', '#9C4A1F'], ['Botadero', '#8A6A3E']] },
      { cat: 'Mina', t: 'Cumplimiento del plan (área)', svg: line({ labels: D.L, area: true, series: [{ name: 'Cumplimiento', values: D.plan, color: '#1F7A5C' }], min: 60, max: 100, fmt: v => nf(Math.round(v)) + '%', ref: 90, refLabel: 'Meta 90 %', label: `Cumplimiento del plan, ${F}` }) },
      { cat: 'Planta', t: 'Ley de cabeza vs. recuperación', svg: scatter({ points: D.sc, xl: 'Ley de cabeza (% Cu)', yl: 'Recuperación (%)', label: 'Relación entre ley de cabeza y recuperación metalúrgica' }) },
      { cat: 'Mina', t: 'Demoras sin clasificar por hora del día (%)', svg: heat({ rows: ['L', 'M', 'X', 'J', 'V'], cols: ['08', '10', '12', '14', '16', '18', '20', '22', '00', '02', '04', '06'], values: D.heat, unit: '%', label: 'Mapa de calor de demoras sin clasificar' }) },
      { cat: 'Seguridad', t: 'Acreditaciones dentro de 48 h', svg: gauge({ value: 92, max: 100, target: 95, text: '92 %', sub: 'meta 95 %', good: true, label: 'Acreditaciones resueltas en menos de 48 horas' }) },
      { cat: 'Comercial', t: `Arsénico por embarque (%, límite ${nd(LIMITES.as, 2)})`, svg: hbar({ labels: EMBARQUES.slice(0, 7).map(e => e.id), values: EMBARQUES.slice(0, 7).map(e => e.as), fmt: v => nd(v, 2), colors: EMBARQUES.slice(0, 7).map(e => (e.as > LIMITES.as ? '#A32020' : '#1F7A5C')), ml: 100, w: 440, label: 'Arsénico proyectado por embarque' }) },
      { cat: 'Ambiental', t: 'Huella de carbono (tCO₂e/t Cu fino)', svg: bar({ labels: HUELLA.labels, values: HUELLA.labels.map((_, i) => +(HUELLA.a1[i] + HUELLA.a2[i] + HUELLA.a3[i]).toFixed(2)), fmt: v => nd(v, 2), color: '#1F7A5C', label: 'Huella de carbono mensual' }) },
    ];
    return g.filter(c => this.ver(c.cat));
  });

  cambiarPeriodo(v: string) {
    this.cargando.set(true);
    setTimeout(() => { this.periodo.set(+v); this.cargando.set(false); }, 250);
  }
  limpiar() { this.periodo.set(30); this.categoria.set('Todas'); }

  /** Las columnas con detalle llevan data-href: el clic abre el detalle (con teclado, el enlace bajo el gráfico). */
  profundizar(e: Event) {
    const el = (e.target as Element).closest('[data-href]');
    if (!el) return;
    e.preventDefault();
    this.router.navigateByUrl(el.getAttribute('data-href')!);
  }
}
