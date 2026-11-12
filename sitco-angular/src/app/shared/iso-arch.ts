import { Component, computed, inject, signal } from '@angular/core';
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

  /* --- Nodo de Faena y marcadores: solo íconos; la información sale al pasar el cursor o al tocar --- */
  s += `<ellipse cx="${NO[0]}" cy="${NO[1] + 6}" rx="40" ry="16" fill="${camino ? AZ : CU}" fill-opacity=".35" class="arq-pulso"/>`;
  puntosArquitectura(e).forEach(q => {
    s += `<g class="arq-pin" data-id="${q.id}" tabindex="0" role="button" aria-label="${q.tit}: ${q.sub}" style="cursor:pointer;outline:none">`
      + `<circle cx="${q.p[0]}" cy="${q.p[1]}" r="26" fill="transparent"/>`
      + (q.id === 'sat' || q.id === 'lte' ? `<circle cx="${q.p[0]}" cy="${q.p[1]}" r="11" fill="${q.tono}" stroke="#fff" stroke-width="2"/><g transform="translate(${q.p[0]} ${q.p[1]}) scale(.72)">${ICO[q.ico]}</g>` : pin(q.p, q.ico, q.tono, q.id === 'nodo' ? 17 : 15))
      + (q.alerta ? `<circle cx="${q.p[0] + 13}" cy="${q.p[1] - 13}" r="6" fill="${MAL}" stroke="#fff" stroke-width="1.6"/>` : '')
      + `</g>`;
  });

  const estilo = `<style>.arq-flujo{animation:arq-guion 1s linear infinite}@keyframes arq-guion{to{stroke-dashoffset:-17}}.arq-onda{animation:arq-onda 2s ease-in-out infinite}.arq-onda2{animation-delay:.5s}@keyframes arq-onda{0%,100%{opacity:.25}50%{opacity:1}}.arq-pulso{animation:arq-pulso 2.4s ease-in-out infinite}@keyframes arq-pulso{0%,100%{opacity:.45}50%{opacity:1}}.arq-pin{transition:transform .15s}.arq-pin:hover,.arq-pin:focus-visible{filter:drop-shadow(0 0 6px #fff)}@media (prefers-reduced-motion:reduce){.arq-flujo,.arq-onda,.arq-pulso{animation:none}.arq-mov{display:none}}</style>`;
  const resumen = camino
    ? 'Los equipos de la faena envían sus eventos por la red LTE privada al Nodo de Faena, que los sube al Centro Integrado de Operaciones en Antofagasta y a la nube Azure por la fibra A, la fibra B o el satélite.'
    : 'Sin ningún camino a la nube: el Nodo de Faena sostiene la operación hasta 48 horas y sincroniza al volver un enlace.';
  return `<svg viewBox="0 0 1200 780" style="display:block;width:100%;height:auto" role="group" aria-label="Vista aérea ilustrada de la faena Aranda hasta Antofagasta. ${resumen} Pasa el cursor o toca un marcador para ver su detalle.">${estilo}${s}</svg>`;
}

