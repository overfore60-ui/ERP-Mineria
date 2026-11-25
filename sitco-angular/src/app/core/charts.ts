/* Gráficos SVG livianos (barras, líneas, área, anillo, apilado, dispersión, calor, medidor, chispa).
   Cada función devuelve el SVG como texto; se muestra con el componente <app-chart>. */
import { esc, nd, nf } from './util';

export const PAL = ['#1E2B35', '#9C4A1F', '#1F7A5C', '#6C8294', '#8A6A3E', '#7E3A16'];
type Fmt = (v: number) => string;
interface M { l: number; r: number; t: number; b: number }

const niceMax = (m: number) => {
  if (m <= 0) return 1;
  const p = Math.pow(10, Math.floor(Math.log10(m))), f = m / p;
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * p;
};
const svgW = (w: number, h: number, label: string, inner: string, style = '') =>
  `<svg class="chart" ${style ? `style="${style}"` : ''} viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(label)}" preserveAspectRatio="xMidYMid meet">${inner}</svg>`;
const axes = (w: number, h: number, m: M, max: number, fmt: Fmt, ticks = 4) => {
  let s = '';
  for (let i = 0; i <= ticks; i++) {
    const y = m.t + (h - m.t - m.b) * (1 - i / ticks);
    s += `<line class="gl" x1="${m.l}" x2="${w - m.r}" y1="${y}" y2="${y}"/><text x="${m.l - 6}" y="${y + 4}" text-anchor="end">${fmt(max * i / ticks)}</text>`;
  }
  return s;
};
const fmt1: Fmt = v => nf(Math.round(v * 10) / 10);

export function bar(o: { values: number[]; labels: string[]; w?: number; h?: number; fmt?: Fmt; max?: number; colors?: string[]; color?: string; drill?: (i: number) => string; target?: number; targetLabel?: string; label?: string }) {
  const w = o.w || 520, h = o.h || 240, m = { l: 44, r: 8, t: 16, b: 38 }, fmt = o.fmt || fmt1;
  const max = niceMax(o.max || Math.max(...o.values) * 1.08), n = o.values.length, bw = (w - m.l - m.r) / n, y0 = h - m.b;
  let s = axes(w, h, m, max, fmt) + `<line class="ax" x1="${m.l}" x2="${w - m.r}" y1="${y0}" y2="${y0}"/>`;
  o.values.forEach((v, i) => {
    const bh = (h - m.t - m.b) * v / max, x = m.l + i * bw + bw * .18, col = (o.colors && o.colors[i]) || o.color || PAL[1];
    s += `<rect x="${x}" y="${y0 - bh}" width="${bw * .64}" height="${bh}" rx="3" fill="${col}"><title>${esc(o.labels[i])}: ${fmt(v)}</title></rect><text x="${x + bw * .32}" y="${y0 - bh - 4}" text-anchor="middle" style="fill:var(--color-pizarra);font-weight:600">${fmt(v)}</text><text x="${x + bw * .32}" y="${h - 18}" text-anchor="middle">${esc(o.labels[i])}</text>`;
    // Zona de clic: toda la columna. Es solo para puntero; con teclado se usa el enlace bajo el gráfico.
    if (o.drill) s += `<rect class="hit" x="${m.l + i * bw}" y="${m.t}" width="${bw}" height="${y0 - m.t + 22}" fill="transparent" ${o.drill(i)}><title>${esc(o.labels[i])}: ${fmt(v)}</title></rect>`;
  });
  if (o.target != null) {
    const ty = y0 - (h - m.t - m.b) * o.target / max;
    s += `<line x1="${m.l}" x2="${w - m.r}" y1="${ty}" y2="${ty}" stroke="#1F7A5C" stroke-width="2" stroke-dasharray="6 4"/><text x="${w - m.r}" y="${ty - 5}" text-anchor="end" style="fill:#1F7A5C;font-weight:600">${esc(o.targetLabel || 'Meta')}</text>`;
  }
  return svgW(w, h, o.label || 'Gráfico de barras', s);
}

