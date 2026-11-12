import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SessionService } from '../../core/session.service';
import { SimService } from '../../core/sim.service';
import { fd, ft, nd, nf } from '../../core/util';
import { HtmlPipe } from '../../shared/html.pipe';
import { IsoArch } from '../../shared/iso-arch';
import { PageHeader } from '../../shared/page-header';
import { Banner, Card, Empty, Estado, Kpi, Timeline, Tip } from '../../shared/ui';
import { SimPanel } from '../../layout/sim-widget';

/** Qué sigue y qué se detiene sin enlace. */
const SIN_ENLACE = [
  ['Registro en terreno (cambios de destino, incidentes, inspecciones, avisos de falla)', 'Sigue', 'ok', 'Los dispositivos guardan registros cifrados y firmados al menos 48 horas.'],
  ['Habilitación en portería', 'Sigue', 'ok', 'Se valida contra la copia local de identidades del Nodo de Faena.'],
  ['Registros de seguridad y alertas de fatiga', 'Sigue en el Nodo', 'ok', 'Se atienden y escalan localmente; la nube se consolida al restablecerse el enlace.'],
  ['Acreditación de personas nuevas', 'Ingreso excepcional', 'warn', 'Autorizado y registrado en la Consola de Portería.'],
  ['Vista única del equipo con telemetría', 'No disponible', 'warn', 'El supervisor usa el despacho; la App guarda los avisos de falla y las clasificaciones y los envía al volver el enlace.'],
  ['Vista del Centro Integrado de Operaciones y tablero corporativo', 'No disponible', 'warn', 'Coordinación por radio y teléfono satelital.'],
  ['Envíos a SAP y reportes a la autoridad', 'Bandeja de salida', 'warn', 'Se envían en el orden de origen al volver el enlace.'],
  ['Portal para Compradores', 'Último dato recibido', 'warn', 'Muestra el lote con la fecha del último dato recibido.'],
];

/** Diagrama plano de la arquitectura de conectividad, según el estado del simulador. */
function diagrama(s: SimService) {
  const d = s.link === 'down', sh = s.lte === 'shadow', N = s.nodes();
  const col = (st: string) => (st === 'ok' ? '#1F7A5C' : st === 'warn' ? '#C58A10' : '#A32020');
  const caja = (x: number, y: number, w: number, h: number, t: string, sub: string, st: string) => `<g><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="#fff" stroke="${col(st)}" stroke-width="3"/><text x="${x + w / 2}" y="${y + 24}" text-anchor="middle" style="font:700 14px var(--font-titulo);fill:#1E2B35">${t}</text><text x="${x + w / 2}" y="${y + 42}" text-anchor="middle" style="font-size:11px">${sub}</text></g>`;
  const linea = (x1: number, y1: number, x2: number, y2: number, cut: boolean) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${cut ? '#A32020' : '#1F7A5C'}" stroke-width="3" stroke-dasharray="${cut ? '2 8' : '6 6'}">${cut ? '' : '<animate attributeName="stroke-dashoffset" from="24" to="0" dur="1.2s" repeatCount="indefinite"/>'}</line>`;
  return `<svg class="chart" viewBox="0 0 900 430" role="img" aria-label="Arquitectura: equipos en terreno, Nodo de Faena, dos fibras y un satélite de órbita baja, nube corporativa y Centro Integrado de Operaciones. Estado actual: ${d ? 'sin camino a la nube, operando en modo local' : 'conectado por ' + s.pathName()}">
  <rect x="10" y="10" width="560" height="410" rx="16" fill="#F5F0E8" stroke="#D3C6AE" stroke-dasharray="6 5"/><text x="26" y="34" style="font:700 13px var(--font-texto);fill:#4A5A66">FAENA · Rajo Aranda (opera sin enlace)</text>
  <rect x="600" y="10" width="290" height="410" rx="16" fill="#EEF1F3" stroke="#D3C6AE" stroke-dasharray="6 5"/><text x="616" y="34" style="font:700 13px var(--font-texto);fill:#4A5A66">ANTOFAGASTA · SANTIAGO</text>
  ${caja(30, 60, 200, 64, 'Equipos en terreno', sh ? 'Zona sin cobertura · guarda local' : 'Operador · supervisor', N[0].s)}
  ${linea(130, 124, 130, 168, sh)}<text x="142" y="152" style="font-size:11px">${sh ? 'sin LTE' : 'LTE privada'}</text>
  ${caja(30, 168, 200, 70, 'Nodo de Faena', d ? `Modo local · ${nd(s.hours, 0)}/48 h` : 'Sala técnica', N[1].s)}
  ${linea(230, 186, 600, 186, s.fibA === 'down')}<text x="415" y="179" text-anchor="middle" style="font:700 11px var(--font-texto);fill:${s.fibA === 'down' ? '#A32020' : '#1F7A5C'}">${s.fibA === 'down' ? '✕ Fibra A caída' : 'Fibra A · proveedor actual'}</text>
  ${linea(230, 214, 600, 214, s.fibB === 'down')}<text x="415" y="207" text-anchor="middle" style="font:700 11px var(--font-texto);fill:${s.fibB === 'down' ? '#A32020' : '#1F7A5C'}">${s.fibB === 'down' ? '✕ Fibra B caída' : 'Fibra B · otro proveedor y camino'}</text>
  <path d="M230 232 C330 300 520 300 600 250" fill="none" stroke="${s.leo === 'down' ? '#A32020' : s.slow() ? '#C58A10' : '#9AA8B2'}" stroke-width="${s.slow() ? 4 : 2.5}" stroke-dasharray="${s.slow() ? 'none' : '3 6'}"/><text x="490" y="306" text-anchor="middle" style="font-size:11px">${s.leo === 'down' ? '✕ Satélite de órbita baja caído' : s.slow() ? 'Satélite de órbita baja: operación en vivo y alertas' : 'Satélite de órbita baja en espera'}</text>
  <text x="612" y="262" style="font-size:11px;fill:#4A5A66">Satélite GEO existente:</text><text x="612" y="277" style="font-size:11px;fill:#4A5A66">solo voz y correo</text>
  ${caja(640, 60, 220, 70, 'Nube corporativa', d ? 'Sin recibir · retiene lo último' : 'Azure Santiago · réplica São Paulo', N[3].s)}
  ${caja(640, 168, 220, 70, 'CIO Antofagasta', d ? 'Datos congelados · telefonía' : 'Centro Integrado de Operaciones', N[4].s)}
  ${linea(750, 130, 750, 168, d)}
  <rect x="30" y="300" width="250" height="100" rx="12" fill="#fff" stroke="#9AA8B2" stroke-width="2"/><text x="155" y="322" text-anchor="middle" style="font:700 13px var(--font-titulo);fill:#1E2B35">Sistemas que se mantienen</text><text x="155" y="342" text-anchor="middle" style="font-size:11px">Despacho · Laboratorio · Planificación</text><text x="155" y="358" text-anchor="middle" style="font-size:11px">Telemetría (3) · Fatiga · Báscula</text><text x="155" y="378" text-anchor="middle" style="font-size:11px;fill:#1F7A5C;font-weight:700">Se integran, no se reemplazan</text>
  ${linea(155, 300, 155, 238, false)}
  <rect x="300" y="330" width="250" height="72" rx="12" fill="#fff" stroke="#1E2B35" stroke-width="2"/><text x="425" y="352" text-anchor="middle" style="font:700 13px var(--font-titulo);fill:#1E2B35">Red de control de planta (OT)</text><text x="425" y="370" text-anchor="middle" style="font-size:11px">Segregada · solo lectura mediante</text><text x="425" y="386" text-anchor="middle" style="font-size:11px">diodo de datos hacia el borde</text>
  <path d="M425 330 L230 232" stroke="#1E2B35" stroke-width="2" fill="none" marker-end="url(#ar)"/><defs><marker id="ar" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L8 4L0 8z" fill="#1E2B35"/></marker></defs>
  ${caja(640, 290, 220, 70, 'SAP S/4HANA', 'Registro contable · emite', 'ok')}<line x1="750" y1="238" x2="750" y2="290" stroke="#9AA8B2" stroke-width="2"/>
  </svg>`;
}