/** Lugares de la vista: posición, ícono y el texto que se muestra en el recuadro de detalle. */
export interface PuntoArq { id: string; p: Pt; ico: string; tono: string; tit: string; sub: string; lineas: string[]; alerta?: boolean }
export function puntosArquitectura(e: EstadoArq): PuntoArq[] {
  const camino = e.fibA || e.fibB || e.leo, D = '#3a2f25';
  return [
    { id: 'nodo', p: [655, 512], ico: 'nodo', tono: camino ? '#2f7aa8' : '#a95725', tit: 'Nodo de Faena · sala técnica', sub: camino ? 'Conectado a la nube' : 'Modo local',
      lineas: [camino ? 'Responde a la faena y sube los eventos en orden a la nube' : 'Sin camino a la nube: sostiene la operación hasta 48 h', 'Recibe los eventos de equipos y personas por la red LTE privada', 'Guarda copia local de los datos del turno y del balance', 'Al volver un enlace sincroniza sin perder ni duplicar eventos'], alerta: !camino },
    { id: 'rajo', p: [372, 668], ico: 'camion', tono: D, tit: 'Rajo Aranda', sub: e.sombra ? 'Sombra LTE en el fondo del rajo' : 'Operación de mina',
      lineas: ['Palas, camiones y perforadoras con equipo a bordo', e.sombra ? 'Sin cobertura en el fondo: cada equipo guarda sus eventos' : 'Cada evento viaja por la red LTE privada al Nodo', 'Rampas de acarreo hacia el chancador y los botaderos'], alerta: e.sombra },
    { id: 'lte', p: [440, 578], ico: 'antena', tono: e.sombra ? '#a9781f' : '#2f8a66', tit: 'Red LTE privada', sub: e.sombra ? 'Sombra de cobertura' : 'Cobertura en rajo, planta y campamento',
      lineas: ['Torres en el borde del rajo, la planta y el campamento', 'Une equipos, tabletas y sensores con el Nodo de Faena', e.sombra ? 'En la sombra el equipo guarda cada evento y lo envía al recuperar señal' : 'Si un equipo pierde señal, guarda los eventos y los envía al volver'], alerta: e.sombra },
    { id: 'planta', p: [790, 500], ico: 'planta', tono: D, tit: 'Planta concentradora', sub: 'Proceso del mineral',
      lineas: ['Chancado, molienda y flotación', 'Espesadores, filtrado y acopio de concentrado', 'Sus mediciones alimentan el balance metalúrgico'] },
    { id: 'relaves', p: [1040, 440], ico: 'relave', tono: D, tit: 'Depósito de relaves', sub: 'A 6 km de la planta',
      lineas: ['Recibe los relaves de la planta concentradora', 'Monitoreo del muro y del agua recuperada'] },
    { id: 'campamento', p: [268, 470], ico: 'casa', tono: D, tit: 'Área de servicios, portería y campamento', sub: '1.900 camas',
      lineas: ['A 9 km de la faena', 'Portería con control de acceso y acreditación', 'Casino, policlínico y pabellones de dormitorios'] },
    { id: 'ruta', p: [690, 352], ico: 'ruta', tono: e.fibA ? D : '#a8322a', tit: '145 km a Antofagasta · fibra A', sub: e.fibA ? 'Enlace principal' : 'Fibra A cortada',
      lineas: ['Ruta 25 y 26 km de camino privado', 'La fibra A va junto al camino', e.fibA ? 'Lleva los datos del Nodo de Faena a Antofagasta' : 'Corte simulado: el tráfico pasa a la fibra B o al satélite'], alerta: !e.fibA },
    { id: 'fibraB', p: [867, 393], ico: 'ruta', tono: e.fibB ? D : '#a8322a', tit: 'Fibra B', sub: e.fibB ? 'Enlace de respaldo' : 'Fibra B cortada',
      lineas: ['Otro proveedor y otra ruta hasta Antofagasta', e.fibB ? 'Toma el tráfico si se corta la fibra A' : 'Corte simulado: queda el satélite como camino'], alerta: !e.fibB },
    { id: 'sat', p: [430, 150], ico: 'sat', tono: e.leo ? '#4a3fa8' : '#a8322a', tit: 'Satélite de órbita baja', sub: e.leo ? 'Tercer camino' : 'Sin servicio',
      lineas: ['Respaldo si caen las dos fibras', 'Menor capacidad: sube primero lo crítico', e.leo ? 'Listo para usarse' : 'Corte simulado: si no queda camino, el Nodo opera en modo local'], alerta: !e.leo },
    { id: 'cio', p: [842, 66], ico: 'edificio', tono: D, tit: 'Centro Integrado de Operaciones', sub: 'Antofagasta',
      lineas: ['A 145 km de la faena', 'Sala de control de mina y planta, con despacho y análisis', camino ? 'Ve la faena en tiempo real' : 'Sin datos nuevos hasta que vuelva un camino'] },
    { id: 'puerto', p: [1062, 178], ico: 'barco', tono: D, tit: 'Acopio y embarque en Antofagasta', sub: 'Recinto portuario de terceros',
      lineas: ['Acopio de 25.000 t de concentrado', 'Trazabilidad de cada lote hasta el embarque'] },
    { id: 'santiago', p: [245, 46], ico: 'nube', tono: camino ? '#2f7aa8' : '#5b6770', tit: 'Santiago · oficina corporativa y nube', sub: 'Azure Chile Central',
      lineas: ['Oficina corporativa en Las Condes', 'Nube Azure Chile Central, con respaldo en Brazil South', camino ? (e.pendientes > 2 ? `Sincronizando ${e.pendientes} eventos` : 'Recibe los datos de la faena') : 'Sin camino: espera la sincronización'] },
  ];
}

