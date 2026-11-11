import { Component } from '@angular/core';
import { rng } from '../core/util';
import { HtmlPipe } from './html.pipe';

/** Ilustración vectorial del rajo (imagen corporativa del ingreso). */
function dibujo() {
  const r = rng(9);
  const cols = ['#5b3a26', '#6e4630', '#80523a', '#93603f', '#a56c45', '#b9794b', '#c98857'];
  let bancos = '';
  for (let k = 0; k < 7; k++) {
    const y = 470 + k * 52, w = 900 - k * 120, x0 = 400 - w / 2, pts: string[] = [];
    for (let i = 0; i <= 16; i++) pts.push(`${Math.round(x0 + w * i / 16)},${Math.round(y + (r() - .5) * 14)}`);
    bancos += `<polygon points="${pts.join(' ')} ${Math.round(x0 + w)},900 ${Math.round(x0)},900" fill="${cols[k]}"/><polyline points="${pts.join(' ')}" fill="none" stroke="#e9c9a8" stroke-opacity=".35" stroke-width="2"/>`;
  }
  const camion = (x: number, y: number, sc: number) => `<g transform="translate(${x} ${y}) scale(${sc})" fill="#1b2229"><path d="M0 8h34v14H0z"/><path d="M34 12h14l7 8v4H34z"/><circle cx="10" cy="26" r="6"/><circle cx="44" cy="26" r="6"/></g>`;
  return `<svg class="absolute inset-0 size-full" viewBox="0 0 800 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="hsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#15202a"/><stop offset=".55" stop-color="#5a3a33"/><stop offset="1" stop-color="#d98b4f"/></linearGradient><radialGradient id="hsun" cx=".72" cy=".52" r=".35"><stop offset="0" stop-color="#ffd9a0" stop-opacity=".9"/><stop offset="1" stop-color="#ffd9a0" stop-opacity="0"/></radialGradient></defs>
  <rect width="800" height="900" fill="url(#hsky)"/><rect width="800" height="900" fill="url(#hsun)"/>
  <polygon points="0,470 90,400 190,440 300,370 420,430 540,380 660,430 800,390 800,520 0,520" fill="#2a2f38"/>${bancos}
  <polyline points="120,900 260,780 470,740 330,690 560,650 430,610 600,570" fill="none" stroke="#2a1b14" stroke-width="16" stroke-linejoin="round" stroke-linecap="round"/><polyline points="120,900 260,780 470,740 330,690 560,650 430,610 600,570" fill="none" stroke="#d9a275" stroke-width="2.5" stroke-dasharray="10 12"/>
  ${camion(300, 764, .9)}${camion(420, 666, .7)}${camion(505, 620, .55)}${camion(470, 584, .45)}</svg>`;
}
const SVG = dibujo();

@Component({
  selector: 'app-hero-pit',
  host: { class: 'contents' },
  template: `<div class="contents" [innerHTML]="svg | html"></div>`,
  imports: [HtmlPipe],
})
export class HeroPit {
  readonly svg = SVG;
}

/** Sello de la compañía. */
@Component({
  selector: 'app-brand-lock',
  host: { class: 'flex items-center gap-3.5 mb-4' },
  template: `
    <span class="grid place-items-center size-14 rounded-[10px] bg-cobre text-white font-titulo font-bold text-[1.625rem] shadow-[0_0_0_3px_rgba(255,255,255,.18)]" aria-hidden="true">AA</span>
    <div><strong class="block font-titulo font-bold text-[1.1875rem] text-white">Compañía Minera Altos de Aranda S.A.</strong><span class="block text-[0.8125rem] text-acero-l">Región de Antofagasta · Chile</span></div>`,
})
export class BrandLock {}
