import { Component, computed, inject } from '@angular/core';
import { SimService } from '../core/sim.service';
import { HtmlPipe } from './html.pipe';

/* =====================================================================
   Arquitectura ilustrada sobre una vista aérea de la faena Aranda.
   El paisaje es una imagen fija generada con código
   (public/img/arquitectura-faena.webp, origen en
   herramientas/fondo-arquitectura.mjs); encima va esta capa SVG con las
   etiquetas, el Nodo de Faena, la red LTE privada y los tres caminos a la
   nube (fibra A por la Ruta 25, fibra B por otra ruta y satélite de órbita
   baja), que reaccionan al simulador de corte. Todo es ficticio.
   Lienzo: 1200 x 780, igual que la imagen de fondo.
   ===================================================================== */
type Pt = [number, number];
export interface EstadoArq { fibA: boolean; fibB: boolean; leo: boolean; sombra: boolean; pendientes: number }
export const FONDO_ARQUITECTURA = 'img/arquitectura-faena.webp';

const F_TIT = "font-family=\"'Public Sans',system-ui,sans-serif\"";
const OK = '#3fbf8f', AZ = '#4aa3df', AZ2 = '#8fd0ff', SAT = '#c8a8ff', CU = '#e0793a', MAL = '#ff6b5e', AV = '#f2b84b', APAG = '#9aa3aa';

/* ---------- Íconos (blancos, dibujados para un círculo de radio 13) ---------- */
const ICO: Record<string, string> = {
  camion: '<path d="M-9 -4h10v7h-10z M1 -2h4.5l3.5 3.5v1.5h-8z" fill="#fff"/><circle cx="-5.5" cy="4.6" r="2" fill="#fff"/><circle cx="4.5" cy="4.6" r="2" fill="#fff"/>',
  planta: '<path d="M-9 7v-8l4.5 -3.2v3.2l4.5 -3.2v3.2l4.5 -3.2v-4.6h3.5v15.8z" fill="#fff"/>',
  relave: '<path d="M0 -9c4.5 5.5 6.5 8.5 6.5 11a6.5 6.5 0 0 1 -13 0c0 -2.5 2 -5.5 6.5 -11z" fill="#fff"/>',
  casa: '<path d="M-9 0l9 -8l9 8v8h-6v-5.5h-6v5.5h-6z" fill="#fff"/>',
  nodo: '<rect x="-7.5" y="-8.5" width="15" height="5" rx="1" fill="#fff"/><rect x="-7.5" y="-2.2" width="15" height="5" rx="1" fill="#fff"/><rect x="-7.5" y="4" width="15" height="4.5" rx="1" fill="#fff"/><circle cx="4" cy="-6" r="1.1" fill="#2f7aa8"/><circle cx="4" cy=".3" r="1.1" fill="#2f7aa8"/>',
  antena: '<path d="M0 -2l-5.5 10.5h2.2l3.3 -6.3l3.3 6.3h2.2z" fill="#fff"/><path d="M-5 -6.5a7 7 0 0 1 10 0 M-8.5 -10a12 12 0 0 1 17 0" stroke="#fff" stroke-width="1.7" fill="none"/>',
  nube: '<path d="M-9 4.5a4.5 4.5 0 0 1 1 -9a6.5 6.5 0 0 1 12 -1a5 5 0 0 1 5 10z" fill="#fff"/>',
  barco: '<path d="M-10 1h20l-3.5 6.5h-13z M-4.5 -6.5h8v6.5h-8z" fill="#fff"/>',
  pantalla: '<rect x="-8.5" y="-7.5" width="17" height="12" rx="1.6" fill="#fff"/><path d="M-3.5 7.5h7" stroke="#fff" stroke-width="2"/>',
  sat: '<rect x="-3" y="-3" width="6" height="6" fill="#fff"/><path d="M-11 -3.5h6.5v7h-6.5z M4.5 -3.5h6.5v7h-6.5z" fill="#fff" fill-opacity=".85"/>',
  ruta: '<path d="M-3.5 9l2.2 -18h2.6l2.2 18z" fill="#fff"/><path d="M0 -6v3 M0 0v3.5" stroke="#3a2f25" stroke-width="1.3"/>',
  edificio: '<path d="M-7 9v-16h9v16z M3 9v-10h5v10z" fill="#fff"/><path d="M-4.5 -4h4 M-4.5 0h4 M-4.5 4h4" stroke="#3a2f25" stroke-width="1.3"/>',
};