/** Capa de realce: anillo y nombre del lugar activo, sobre el dibujo (no recibe clics). */
export function realceArquitectura(q: PuntoArq | undefined) {
  if (!q) return '';
  const w = q.tit.length * 7.6 + 24, x = Math.min(Math.max(q.p[0] - w / 2, 8), 1192 - w), arriba = q.p[1] > 70, y = arriba ? q.p[1] - 58 : q.p[1] + 30;
  return `<svg viewBox="0 0 1200 780" style="display:block;width:100%;height:auto" aria-hidden="true">`
    + `<circle cx="${q.p[0]}" cy="${q.p[1]}" r="24" fill="none" stroke="#fff" stroke-width="3"/><circle cx="${q.p[0]}" cy="${q.p[1]}" r="29" fill="none" stroke="${CU}" stroke-width="2.5" stroke-dasharray="5 4"/>`
    + `<rect x="${x}" y="${y}" width="${w}" height="26" rx="13" fill="#14191d" fill-opacity=".92" stroke="${CU}" stroke-width="1.5"/>`
    + `<text x="${x + w / 2}" y="${y + 17.5}" text-anchor="middle" font-size="13.5" font-weight="700" fill="#fff" ${F_TIT}>${q.tit}</text></svg>`;
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
    <!-- En pantallas anchas la imagen toma el alto disponible y el detalle va a su derecha; en las angostas, debajo -->
    <div class="flex flex-col min-[1200px]:flex-row bg-cc-p">
    <div class="relative shrink-0 w-full min-[1200px]:w-[min(70%,calc((100dvh_-_400px)_*_1.5385))] min-[1200px]:min-w-[560px] aspect-[1200/780] bg-[#b98f6b] bg-cover bg-center" [style.background-image]="'url(' + fondo + ')'"
      (mouseover)="elegir($event)" (focusin)="elegir($event)" (click)="elegir($event)">
      <div [innerHTML]="svg() | html"></div>
      <div class="absolute inset-0 pointer-events-none" [innerHTML]="realce() | html"></div>
    </div>
    <!-- Detalle del lugar: el texto vive aquí y no sobre el dibujo -->
    <div class="grid content-start gap-3 px-4 py-3 bg-cc-p border-t min-[1200px]:border-t-0 min-[1200px]:border-l border-cc-line min-w-0 flex-1 min-[900px]:max-[1199px]:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
      @if (detalle(); as d) {
        <div aria-live="polite">
          <div class="flex flex-wrap items-center gap-2">
            <h4 class="m-0 font-titulo font-bold text-[1.125rem] text-white">{{ d.tit }}</h4>
            <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold border"
              [class]="d.alerta ? 'border-cc-bad text-[#ff9d93] bg-[#2a1614]' : 'border-cc-line text-cc-mut bg-cc-p2'">
              <i class="size-2 rounded-full" [class]="d.alerta ? 'bg-cc-bad' : 'bg-cc-ok'"></i>{{ d.sub }}</span>
          </div>
          <ul class="mt-2 mb-0 pl-5 text-[0.875rem] text-cc-tx space-y-1 list-disc marker:text-cc-cu">
            @for (l of d.lineas; track l) { <li>{{ l }}</li> }
          </ul>
        </div>
      }
      <div>
        <p class="m-0 mb-1.5 text-xs font-bold uppercase tracking-widest text-cc-mut">Lugares · pasa el cursor o toca</p>
        <div class="flex flex-wrap gap-1.5" role="group" aria-label="Lugares de la arquitectura">
          @for (q of puntos(); track q.id) {
            <button type="button" class="min-h-9 px-2.5 rounded-md border text-[0.8125rem] font-semibold cursor-pointer hover:brightness-125"
              [class]="activo() === q.id ? 'border-cc-cu bg-[#3a2416] text-white' : q.alerta ? 'border-cc-bad text-[#ff9d93] bg-cc-p2' : 'border-cc-line text-cc-tx bg-cc-p2'"
              [attr.aria-pressed]="activo() === q.id" (click)="activo.set(q.id)" (mouseenter)="activo.set(q.id)">{{ q.tit }}</button>
          }
        </div>
      </div>
    </div>
    </div>
    <div class="px-3 py-2 text-[0.8125rem] text-cc-mut bg-cc-p border-t border-cc-line"><b class="text-white">Cómo se lee:</b> el equipo guarda cada evento y lo manda al Nodo de Faena; el Nodo responde a la faena aunque no haya enlace con la nube (hasta 48 h) y sube todo en orden cuando vuelve un camino: fibra A, fibra B o satélite. Vista ilustrada, no a escala.</div>`,
  imports: [HtmlPipe],
})
export class IsoArch {
  private sim = inject(SimService);
  readonly fondo = FONDO_ARQUITECTURA;
  readonly activo = signal('nodo');
  readonly down = computed(() => this.sim.link === 'down');
  readonly pendientes = computed(() => this.sim.pending());
  readonly estado = computed(() => this.down() ? 'Sin camino a la nube · el Nodo de Faena sostiene la operación' : this.pendientes() > 2 ? `Sincronizando ${this.pendientes()} eventos` : 'Todo sincronizado');
  private readonly estadoArq = computed<EstadoArq>(() => ({
    fibA: this.sim.fibA === 'ok', fibB: this.sim.fibB === 'ok', leo: this.sim.leo === 'ok', sombra: this.sim.lte === 'shadow', pendientes: this.pendientes(),
  }));
  readonly svg = computed(() => dibujoArquitectura(this.estadoArq()));
  readonly puntos = computed(() => puntosArquitectura(this.estadoArq()));
  readonly detalle = computed(() => this.puntos().find(q => q.id === this.activo()));
  readonly realce = computed(() => realceArquitectura(this.detalle()));

  /** Marca como activo el lugar bajo el cursor, el que recibe el foco o el que se toca. */
  elegir(ev: Event) {
    const id = (ev.target as Element | null)?.closest?.('[data-id]')?.getAttribute('data-id');
    if (id) this.activo.set(id);
  }
}