export function hbar(o: { values: number[]; labels: string[]; w?: number; ml?: number; fmt?: Fmt; colors?: string[]; color?: string; label?: string }) {
  const w = o.w || 520, rowH = 34, h = o.values.length * rowH + 20, m = { l: o.ml || 150, r: 50 }, max = niceMax(Math.max(...o.values) * 1.05), fmt = o.fmt || nf;
  let s = '';
  o.values.forEach((v, i) => {
    const y = 8 + i * rowH, bw = (w - m.l - m.r) * v / max;
    s += `<text x="${m.l - 8}" y="${y + 17}" text-anchor="end" style="fill:var(--color-pizarra)">${esc(o.labels[i])}</text><rect x="${m.l}" y="${y + 4}" width="${bw}" height="20" rx="3" fill="${(o.colors && o.colors[i]) || o.color || PAL[1]}"><title>${esc(o.labels[i])}: ${fmt(v)}</title></rect><text x="${m.l + bw + 6}" y="${y + 19}" style="fill:var(--color-pizarra);font-weight:600">${fmt(v)}</text>`;
  });
  return svgW(w, h, o.label || 'Gráfico de barras horizontales', s);
}

export interface Serie { name: string; values: number[]; color?: string; dash?: boolean }
export function line(o: { series: Serie[]; labels: string[]; w?: number; h?: number; fmt?: Fmt; min?: number; max?: number; area?: boolean; ref?: number; refLabel?: string; label?: string }) {
  const w = o.w || 560, h = o.h || 240, m = { l: 44, r: 12, t: 14, b: 34 }, fmt = o.fmt || fmt1;
  const all = o.series.flatMap(s => s.values), lo = o.min ?? 0, max = o.max ?? niceMax(Math.max(...all) * 1.08), n = o.labels.length;
  const X = (i: number) => m.l + (w - m.l - m.r) * (n === 1 ? .5 : i / (n - 1));
  const Y = (v: number) => h - m.b - (h - m.t - m.b) * (v - lo) / (max - lo || 1);
  let s = '';
  for (let i = 0; i <= 4; i++) { const v = lo + (max - lo) * i / 4, y = Y(v); s += `<line class="gl" x1="${m.l}" x2="${w - m.r}" y1="${y}" y2="${y}"/><text x="${m.l - 6}" y="${y + 4}" text-anchor="end">${fmt(v)}</text>`; }
  const step = Math.ceil(n / 8);
  o.labels.forEach((l, i) => { if (i % step === 0 || i === n - 1) s += `<text x="${X(i)}" y="${h - 12}" text-anchor="middle">${esc(l)}</text>`; });
  o.series.forEach((se, k) => {
    const col = se.color || PAL[(k + 1) % PAL.length], pts = se.values.map((v, i) => `${X(i)},${Y(v)}`).join(' ');
    if (o.area) s += `<polygon points="${X(0)},${Y(lo)} ${pts} ${X(n - 1)},${Y(lo)}" fill="${col}" opacity=".16"/>`;
    s += `<polyline points="${pts}" fill="none" stroke="${col}" stroke-width="2.6" ${se.dash ? 'stroke-dasharray="7 5"' : ''} stroke-linejoin="round"/>`;
    if (n <= 16) se.values.forEach((v, i) => (s += `<circle cx="${X(i)}" cy="${Y(v)}" r="3.5" fill="#fff" stroke="${col}" stroke-width="2"><title>${esc(se.name)} · ${esc(o.labels[i])}: ${fmt(v)}</title></circle>`));
  });
  if (o.ref != null) s += `<line x1="${m.l}" x2="${w - m.r}" y1="${Y(o.ref)}" y2="${Y(o.ref)}" stroke="#1F7A5C" stroke-width="2" stroke-dasharray="6 4"/><text x="${w - m.r}" y="${Y(o.ref) - 5}" text-anchor="end" style="fill:#1F7A5C;font-weight:600">${esc(o.refLabel || 'Meta')}</text>`;
  return svgW(w, h, o.label || 'Gráfico de líneas', s);
}

