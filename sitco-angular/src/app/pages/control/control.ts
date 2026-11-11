import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EQ, EQUIPOS } from '../../core/data';
import { SessionService } from '../../core/session.service';
import { SimService } from '../../core/sim.service';
import { ToastService } from '../../core/toast.service';
import { nd, nf } from '../../core/util';
import { HtmlPipe } from '../../shared/html.pipe';
import { IsoArch } from '../../shared/iso-arch';
import { PageHeader } from '../../shared/page-header';
import { ClasificarDetencion } from '../operacion/clasificar';
import {
  CAMINOS, CAMIONES, DEST, MAPA_RIESGO, PALAS, PALA_IDS, PERFORADORAS, PITC, SERIES_PRISMAS, STC, TERRENO, ZONAS,
  avanzar, desplazamiento, enSombra, leyendaPit, paredGeotecnia, pit3d, posicion, turno,
} from './control-dibujo';

/** Centro Integrado de Operaciones: despacho con mapa animado, geotecnia, pit 3D y arquitectura. Todo simulado. */
@Component({
  selector: 'app-control',
  templateUrl: './control.html',
  imports: [RouterLink, HtmlPipe, IsoArch, PageHeader, ClasificarDetencion],
})
export class Control implements OnInit, OnDestroy {
  readonly sim = inject(SimService);
  readonly ses = inject(SessionService);
  private toast = inject(ToastService);
  readonly nf = nf;
  readonly nd = nd;
  readonly stc = STC;
  readonly terreno = TERRENO;
  readonly zonas = ZONAS;
  readonly caminos = CAMINOS;
  readonly pitc = PITC;
  readonly seriesPrismas = SERIES_PRISMAS;
  readonly mapaRiesgo = MAPA_RIESGO;
  readonly tabs = [['desp', 'Despacho y mapa'], ['geo', 'Geotecnia'], ['pit', 'Pit 3D'], ['arq', 'Arquitectura']];
  readonly capasLista = [['roads', 'Caminos'], ['zones', 'Zonas'], ['trucks', 'Camiones'], ['shovels', 'Palas'], ['drills', 'Perforadoras']];

  readonly ph = 'flex items-center justify-between gap-2 px-3 py-1.5 bg-cc-p2 border-b border-cc-line text-xs font-bold uppercase tracking-widest text-cc-mut';
  readonly nota = 'block px-3 py-2 text-[0.8125rem] text-cc-mut bg-cc-p border-t border-cc-line';
  readonly ctl = 'flex flex-wrap gap-3 items-center px-3 py-2 bg-cc-p2 border-t border-cc-line text-[0.8125rem]';
  readonly ley = 'flex flex-wrap gap-x-3 gap-y-1 px-3 py-2 text-xs text-cc-mut bg-cc-p';

  readonly tab = signal('desp');
  readonly sel = signal<string | null>(null);
  readonly capas = signal<Record<string, boolean>>({ roads: true, zones: true, trucks: true, shovels: true, drills: false });
  readonly angulo = signal(0.6);
  readonly colorPor = signal('mat');
  readonly girar = signal(false);
  /** WCAG 2.2.2: el movimiento del mapa se puede pausar, y parte pausado si el sistema pide reducir animaciones. */
  readonly pausado = signal(matchMedia('(prefers-reduced-motion: reduce)').matches);
  /** Avanza cada 450 ms y hace que se vuelva a dibujar la flota. */
  readonly tick = signal(0);
  private ver = signal(0);
  private timer?: ReturnType<typeof setInterval>;
  clasificar: string | null = null;

  ngOnInit() {
    this.timer = setInterval(() => {
      if (this.tab() === 'desp' && !this.pausado()) avanzar();
      if (this.tab() === 'pit' && this.girar()) this.angulo.update(a => (a + .03) % 6.283);
      this.tick.update(v => v + 1);
    }, 450);
  }
  ngOnDestroy() { clearInterval(this.timer); }

  private sombra = (p: [number, number], estado: string) => this.sim.lte === 'shadow' && enSombra(p) && estado === 'Operando';

  readonly camiones = computed(() => {
    this.tick(); this.ver();
    return CAMIONES.map(t => { const p = posicion(t); return { id: t.id, sh: t.sh, t: t.t, x: p[0], y: p[1], estado: t.ref.estado, c: STC[t.ref.estado], stale: this.sombra(p, t.ref.estado) }; });
  });
  readonly palas = computed(() => {
    this.ver();
    return PALA_IDS.map(k => {
      const s = PALAS[k], e = EQ(k)!, ts = this.camiones().filter(t => t.sh === k && t.estado !== 'Mantención');
      const n = k.charCodeAt(4) % 5;
      return { k, x: s.p[0], y: s.p[1], estado: e.estado, c: STC[e.estado], mat: s.mat, dest: DEST[s.d].n, ts, op: ts.filter(t => t.estado === 'Operando').length, tons: nf(Math.round(turno.tons * (.12 + n * .05))), pct: 40 + n * 11 };
    });
  });
  readonly perforadoras = computed(() => { this.ver(); return PERFORADORAS.map(d => ({ id: d.id, x: d.p[0], y: d.p[1], c: STC[d.ref.estado] })); });
  readonly grupos = computed(() => {
    this.ver();
    return [['Camiones 240 t', 'CF'], ['Palas eléctricas', 'PA'], ['Perforadoras', 'PF']].map(([t, p]) => ({ t, eq: EQUIPOS.filter(e => e.id.startsWith(p)) }));
  });
  readonly caminoSel = computed(() => { const s = this.sel(); return s ? (PALAS[s] ? s : CAMIONES.find(t => t.id === s)?.sh || null) : null; });
  readonly kpis = computed(() => {
    this.tick(); this.ver();
    return [
      ['Toneladas del turno', nf(turno.tons), 't'], ['Camiones en ciclo', CAMIONES.filter(t => t.ref.estado === 'Operando').length, 'de ' + CAMIONES.length],
      ['Palas operando', PALA_IDS.filter(k => EQ(k)!.estado === 'Operando').length, 'de 5'], ['Ciclo promedio', 31, 'min'],
      ['Detenidos sin clasificar', EQUIPOS.filter(e => e.det && e.det.causa === 'Sin clasificar').length, 'equipos'],
    ];
  });
  readonly seleccion = computed(() => {
    this.ver();
    const id = this.sel(); if (!id) return null;
    const e = EQ(id)!, t = CAMIONES.find(x => x.id === id);
    return { e, destino: t ? 'va a ' + DEST[PALAS[t.sh].d].n : 'Fabricante: ' + e.fab };
  });
  readonly pared = computed(() => { this.tick(); return paredGeotecnia(); });
  readonly velocidad = computed(() => { this.tick(); return nd(desplazamiento(), 1); });
  readonly pit = computed(() => pit3d(this.angulo(), this.colorPor()));
  readonly leyenda = computed(() => leyendaPit(this.colorPor()));

  cambiarTab(k: string) { this.tab.set(k); this.girar.set(false); }
  seleccionar(id: string) { this.sel.set(id); }
  capa(k: string, on: boolean) { this.capas.update(c => ({ ...c, [k]: on })); }
  rotar(v: string) { this.angulo.set(+v / 100); this.girar.set(false); }
  reconocer() {
    this.sim.capture('Alerta geotécnica', 'Alerta de talud este reconocida (P2, 4,5 mm/día)', 'Centro de control');
    this.toast.show('Alerta reconocida y registrada. Queda en la cola de sincronización y en la auditoría.', 'ok');
  }
  clasificado() { this.clasificar = null; this.ver.update(v => v + 1); }
}
