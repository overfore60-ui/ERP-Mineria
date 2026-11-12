/* =====================================================================
   Simulación de conectividad: dispositivo → Nodo de Faena → nube
   La operación sigue y los datos se sincronizan solos.
   Caminos hacia la nube: fibra A (proveedor actual),
   fibra B (otro proveedor y camino) y enlace satelital de órbita baja.
   El modo local solo se activa si caen los tres.
   ===================================================================== */
import { Injectable, inject, signal } from '@angular/core';
import { ToastService } from './toast.service';
import { nd, nf } from './util';

type Estado = 'ok' | 'down';
export type Dispositivo = 'botonera' | 'tableta' | 'otro';
export interface Evento { id: string; type: string; label: string; src: string; dev: Dispositivo; ts: Date; tier: number }
export interface Bitacora { t: string; k: string; f: Date }
export interface Nodo { id: string; n: string; s: 'ok' | 'warn' | 'err'; t: string }

@Injectable({ providedIn: 'root' })
export class SimService {
  private toast = inject(ToastService);
  /** Cambia en cada evento: las vistas que leen el estado se vuelven a dibujar solas. */
  readonly cambio = signal(0);

  private st = {
    link: 'ok' as Estado, fibA: 'ok' as Estado, fibB: 'ok' as Estado, leo: 'ok' as Estado,
    lte: 'ok' as 'ok' | 'shadow', hours: 0, bulk: 0, queue: [] as Evento[], total: 0, syncedAtCut: 0,
    resolved: 0, lastSync: new Date(), log: [] as Bitacora[], seq: 1,
  };

  constructor() { setInterval(() => this.tick(), 700); }

  private get s() { this.cambio(); return this.st; }
  get link() { return this.s.link; }
  get fibA() { return this.s.fibA; }
  get fibB() { return this.s.fibB; }
  get leo() { return this.s.leo; }
  get lte() { return this.s.lte; }
  get hours() { return this.s.hours; }
  get total() { return this.s.total; }
  get resolved() { return this.s.resolved; }
  get lastSync() { return this.s.lastSync; }
  get log() { return this.s.log; }
  get queue() { return this.s.queue; }

  private emit() { this.cambio.update(v => v + 1); }

  pending() { return this.s.queue.filter(e => e.tier < 2).length + this.s.bulk; }
  onDevice() { return this.s.queue.filter(e => e.tier === 0).length; }
  onEdge() { return this.s.queue.filter(e => e.tier === 1).length + this.s.bulk; }
  mode() { return this.link === 'down' ? 'down' : this.pending() > 2 ? 'sync' : 'ok'; }
  path() { const s = this.s; return s.fibA === 'ok' ? 'Fibra A' : s.fibB === 'ok' ? 'Fibra B' : s.leo === 'ok' ? 'Satélite de órbita baja' : null; }
  pathName() { return ({ 'Fibra A': 'fibra A', 'Fibra B': 'fibra B', 'Satélite de órbita baja': 'satélite de órbita baja' } as Record<string, string>)[this.path() || ''] || ''; }
  slow() { return this.path() === 'Satélite de órbita baja'; }

  say(t: string, k = 'info') { this.st.log = [{ t, k, f: new Date() }, ...this.st.log].slice(0, 40); }

  /** Registra un evento de terreno: queda en el equipo hasta que haya cobertura. */
  capture(type: string, label: string, src = 'Terreno', dev: Dispositivo = 'otro') {
    const st = this.st;
    const e: Evento = { id: 'EV-' + String(st.seq++).padStart(5, '0'), type, label, src, dev, ts: new Date(), tier: 0 };
    st.queue = [e, ...st.queue].slice(0, 80);
    st.total++;
    if (st.lte === 'shadow') this.say(`${e.id} guardado en el equipo (zona sin cobertura LTE)`, 'warn');
    this.emit();
    return e;
  }

  setPath(which: 'A' | 'B' | 'L', down: boolean) {
    const st = this.st;
    const key = ({ A: 'fibA', B: 'fibB', L: 'leo' } as const)[which];
    const nom = { A: 'La fibra A (proveedor actual)', B: 'La fibra B (otro proveedor y camino)', L: 'El enlace satelital de órbita baja' }[which];
    if ((st[key] === 'down') === down) return;
    const before = st.link, pBefore = this.path();
    st[key] = down ? 'down' : 'ok';
    const p = this.path();
    st.link = p ? 'ok' : 'down';
    if (st.link === 'down' && before === 'ok') {
      st.hours = 0; st.syncedAtCut = st.total;
      this.say('Cayeron las dos fibras y el satélite. El Nodo de Faena asume el servicio (modo local).', 'err');
      this.toast.show('<strong>Sin camino a la nube.</strong> La operación sigue en modo local: nada se detiene.', 'warn', 6000);
    } else if (st.link === 'ok' && before === 'down') {
      this.say(`Enlace restablecido por ${this.pathName()} tras ${nd(st.hours, 0)} h. ${this.slow() ? 'La operación en vivo y las alertas se sincronizan; las series del historiador esperan en el Nodo hasta que vuelva una fibra.' : 'Sincronizando ' + this.pending() + ' eventos…'}`, 'ok');
      this.toast.show('<strong>Enlace restablecido.</strong> Sincronizando automáticamente…', 'info');
    } else if (p !== pBefore) {
      if (down) {
        this.say(`${nom} cayó. El SD-WAN conmuta a ${this.pathName()} en 5 segundos o menos.${this.slow() ? ' El satélite (20 Mbps) lleva la operación en vivo, las alertas y la bandeja de salida; las series del historiador esperan en el Nodo hasta que vuelva una fibra.' : ''}`, this.slow() ? 'warn' : 'info');
        this.toast.show(`<strong>${nom} cayó.</strong> El tráfico pasa por ${this.pathName()}; la operación no se detiene.`, 'info', 5000);
      } else this.say(`${nom} volvió. El tráfico regresa por ${this.pathName()}.`, 'ok');
    } else this.say(`${nom} ${down ? 'cayó' : 'volvió'}; el tráfico sigue por ${this.pathName()}.`, 'info');
    this.emit();
  }