export function stack(o: { series: Serie[]; labels: string[]; w?: number; h?: number; fmt?: Fmt; label?: string }) {
  const w = o.w || 520, h = o.h || 250, m = { l: 44, r: 8, t: 14, b: 34 }, fmt = o.fmt || nf, n = o.labels.length;
  const tot = o.labels.map((_, i) => o.series.reduce((a, s) => a + s.values[i], 0)), max = niceMax(Math.max(...tot) * 1.05), bw = (w - m.l - m.r) / n, y0 = h - m.b;
  let s = axes(w, h, m, max, fmt) + `<line class="ax" x1="${m.l}" x2="${w - m.r}" y1="${y0}" y2="${y0}"/>`;
  o.labels.forEach((l, i) => {
    let acc = 0;
    o.series.forEach((se, k) => {
      const v = se.values[i], bh = (h - m.t - m.b) * v / max;
      s += `<rect x="${m.l + i * bw + bw * .18}" y="${y0 - (h - m.t - m.b) * acc / max - bh}" width="${bw * .64}" height="${bh}" fill="${se.color || PAL[k % PAL.length]}"><title>${esc(se.name)} · ${esc(l)}: ${fmt(v)}</title></rect>`;
      acc += v;
    });
    s += `<text x="${m.l + i * bw + bw / 2}" y="${h - 14}" text-anchor="middle">${esc(l)}</text>`;
  });
  return svgW(w, h, o.label || 'Gráfico de barras apiladas', s);
}

export function donut(o: { items: { label: string; value: number; color?: string }[]; big?: string; small?: string; label?: string }) {
  const cx = 130, cy = 130, R = 100, r = 62, tot = o.items.reduce((a, x) => a + x.value, 0);
  let a0 = -Math.PI / 2, s = '';
  const p = (rr: number, a: number) => `${cx + rr * Math.cos(a)},${cy + rr * Math.sin(a)}`;
  o.items.forEach((x, i) => {
    const a1 = a0 + 2 * Math.PI * x.value / tot, lg = a1 - a0 > Math.PI ? 1 : 0, c = x.color || PAL[i % PAL.length];
    s += `<path d="M${p(R, a0)} A${R},${R} 0 ${lg} 1 ${p(R, a1 - .0001)} L${p(r, a1 - .0001)} A${r},${r} 0 ${lg} 0 ${p(r, a0)}Z" fill="${c}" stroke="#fff" stroke-width="2"><title>${esc(x.label)}: ${nf(x.value)} (${nd(x.value / tot * 100, 1)} %)</title></path>`;
    a0 = a1;
  });
  s += `<text x="${cx}" y="${cy - 2}" text-anchor="middle" style="font:700 28px var(--font-titulo);fill:var(--color-pizarra)">${esc(o.big || nf(tot))}</text><text x="${cx}" y="${cy + 18}" text-anchor="middle">${esc(o.small || '')}</text>`;
  return svgW(260, 260, o.label || 'Gráfico circular', s, 'max-width:260px;margin:auto');
}

export function scatter(o: { points: { x: number; y: number; l?: string }[]; xl?: string; yl?: string; w?: number; h?: number; label?: string }) {
  const w = o.w || 520, h = o.h || 250, m = { l: 48, r: 12, t: 12, b: 40 }, xs = o.points.map(p => p.x), ys = o.points.map(p => p.y);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const X = (v: number) => m.l + (w - m.l - m.r) * (v - x0) / (x1 - x0 || 1), Y = (v: number) => h - m.b - (h - m.t - m.b) * (v - y0) / (y1 - y0 || 1);
  let s = '';
  for (let i = 0; i <= 4; i++) {
    const v = y0 + (y1 - y0) * i / 4;
    s += `<line class="gl" x1="${m.l}" x2="${w - m.r}" y1="${Y(v)}" y2="${Y(v)}"/><text x="${m.l - 6}" y="${Y(v) + 4}" text-anchor="end">${nd(v, 1)}</text>`;
    const xv = x0 + (x1 - x0) * i / 4;
    s += `<text x="${X(xv)}" y="${h - 22}" text-anchor="middle">${nd(xv, 2)}</text>`;
  }
  o.points.forEach(p => (s += `<circle cx="${X(p.x)}" cy="${Y(p.y)}" r="5.5" fill="${PAL[1]}" fill-opacity=".72" stroke="#fff"><title>${esc(p.l || '')} · ${o.xl}: ${nd(p.x, 2)} · ${o.yl}: ${nd(p.y, 1)}</title></circle>`));
  s += `<text x="${(w + m.l) / 2}" y="${h - 4}" text-anchor="middle">${esc(o.xl || '')}</text><text transform="translate(12 ${h / 2}) rotate(-90)" text-anchor="middle">${esc(o.yl || '')}</text>`;
  return svgW(w, h, o.label || 'Gráfico de dispersión', s);
}