/** Marcador redondo sobre el mapa, como en la vista aérea del caso. */
const pin = (p: Pt, ico: string, tono = '#3a2f25', r = 15) =>
  `<g transform="translate(${p[0]} ${p[1]})"><circle r="${r + 3}" fill="#000" fill-opacity=".25" cy="2"/><circle r="${r + 2}" fill="#fff"/><circle r="${r}" fill="${tono}"/><g transform="scale(${(r / 13).toFixed(2)})">${ICO[ico]}</g></g>`;

/** Tarjeta blanca con título y viñetas; con línea guía opcional hacia un punto. */
function tarjeta(c: Pt, tit: string, lineas: string[], op: { a?: Pt; ico?: string; tono?: string; borde?: string } = {}) {
  const conIco = !!op.ico, x0 = c[0] + (conIco ? 44 : 12);
  const w = Math.max(tit.length * 7.5, ...lineas.map(l => (l.length + 2) * 6.2)) + (conIco ? 56 : 24), h = 26 + lineas.length * 15;
  let s = '';
  if (op.a) {
    const ex = Math.min(Math.max(op.a[0], c[0] + 10), c[0] + w - 10), ey = op.a[1] < c[1] ? c[1] : c[1] + h;
    s += `<path d="M${op.a[0]} ${op.a[1]} L${ex} ${ey}" stroke="#fff" stroke-width="1.6"/><circle cx="${op.a[0]}" cy="${op.a[1]}" r="3.5" fill="#fff" stroke="#3a2f25" stroke-width="1.4"/>`;
  }
  s += `<rect x="${c[0]}" y="${c[1]}" width="${w}" height="${h}" rx="6" fill="#fff" fill-opacity=".95" stroke="${op.borde || '#000'}" stroke-opacity="${op.borde ? 1 : .12}" stroke-width="${op.borde ? 2.5 : 1}" filter="url(#arq-sombra)"/>`;
  if (conIco) s += `<g transform="translate(${c[0] + 22} ${c[1] + h / 2})"><circle r="15" fill="${op.tono || '#3a2f25'}"/><g transform="scale(1.1)">${ICO[op.ico!]}</g></g>`;
  s += `<text x="${x0}" y="${c[1] + 18}" font-size="14" font-weight="700" fill="#1f1a15" ${F_TIT}>${tit}</text>`;
  lineas.forEach((l, i) => s += `<text x="${x0}" y="${c[1] + 34 + i * 15}" font-size="11.5" fill="#4a4038" ${F_TIT}>• ${l}</text>`);
  return `<g>${s}</g>`;
}

/** Enlace de datos: trazo con guiones que avanzan y paquetes que viajan por el camino. */
function enlace(id: string, d: string, color: string, vivo: boolean, ancho = 3.5, paquetes = 2, dur = 4) {
  let s = `<path id="${id}" d="${d}" fill="none" stroke="#1b140e" stroke-opacity=".45" stroke-width="${ancho + 3}" stroke-linecap="round"/>`
    + `<path d="${d}" fill="none" stroke="${vivo ? color : APAG}" stroke-width="${ancho}" stroke-linecap="round" stroke-dasharray="${vivo ? '10 7' : '3 9'}" class="${vivo ? 'arq-flujo' : ''}"/>`;
  if (vivo) for (let i = 0; i < paquetes; i++) {
    s += `<circle r="${ancho + 1.3}" fill="#fff" stroke="${color}" stroke-width="2" class="arq-mov"><animateMotion dur="${dur}s" begin="${(-i * dur / paquetes).toFixed(2)}s" repeatCount="indefinite"><mpath href="#${id}"/></animateMotion></circle>`;
  }
  return s;
}
const corte = (p: Pt) => `<g transform="translate(${p[0]} ${p[1]})"><circle r="13" fill="${MAL}" stroke="#fff" stroke-width="2"/><path d="M-5 -5l10 10M5 -5l-10 10" stroke="#fff" stroke-width="3" stroke-linecap="round"/></g>`;