  setLink(down: boolean) { (['A', 'B', 'L'] as const).forEach(k => this.setPath(k, down)); }

  setLte(shadow: boolean) {
    this.st.lte = shadow ? 'shadow' : 'ok';
    this.say(shadow ? 'El equipo entró a una zona de sombra (fondo del rajo).' : 'El equipo recuperó cobertura LTE y vuelca su cola al Nodo de Faena.', shadow ? 'warn' : 'ok');
    this.emit();
  }

  advance(h: number) {
    const st = this.st;
    if (st.link !== 'down') { this.toast.show('Primero corta las dos fibras y el satélite para avanzar el reloj.', 'info'); return; }
    st.hours += h;
    const n = Math.min(520, Math.round(h * 26));
    st.bulk += n; st.total += n;
    this.say(`+${h} h sin enlace: se registraron ${nf(n)} eventos localmente (despacho, cambios de destino, incidentes, inspecciones).`, st.hours > 48 ? 'err' : 'warn');
    if (st.hours > 48) this.toast.show('Se superaron las 48 horas de autonomía comprometidas.', 'err', 6000);
    this.emit();
  }

  reset() {
    const st = this.st;
    st.link = st.fibA = st.fibB = st.leo = 'ok'; st.lte = 'ok'; st.hours = 0; st.bulk = 0; st.syncedAtCut = 0;
    st.queue.forEach(e => (e.tier = 2));
    this.emit();
  }

  private tick() {
    const st = this.st;
    let moved = 0;
    const fast = Math.max(4, Math.ceil(this.pending() / 14));
    st.queue.slice().reverse().forEach(e => {
      if (moved >= fast) return;
      if (e.tier === 0 && st.lte === 'ok') { e.tier = 1; moved++; }
      else if (e.tier === 1 && st.link === 'ok') { e.tier = 2; moved++; }
    });
    if (st.bulk && st.link === 'ok' && !this.slow() && st.lte === 'ok') {
      const m = Math.min(st.bulk, Math.max(20, Math.ceil(st.bulk / 8)));
      st.bulk -= m; moved += m;
      if (!st.bulk) this.finish();
    }
    if (moved) {
      st.lastSync = new Date();
      if (!this.pending() && st.link === 'ok') this.finish();
      this.emit();
    }
  }

  private finish() {
    const st = this.st;
    if (st.hours > 0 || st.syncedAtCut) {
      const n = st.total - st.syncedAtCut;
      st.resolved = st.hours > 6 ? 1 : 0;
      this.say(`Sincronización completa: ${nf(n)} eventos en orden, ${st.resolved} conflicto de versión del plan resuelto por regla (el plan, que es dato maestro, lo gana la última versión aprobada en la nube; los hechos de faena los gana el Nodo de Faena), 0 intervenciones manuales. Duplicados descartados por el identificador del evento; registros cifrados y firmados.`, 'ok');
      this.toast.show(`<strong>Sincronización completa.</strong> ${nf(n)} eventos, 0 intervenciones manuales.`, 'ok', 6500);
      st.hours = 0; st.syncedAtCut = 0;
    }
  }

  /** Solo los puntos de la red que tienen un problema; vacío si todo funciona. */
  fallas(): Nodo[] { return this.nodes().filter(n => n.s !== 'ok'); }

  nodes(): Nodo[] {
    const d = this.link === 'down', p = this.path();
    const linkS = d ? 'err' : p === 'Fibra A' ? 'ok' : 'warn';
    const linkT = d ? 'Caídas las dos fibras y el satélite · modo local'
      : p === 'Fibra A' ? 'Fibra A activa · fibra B disponible y satélite en espera'
        : p === 'Fibra B' ? 'Fibra A caída · el tráfico va por la fibra B'
          : 'Ambas fibras caídas · el tráfico va por el satélite de órbita baja (20 Mbps); las series del historiador esperan en el Nodo';
    return [
      { id: 'device', n: 'Equipo en terreno', s: this.lte === 'shadow' ? 'warn' : 'ok', t: this.lte === 'shadow' ? 'Sin cobertura · guarda localmente' : 'Conectado al Nodo de Faena por LTE privada' },
      { id: 'edge', n: 'Nodo de Faena (sala técnica)', s: this.hours > 48 ? 'warn' : 'ok', t: d ? 'Opera en modo local · autonomía ' + nd(this.hours, 0) + ' de 48 h' : 'Operando · réplica hacia la nube' },
      { id: 'link', n: 'Enlaces faena–Antofagasta', s: linkS, t: linkT },
      { id: 'cloud', n: 'Nube corporativa (Azure, Santiago)', s: d ? 'warn' : 'ok', t: d ? 'Sin recibir datos · retiene lo último sincronizado' : 'Recibiendo y consolidando · réplica en São Paulo' },
      { id: 'cio', n: 'Centro Integrado de Operaciones', s: d ? 'warn' : 'ok', t: d ? 'Datos de la faena congelados · telefonía por el satélite geoestacionario' : 'Vista en vivo de la operación' },
    ];
  }
}