/** Conectividad y nube: qué pasa cuando se corta la fibra y cómo se sincroniza todo al volver. */
@Component({
  selector: 'app-conectividad',
  templateUrl: './conectividad.html',
  imports: [RouterLink, HtmlPipe, IsoArch, PageHeader, Banner, Card, Empty, Estado, Kpi, Timeline, Tip, SimPanel],
})
export class Conectividad {
  readonly sim = inject(SimService);
  readonly ses = inject(SessionService);
  readonly nf = nf;
  readonly ft = ft;
  readonly sinEnlace = SIN_ENLACE;
  readonly tiers = ['En equipo', 'En el Nodo', 'En nube'];
  readonly tiersLargo = ['Solo en el equipo', 'En el Nodo de Faena', 'Sincronizado en la nube'];
  readonly diagrama = computed(() => diagrama(this.sim));
  readonly fallas = computed(() => this.sim.fallas());
  readonly kpis = computed(() => {
    const s = this.sim, d = s.link === 'down';
    return [
      { l: 'Estado', v: d ? 'Modo local' : s.pending() ? 'Sincronizando' : 'Conectado', u: '', dl: d ? 'La operación NO se detiene' : 'Por ' + s.pathName(), c: d ? 'bad' : 'good' },
      { l: 'Autonomía usada', v: nd(s.hours, 0), u: 'h de 48', dl: s.hours > 48 ? 'Fuera de la garantía' : 'Dentro de la garantía', c: s.hours > 48 ? 'bad' : 'good' },
      { l: 'Registros por sincronizar', v: nf(s.pending()), u: '', dl: `En equipo ${nf(s.onDevice())} · en el Nodo ${nf(s.onEdge())}`, c: s.pending() ? 'bad' : 'good' },
      { l: 'Última sincronización', v: ft(s.lastSync), u: '', dl: fd(s.lastSync), c: 'neu' },
    ] as const;
  });
  readonly bitacora = computed(() => this.sim.log.slice(0, 7).map(l => ({ t: l.t, w: ft(l.f), s: l.k === 'ok' ? 'done' : l.k === 'err' ? 'bad' : l.k === 'warn' ? 'warn' : '' })));
  readonly cola = computed(() => this.sim.queue.slice(0, 8));
  readonly lote = computed(() => this.sim.onEdge() - this.sim.queue.filter(e => e.tier === 1).length);
}
