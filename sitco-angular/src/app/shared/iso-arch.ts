import { Component, computed, inject } from '@angular/core';
import { SimService } from '../core/sim.service';
import { HtmlPipe } from './html.pipe';

/* Arquitectura isométrica de tres niveles: equipos en faena → Nodo de Faena → nube. */
type Pt = [number, number];
const iso = (x: number, y: number, z: number, o: Pt): Pt => [o[0] + (x - y) * 0.866, o[1] + (x + y) * 0.5 - z];
const P = (pts: Pt[]) => pts.map(p => p.map(v => v.toFixed(0)).join(',')).join(' ');
function caja(o: Pt, x: number, y: number, z: number, w: number, d: number, h: number, c: string[]) {
  const f = (a: number, b: number, cc: number) => iso(x + a, y + b, z + cc, o);
  const top = [f(0, 0, h), f(w, 0, h), f(w, d, h), f(0, d, h)], L = [f(0, d, h), f(w, d, h), f(w, d, 0), f(0, d, 0)], R = [f(w, 0, h), f(w, d, h), f(w, d, 0), f(w, 0, 0)];
  return `<polygon points="${P(L)}" fill="${c[1]}"/><polygon points="${P(R)}" fill="${c[2]}"/><polygon points="${P(top)}" fill="${c[0]}"/>`;
}
const C_Y = ['#e9b84a', '#c28f22', '#a97a1a'], C_B = ['#5fb6e6', '#3b8fc0', '#2f7aa8'], C_G = ['#58c08a', '#3a9b6a', '#2f8559'], C_D = ['#46535c', '#323d44', '#29333a'], C_W = ['#e8edf0', '#b9c3ca', '#9aa6ae'];

export function dibujoArquitectura(down: boolean, sombra: boolean) {
  const pipe = down ? '#6b7680' : '#4aa3df', pipe2 = down ? '#6b7680' : '#3fbf8f';
  const plat = (o: Pt, c: string[], label: string) => { const f = iso(190, 190, 0, o); return `${caja(o, 0, 0, 0, 190, 190, 10, c)}<text x="${f[0]}" y="${f[1] + 26}" text-anchor="middle" fill="#fff" font-size="15" font-weight="700" font-family="Barlow Semi Condensed,sans-serif" letter-spacing=".06em">${label}</text>`; };
  const O1: Pt = [190, 255], O2: Pt = [445, 205], O3: Pt = [700, 95];
  const faena = plat(O1, C_Y, 'FAENA · EQUIPOS') + caja(O1, 30, 30, 10, 60, 34, 22, C_D) + caja(O1, 40, 35, 32, 30, 22, 16, C_Y) + caja(O1, 110, 50, 10, 44, 24, 16, C_W) + caja(O1, 118, 56, 26, 22, 14, 12, C_Y)
    + caja(O1, 120, 130, 10, 28, 20, 30, C_D) + caja(O1, 30, 120, 10, 6, 6, 60, C_W) + caja(O1, 150, 20, 10, 5, 5, 54, C_W) + caja(O1, 70, 130, 10, 16, 4, 20, ['#6fe0b5', '#3fbf8f', '#2f9e6a']);
  const t = iso(60, 40, 76, O2);
  const borde = plat(O2, C_B, 'NODO DE FAENA') + caja(O2, 30, 30, 10, 20, 20, 44, C_D) + caja(O2, 60, 30, 10, 20, 20, 54, C_D) + caja(O2, 90, 30, 10, 20, 20, 36, C_D) + caja(O2, 40, 100, 10, 60, 8, 40, C_W) + caja(O2, 130, 110, 10, 34, 26, 12, C_D) + `<text x="${t[0]}" y="${t[1] - 6}" fill="#fff" font-size="11" text-anchor="middle">servidor local 48 h</text>`;
  const n = iso(95, 90, 90, O3);
  const nube = plat(O3, C_G, 'NUBE · ANTOFAGASTA') + caja(O3, 30, 40, 10, 50, 10, 56, C_W) + caja(O3, 100, 40, 10, 40, 10, 40, C_W) + caja(O3, 40, 120, 10, 22, 22, 30, C_D) + caja(O3, 70, 120, 10, 22, 22, 46, C_D) + caja(O3, 100, 120, 10, 22, 22, 22, C_D) + `<ellipse cx="${n[0]}" cy="${n[1] - 60}" rx="44" ry="22" fill="#e8edf0" fill-opacity=".92"/><ellipse cx="${n[0] - 26}" cy="${n[1] - 52}" rx="24" ry="16" fill="#e8edf0" fill-opacity=".92"/>`;
  const a1 = iso(190, 95, 10, O1), a2 = iso(0, 95, 10, O2), b1 = iso(190, 95, 10, O2), b2 = iso(0, 95, 10, O3);
  const dash = 'stroke-dasharray="6 8"';
  const tubos = `<path d="M${a1[0]} ${a1[1]} L${a2[0]} ${a2[1]}" stroke="${sombra ? '#f2b84b' : pipe2}" stroke-width="5" fill="none" ${dash}><animate attributeName="stroke-dashoffset" from="0" to="-14" dur="1s" repeatCount="indefinite"/></path><text x="${(a1[0] + a2[0]) / 2}" y="${(a1[1] + a2[1]) / 2 + 30}" fill="#fff" font-size="11" text-anchor="middle">LTE / 5G privada</text>
    <path d="M${b1[0]} ${b1[1]} L${b2[0]} ${b2[1]}" stroke="${pipe}" stroke-width="5" fill="none" ${down ? 'stroke-dasharray="4 10"' : dash}>${down ? '' : '<animate attributeName="stroke-dashoffset" from="0" to="-14" dur="1s" repeatCount="indefinite"/>'}</path><text x="${(b1[0] + b2[0]) / 2}" y="${(b1[1] + b2[1]) / 2 + 34}" fill="#fff" font-size="11" text-anchor="middle">fibra / enlace satelital</text>${down ? `<g transform="translate(${(b1[0] + b2[0]) / 2} ${(b1[1] + b2[1]) / 2})"><circle r="14" fill="#ff6b5e"/><path d="M-6-6l12 12M6-6l-12 12" stroke="#fff" stroke-width="3"/></g>` : ''}`;
  return `<svg viewBox="0 0 900 500" style="display:block;width:100%;height:auto;background:#23272b" role="img" aria-label="Tres plataformas: faena y equipos, Nodo de Faena con servidor local, y nube en Santiago"><g>${nube}${borde}${faena}${tubos}</g></svg>`;
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
    </div>
    <div [innerHTML]="svg() | html"></div>
    <div class="px-3 py-2 text-[0.8125rem] text-cc-mut bg-cc-p border-t border-cc-line"><b class="text-white">Cómo se lee:</b> el equipo guarda cada evento y lo manda al Nodo de Faena; el Nodo responde a la faena aunque no haya enlace con la nube (hasta 48 h) y sube todo en orden cuando vuelve un camino.</div>`,
  imports: [HtmlPipe],
})
export class IsoArch {
  private sim = inject(SimService);
  readonly down = computed(() => this.sim.link === 'down');
  readonly pendientes = computed(() => this.sim.pending());
  readonly estado = computed(() => this.down() ? 'Sin camino a la nube · el Nodo de Faena sostiene la operación' : this.pendientes() > 2 ? `Sincronizando ${this.pendientes()} eventos` : 'Todo sincronizado');
  readonly svg = computed(() => dibujoArquitectura(this.down(), this.sim.lte === 'shadow'));
}
