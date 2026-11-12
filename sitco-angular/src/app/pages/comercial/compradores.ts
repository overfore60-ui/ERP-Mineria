import { Component, computed, inject, signal } from '@angular/core';
import { EMBARQUES, Embarque, LIMITES, chain } from '../../core/data';
import { donut } from '../../core/charts';
import { ToastService } from '../../core/toast.service';
import { fd, nd, nf } from '../../core/util';
import { HtmlPipe } from '../../shared/html.pipe';
import { Icon } from '../../shared/icon';
import { PageHeader } from '../../shared/page-header';
import { Banner, Card, Estado, Hito, Kpi, Timeline } from '../../shared/ui';

/** Empresa compradora de la persona que entra al portal. */
const EMPRESA = 'Pacific Smelting Co. (Japón)';

/** Cómo ve el comprador cada estado interno del lote, y en qué paso del viaje va (1 a 8). */
const ESTADO: Record<string, { l: string; paso: number; tipo: string }> = {
  Programado: { l: 'Programado', paso: 1, tipo: 'dk' },
  'En conformación': { l: 'En preparación', paso: 6, tipo: 'cu' },
  'En muestreo': { l: 'En muestreo', paso: 4, tipo: 'cu' },
  'Pendiente de aprobación': { l: 'En revisión de calidad', paso: 6, tipo: 'warn' },
  Embarcado: { l: 'Embarcado', paso: 8, tipo: 'ok' },
  Liquidado: { l: 'Liquidado', paso: 9, tipo: 'ok' },
};

/** Documentos que recibe el comprador y desde qué paso del viaje están disponibles. */
const DOCUMENTOS: [string, number][] = [
  ['Certificado de análisis del vendedor', 5],
  ['Certificado de peso y humedad', 7],
  ['Conocimiento de embarque (B/L)', 8],
  ['Certificado de origen', 8],
  ['Declaración de huella de carbono del lote', 8],
];

/** Portal para Compradores: los embarques de la empresa y el viaje del mineral desde el rajo hasta la nave. */
@Component({
  selector: 'app-compradores',
  templateUrl: './compradores.html',
  imports: [HtmlPipe, Icon, PageHeader, Banner, Card, Estado, Kpi, Timeline],
})
export class Compradores {
  private toast = inject(ToastService);
  readonly nf = nf;
  readonly nd = nd;
  readonly fd = fd;
  readonly asLim = LIMITES.as;
  readonly empresa = EMPRESA.replace(/ \(.*\)$/, '');
  readonly estado = (e: Embarque) => ESTADO[e.estado] || { l: e.estado, paso: 1, tipo: '' };

  readonly lotes = EMBARQUES.filter(e => e.comprador === EMPRESA);
  readonly sel = signal(this.lotes.find(e => e.estado === 'Embarcado')?.id || this.lotes[0]?.id);
  readonly lote = computed(() => this.lotes.find(e => e.id === this.sel()));
  readonly paso = computed(() => { const e = this.lote(); return e ? this.estado(e).paso : 1; });
  /** El análisis es definitivo desde que el lote se embarca; antes es la ley proyectada. */
  readonly definitivo = computed(() => this.paso() >= 8);

  readonly kpis = computed(() => {
    const curso = this.lotes.filter(e => this.estado(e).paso < 9);
    const t = this.lotes.reduce((a, e) => a + e.t, 0);
    const cu = this.lotes.reduce((a, e) => a + e.cu * e.t, 0) / t;
    const as = this.lotes.reduce((a, e) => a + e.as * e.t, 0) / t;
    return [
      { l: 'Embarques en curso', v: String(curso.length), u: '', dl: `${this.lotes.length} embarques en el período`, c: 'neu' },
      { l: 'Concentrado recibido', v: nf(t), u: 't', dl: 'Suma de los lotes del período', c: 'neu' },
      { l: 'Ley de cobre promedio', v: nd(cu, 1), u: '% Cu', dl: 'Ponderada por tonelaje', c: 'neu' },
      { l: 'Arsénico promedio', v: nd(as, 2), u: '% As', dl: as <= LIMITES.as ? `Bajo el límite del contrato (${nd(LIMITES.as, 2)} %)` : 'Sobre el límite del contrato', c: as <= LIMITES.as ? 'good' : 'bad' },
    ] as const;
  });

  /** Polígonos del rajo que componen el lote seleccionado. */
  readonly origen = computed(() => {
    const e = this.lote();
    if (!e) return null;
    const c = chain(e.id), tot = c.reduce((a, x) => a + x.t, 0);
    return { c, tot, dona: donut({ items: c.map(x => ({ label: x.poli.id, value: x.t })), big: nf(tot), small: 't de mineral', label: 'Aporte de cada polígono al lote' }) };
  });

  readonly viaje = computed<Hito[]>(() => {
    const e = this.lote(), o = this.origen();
    if (!e || !o) return [];
    const fechas = o.c.map(x => x.fx.getTime());
    const stocks = [...new Set(o.c.map(x => x.stock))].join(', ');
    const pasos: [string, string][] = [
      ['Extracción en el rajo Aranda', `${o.c.length} polígonos de los bancos ${[...new Set(o.c.map(x => x.poli.banco))].join(', ')}, extraídos entre el ${fd(new Date(Math.min(...fechas)))} y el ${fd(new Date(Math.max(...fechas)))}.`],
      ['Acopio intermedio', `El mineral pasó por los acopios ${stocks} antes de entrar a la planta.`],
      ['Planta concentradora', `Chancado, molienda y flotación. Concentrado de cobre con ley ${this.definitivo() ? '' : 'proyectada de '}${nd(e.cu, 1)} % Cu.`],
      ['Muestreo y laboratorio', 'Análisis del laboratorio del vendedor. Tu laboratorio recibe la contramuestra; un laboratorio árbitro independiente dirime cualquier diferencia.'],
      ['Despacho al puerto de Antofagasta', 'Cada camión sale con su guía de despacho y su pesaje registrados.'],
      ['Conformación del lote en el terminal', `Lote de ${nf(e.t)} t de concentrado, muestreado según el protocolo comercial.`],
      ['Embarque', `Carga en la nave ${e.nave}.`],
      ['Liquidación', 'Cierre comercial con los análisis finales de ambos laboratorios.'],
    ];
    const cur = this.paso();
    return pasos.map(([t, d], i) => ({
      t: `${i + 1}. ${t}`, d,
      s: i + 1 < cur ? 'done' : i + 1 === cur ? 'cur' : '',
      w: i + 1 < cur ? 'Completado' : i + 1 === cur ? 'En curso' : 'Pendiente',
    }));
  });

  readonly documentos = computed(() => DOCUMENTOS.map(([n, desde]) => ({ n, listo: this.paso() >= desde })));

  descargar(n: string) { this.toast.show(`<strong>${n}</strong> del lote ${this.sel()} descargado.`, 'ok', 3500); }
}