/** Torre LTE con ondas. */
const torre = (p: Pt, viva: boolean) => `<g transform="translate(${p[0]} ${p[1]})"><path d="M0 -34 L-6 0 M0 -34 L6 0 M-4.5 -11h9 M-2.8 -22h5.6" stroke="#fff" stroke-width="2" fill="none"/><circle cy="-36" r="3" fill="${viva ? OK : AV}"/>`
  + `<g fill="none" stroke="${viva ? OK : AV}" stroke-width="2.2"><path class="arq-onda" d="M-10 -44a14 14 0 0 1 20 0"/><path class="arq-onda arq-onda2" d="M-17 -50a24 24 0 0 1 34 0"/></g></g>`;

export function dibujoArquitectura(e: EstadoArq) {
  const camino = e.fibA || e.fibB || e.leo;
  const NO: Pt = [655, 512], CIO: Pt = [842, 66], SAN: Pt = [245, 46], SA: Pt = [430, 150];
  let s = '';

  /* --- Red LTE privada: de los equipos al Nodo de Faena --- */
  if (e.sombra) s += `<ellipse cx="580" cy="728" rx="150" ry="52" fill="${AV}" fill-opacity=".18" stroke="${AV}" stroke-width="2.2" stroke-dasharray="8 6"/>`;
  s += enlace('arq-lte1', `M560 700 Q 600 600 ${NO[0] - 4} ${NO[1] + 12}`, e.sombra ? AV : OK, !e.sombra, 2.6, 2, 2.6);
  s += enlace('arq-lte2', `M790 512 Q 730 500 ${NO[0] + 14} ${NO[1]}`, OK, true, 2.6, 1, 2.4);
  s += enlace('arq-lte3', `M300 470 Q 480 470 ${NO[0] - 14} ${NO[1] - 4}`, OK, true, 2.6, 1, 3.2);
  [[440, 612], [722, 486], [350, 440]].forEach((t, i) => s += torre(t as Pt, !(e.sombra && i === 0)));

  /* --- Caminos a la nube --- */
  const fa = `M${NO[0] - 30} ${NO[1] - 22} C 640 432, 700 420, 700 380 S 640 330, 690 290 S 800 260, 790 220 S 760 170, 830 140 S 850 100, ${CIO[0]} ${CIO[1] + 14}`;
  const fb = `M${NO[0] + 18} ${NO[1] - 14} C 880 470, 900 330, 920 250 S 900 140, ${CIO[0] + 12} ${CIO[1] + 12}`;
  s += enlace('arq-fa', fa, AZ, e.fibA, 3.8, 3, 6);
  s += enlace('arq-fb', fb, AZ2, e.fibB, 2.8, 2, 6);
  if (!e.fibA) s += corte([690, 292]);
  if (!e.fibB) s += corte([918, 262]);
  s += enlace('arq-leo1', `M${NO[0] - 10} ${NO[1] - 18} Q 470 330 ${SA[0] + 4} ${SA[1] + 16}`, SAT, e.leo, 2.4, 1, 3);
  s += enlace('arq-leo2', `M${SA[0] + 16} ${SA[1] - 6} Q 650 70 ${CIO[0] - 14} ${CIO[1]}`, SAT, e.leo, 2.4, 1, 3.4);
  if (!e.leo) s += corte([SA[0] + 26, SA[1] + 64]);
  s += `<g transform="translate(${SA[0]} ${SA[1]}) rotate(-20)"><rect x="-30" y="-7" width="21" height="14" fill="#3d4fb8" stroke="#e5e9ff" stroke-width="1.2"/><rect x="9" y="-7" width="21" height="14" fill="#3d4fb8" stroke="#e5e9ff" stroke-width="1.2"/><rect x="-9" y="-9" width="18" height="18" rx="2" fill="#eef1f3"/><path d="M-30 0h-0 M-19.5 -7v14 M19.5 -7v14" stroke="#e5e9ff"/></g>`;
  // arco punteado de Antofagasta a Santiago (oficina corporativa y nube Azure)
  s += enlace('arq-nube', `M${CIO[0] - 8} ${CIO[1] - 8} C 700 -20, 420 -16, ${SAN[0] + 30} ${SAN[1] - 4}`, '#ffffff', camino, 2.6, 2, 5);

  /* --- Nodo de Faena: sala técnica con servidores locales --- */
  s += `<ellipse cx="${NO[0]}" cy="${NO[1] + 6}" rx="40" ry="16" fill="${camino ? AZ : CU}" fill-opacity=".35" class="arq-pulso"/>`;
  s += pin(NO, 'nodo', camino ? '#2f7aa8' : '#a95725', 17);

  /* --- Marcadores y etiquetas, como en la vista aérea del caso --- */
  s += pin(CIO, 'edificio') + pin([1062, 178], 'barco') + pin([790, 500], 'planta') + pin([1040, 440], 'relave') + pin([268, 470], 'casa') + pin(SAN, 'nube', camino ? '#2f7aa8' : '#5b6770', 15);
  s += tarjeta([22, 74], 'Santiago', ['Oficina corporativa (Las Condes)', 'Nube Azure Chile Central, respaldo en Brazil South', camino ? (e.pendientes > 2 ? `Sincronizando ${e.pendientes} eventos` : 'Recibe los datos de la faena') : 'Sin camino: espera la sincronización'], { a: [SAN[0] - 6, SAN[1] + 18] });
  s += tarjeta([878, 6], 'Centro Integrado de Operaciones', ['En Antofagasta, a 145 km de la faena', 'Sala de control de mina y planta'], { a: [CIO[0] + 14, CIO[1] - 8] });
  s += tarjeta([926, 214], 'Acopio y embarque en Antofagasta', ['Recinto portuario de terceros', 'Acopio de 25.000 t de concentrado'], { a: [1062, 194] });
  s += tarjeta([728, 318], '145 km a Antofagasta', ['Ruta 25 y camino privado', e.fibA ? 'Fibra A junto al camino' : 'Fibra A cortada'], { ico: 'camion', a: [700, 372] });
  s += tarjeta([964, 300], 'Fibra B', [e.fibB ? 'Otro proveedor y otra ruta' : 'Fibra B cortada']);
  s += tarjeta([300, 172], 'Satélite de órbita baja', [e.leo ? 'Respaldo si caen las dos fibras' : 'Satélite sin servicio'], { a: [SA[0] - 6, SA[1] + 4] });
  s += tarjeta([28, 366], 'Área de servicios, portería y campamento', ['1.900 camas, a 9 km de la faena'], { ico: 'casa', a: [262, 452] });
  s += tarjeta([960, 488], 'Depósito de relaves', ['A 6 km de la planta'], { a: [1040, 458] });
  s += tarjeta([838, 590], 'Planta concentradora', ['Chancado, molienda y flotación'], { a: [800, 516] });
  s += tarjeta([26, 604], 'Rajo Aranda', ['Palas y camiones con equipo a bordo', e.sombra ? 'Sombra LTE: el equipo guarda cada evento' : 'Cada evento viaja por la red LTE privada'], { ico: 'camion', a: [372, 668] });
  s += tarjeta([690, 408], 'Nodo de Faena · sala técnica', [camino ? 'Responde a la faena y guarda 48 h sin nube' : 'Modo local: sostiene la operación hasta 48 h'],
    { ico: 'nodo', tono: camino ? '#2f7aa8' : '#a95725', borde: camino ? AZ : CU, a: [NO[0] + 14, NO[1] - 12] });

  const estilo = `<style>.arq-flujo{animation:arq-guion 1s linear infinite}@keyframes arq-guion{to{stroke-dashoffset:-17}}.arq-onda{animation:arq-onda 2s ease-in-out infinite}.arq-onda2{animation-delay:.5s}@keyframes arq-onda{0%,100%{opacity:.25}50%{opacity:1}}.arq-pulso{animation:arq-pulso 2.4s ease-in-out infinite}@keyframes arq-pulso{0%,100%{opacity:.45}50%{opacity:1}}@media (prefers-reduced-motion:reduce){.arq-flujo,.arq-onda,.arq-pulso{animation:none}.arq-mov{display:none}}</style>`;
  const defs = `<defs><filter id="arq-sombra" x="-10%" y="-20%" width="120%" height="150%"><feDropShadow dx="0" dy="2" stdDeviation="2.2" flood-color="#000" flood-opacity=".3"/></filter></defs>`;
  const resumen = camino
    ? 'Los equipos de la faena envían sus eventos por la red LTE privada al Nodo de Faena, que los sube al Centro Integrado de Operaciones en Antofagasta y a la nube Azure por la fibra A, la fibra B o el satélite.'
    : 'Sin ningún camino a la nube: el Nodo de Faena sostiene la operación hasta 48 horas y sincroniza al volver un enlace.';
  return `<svg viewBox="0 0 1200 780" style="display:block;width:100%;height:auto" role="img" aria-label="Vista aérea ilustrada de la faena Aranda hasta Antofagasta. ${resumen}">${estilo}${defs}${s}</svg>`;
}