export function heat(o: { rows: string[]; cols: string[]; values: number[][]; w?: number; skip?: number; unit?: string; label?: string }) {
  const w = o.w || 560, cw = (w - 56) / o.cols.length, ch = 28, h = o.rows.length * ch + 28, mx = Math.max(...o.values.flat());
  let s = '';
  o.cols.forEach((c, j) => { if (j % (o.skip || 1) === 0) s += `<text x="${56 + j * cw + cw / 2}" y="12" text-anchor="middle">${esc(c)}</text>`; });
  o.rows.forEach((r, i) => {
    s += `<text x="50" y="${28 + i * ch + 18}" text-anchor="end">${esc(r)}</text>`;
    o.values[i].forEach((v, j) => {
      const t = v / (mx || 1);
      s += `<rect x="${56 + j * cw + 1}" y="${24 + i * ch + 1}" width="${cw - 2}" height="${ch - 2}" rx="3" fill="rgb(${Math.round(245 - t * 89)},${Math.round(240 - t * 166)},${Math.round(232 - t * 201)})"><title>${esc(r)} · ${esc(o.cols[j])}: ${nd(v, 1)} ${o.unit || ''}</title></rect>`;
    });
  });
  return svgW(w, h, o.label || 'Mapa de calor', s);
}

export function gauge(o: { value: number; max: number; target?: number; good?: boolean; text?: string; sub?: string; label?: string }) {
  const cx = 130, cy = 130, R = 100, p = Math.min(1, o.value / o.max), a = Math.PI * (1 - p);
  const pt = (rr: number, aa: number) => `${cx + rr * Math.cos(aa)},${cy - rr * Math.sin(aa)}`, col = o.good === false ? '#A32020' : '#1F7A5C';
  let s = `<path d="M${pt(R, Math.PI)} A${R},${R} 0 0 1 ${pt(R, 0)}" fill="none" stroke="#DCE2E6" stroke-width="20" stroke-linecap="round"/><path d="M${pt(R, Math.PI)} A${R},${R} 0 0 1 ${pt(R, a)}" fill="none" stroke="${col}" stroke-width="20" stroke-linecap="round"/>`;
  if (o.target != null) {
    const ta = Math.PI * (1 - o.target / o.max);
    s += `<line x1="${cx + (R - 16) * Math.cos(ta)}" y1="${cy - (R - 16) * Math.sin(ta)}" x2="${cx + (R + 14) * Math.cos(ta)}" y2="${cy - (R + 14) * Math.sin(ta)}" stroke="#1E2B35" stroke-width="3"/>`;
  }
  s += `<text x="${cx}" y="${cy - 14}" text-anchor="middle" style="font:700 34px var(--font-titulo);fill:var(--color-pizarra)">${esc(o.text || nd(o.value, 0))}</text><text x="${cx}" y="${cy + 10}" text-anchor="middle">${esc(o.sub || '')}</text>`;
  return svgW(260, 160, o.label || 'Medidor', s, 'max-width:260px;margin:auto');
}

export function spark(v: number[], col = PAL[1], w = 120, h = 34) {
  const mn = Math.min(...v), mx = Math.max(...v), X = (i: number) => 2 + (w - 4) * i / (v.length - 1), Y = (x: number) => h - 3 - (h - 6) * (x - mn) / (mx - mn || 1);
  return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="Tendencia"><polyline points="${v.map((x, i) => X(i) + ',' + Y(x)).join(' ')}" fill="none" stroke="${col}" stroke-width="2.2"/></svg>`;
}