/** Diagrama de arquitectura que reacciona al simulador (lo usan Conectividad y el Centro de control). */
@Component({
  selector: 'app-iso-arch',
  host: { class: 'block bg-cc-bg text-cc-tx rounded-[10px] border border-[#0e1215] overflow-hidden' },
  template: `
    <div class="flex flex-wrap items-center gap-x-4 gap-y-2 px-3 py-2 bg-[#0f1418] border-b border-cc-line">
      <span class="font-titulo font-bold text-[0.9375rem] tracking-wider uppercase text-white">Arquitectura de tres niveles</span>
      <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.8125rem] font-semibold bg-cc-p2 border border-cc-line">
        <i class="size-[9px] rounded-full" [class]="down() ? 'bg-cc-bad' : pendientes() > 2 ? 'bg-cc-warn' : 'bg-cc-ok'"></i>{{ estado() }}</span>
      <span class="flex flex-wrap gap-x-3 gap-y-1 text-xs text-cc-mut min-[900px]:ml-auto">
        <span><i class="inline-block w-4 h-[3px] align-middle mr-1 bg-cc-ok"></i>Equipo → Nodo (LTE)</span>
        <span><i class="inline-block w-4 h-[3px] align-middle mr-1 bg-[#4aa3df]"></i>Nodo → Antofagasta (fibra A y B)</span>
        <span><i class="inline-block w-4 h-[3px] align-middle mr-1 bg-[#c8a8ff]"></i>Satélite</span>
        <span><i class="inline-block w-4 h-[3px] align-middle mr-1 bg-white"></i>Antofagasta → nube en Santiago</span>
      </span>
    </div>
    <div class="bg-[#b98f6b] bg-cover bg-center" [style.background-image]="'url(' + fondo + ')'" [innerHTML]="svg() | html"></div>
    <div class="px-3 py-2 text-[0.8125rem] text-cc-mut bg-cc-p border-t border-cc-line"><b class="text-white">Cómo se lee:</b> el equipo guarda cada evento y lo manda al Nodo de Faena; el Nodo responde a la faena aunque no haya enlace con la nube (hasta 48 h) y sube todo en orden cuando vuelve un camino: fibra A, fibra B o satélite. Vista ilustrada, no a escala.</div>`,
  imports: [HtmlPipe],
})
export class IsoArch {
  private sim = inject(SimService);
  readonly fondo = FONDO_ARQUITECTURA;
  readonly down = computed(() => this.sim.link === 'down');
  readonly pendientes = computed(() => this.sim.pending());
  readonly estado = computed(() => this.down() ? 'Sin camino a la nube · el Nodo de Faena sostiene la operación' : this.pendientes() > 2 ? `Sincronizando ${this.pendientes()} eventos` : 'Todo sincronizado');
  readonly svg = computed(() => dibujoArquitectura({
    fibA: this.sim.fibA === 'ok', fibB: this.sim.fibB === 'ok', leo: this.sim.leo === 'ok', sombra: this.sim.lte === 'shadow', pendientes: this.pendientes(),
  }));
}
