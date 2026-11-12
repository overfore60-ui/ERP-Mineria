/* =====================================================================
   Fondo de la vista de Arquitectura (public/img/arquitectura-faena.webp):
   vista aérea ilustrada de la faena Aranda hasta Antofagasta, dibujada con
   SVG (ruido fractal, relieve con luz y bordes desplazados).
   Se exporta una sola vez, porque los filtros son pesados para el navegador:
     1. node herramientas/fondo-arquitectura.mjs > fondo.svg
     2. Abrir fondo.svg en Chromium a 1200 x 780 con escala 2 y capturar.
     3. Reducir la captura a 2000 x 1300 y guardarla en WebP (calidad 80).
   Todo es ficticio y esquemático; no es una foto ni un mapa.
   Lienzo: 1200 x 780, las mismas coordenadas que usa shared/iso-arch.ts.
   ===================================================================== */
const W = 1200, H = 780;
let semilla = 7;
const rnd = () => { semilla = (semilla * 16807) % 2147483647; return (semilla - 1) / 2147483646; };
const P = l => l.map(p => p.map(v => v.toFixed(1)).join(',')).join(' ');

/** Contorno irregular alrededor de un centro (para manchas, botaderos, relaves). */
function mancha(cx, cy, rx, ry, irregular = .18, n = 36, giro = 0) {
  const pts = [];
  const f1 = rnd() * 6, f2 = rnd() * 6;
  for (let i = 0; i < n; i++) {
    const a = i / n * Math.PI * 2 + giro;
    const k = 1 + irregular * (Math.sin(a * 3 + f1) * .6 + Math.sin(a * 5 + f2) * .4) + (rnd() - .5) * irregular * .4;
    pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]);
  }
  return pts;
}

let s = '';
const defs = `
<defs>
  <linearGradient id="g-suelo" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#cfae8e"/><stop offset=".35" stop-color="#c29a76"/><stop offset=".7" stop-color="#b98f6b"/><stop offset="1" stop-color="#ad8363"/>
  </linearGradient>
  <linearGradient id="g-mar" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#2d6f93"/><stop offset=".6" stop-color="#3f8fae"/><stop offset="1" stop-color="#76b9c6"/>
  </linearGradient>
  <linearGradient id="g-bruma" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#e9eef2" stop-opacity=".85"/><stop offset=".18" stop-color="#eef0ee" stop-opacity=".45"/><stop offset=".42" stop-color="#f3ede4" stop-opacity="0"/>
  </linearGradient>
  <radialGradient id="g-vineta" cx=".5" cy=".55" r=".75">
    <stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#2b1a10" stop-opacity=".35"/>
  </radialGradient>
  <linearGradient id="g-luzrajo" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#1d1209" stop-opacity=".45"/><stop offset=".55" stop-color="#1d1209" stop-opacity="0"/><stop offset="1" stop-color="#fff6e8" stop-opacity=".22"/>
  </linearGradient>

  <!-- Relieve: la altura sale de las cordilleras difuminadas más ruido fractal -->
  <filter id="f-relieve" x="0" y="0" width="${W}" height="${H}" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
    <feGaussianBlur in="SourceAlpha" stdDeviation="38" result="cerros"/>
    <feTurbulence type="fractalNoise" baseFrequency=".007 .011" numOctaves="8" seed="11" result="ruido"/>
    <feComposite in="cerros" in2="ruido" operator="arithmetic" k1="1.5" k3=".22" result="altura"/>
    <feDiffuseLighting in="altura" surfaceScale="70" diffuseConstant="1.3" lighting-color="#fff4e6" result="luz">
      <feDistantLight azimuth="215" elevation="42"/>
    </feDiffuseLighting>
    <feComposite in="luz" operator="arithmetic" k2=".78" k4=".25"/>
  </filter>
  <!-- Textura fina del suelo (grava y huellas) -->
  <filter id="f-grano" x="0" y="0" width="${W}" height="${H}" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
    <feTurbulence type="fractalNoise" baseFrequency=".55" numOctaves="2" seed="4" result="g"/>
    <feColorMatrix in="g" type="matrix" values="0 0 0 0 .35  0 0 0 0 .24  0 0 0 0 .16  0 0 0 -1.4 .95"/>
  </filter>
  <filter id="f-manchas" x="0" y="0" width="${W}" height="${H}" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
    <feTurbulence type="fractalNoise" baseFrequency=".012 .02" numOctaves="4" seed="21" result="m"/>
    <feColorMatrix in="m" type="matrix" values="0 0 0 0 .42  0 0 0 0 .3  0 0 0 0 .22  0 0 0 -2.2 1.25"/>
  </filter>
  <!-- Bordes naturales para rajo, botaderos y relaves -->
  <filter id="f-borde" x="-10%" y="-10%" width="120%" height="120%">
    <feTurbulence type="fractalNoise" baseFrequency=".045" numOctaves="3" seed="3" result="t"/>
    <feDisplacementMap in="SourceGraphic" in2="t" scale="9" xChannelSelector="R" yChannelSelector="G"/>
  </filter>
  <filter id="f-borde2" x="-10%" y="-10%" width="120%" height="120%">
    <feTurbulence type="fractalNoise" baseFrequency=".09" numOctaves="2" seed="8" result="t"/>
    <feDisplacementMap in="SourceGraphic" in2="t" scale="4" xChannelSelector="R" yChannelSelector="G"/>
  </filter>
  <filter id="f-pad" x="-20%" y="-30%" width="140%" height="160%"><feGaussianBlur stdDeviation="9"/></filter>
  <filter id="f-pitluz" x="0" y="0" width="${W}" height="${H}" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
    <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  1 0 0 0 0" result="alt"/>
    <feGaussianBlur in="alt" stdDeviation="1.3" result="altb"/>
    <feTurbulence type="fractalNoise" baseFrequency=".09" numOctaves="3" seed="17" result="rug"/>
    <feComposite in="altb" in2="rug" operator="arithmetic" k2="1" k3=".07" result="h"/>
    <feDiffuseLighting in="h" surfaceScale="34" diffuseConstant="1.25" lighting-color="#fff6ea" result="luz"><feDistantLight azimuth="215" elevation="46"/></feDiffuseLighting>
    <feComposite in="luz" operator="arithmetic" k2=".85" k4=".2" result="luzs"/>
    <feComposite in="luzs" in2="SourceAlpha" operator="in"/>
  </filter>
  <filter id="f-pitgrano" x="0" y="0" width="${W}" height="${H}" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
    <feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="2" seed="9" result="g"/>
    <feColorMatrix in="g" type="matrix" values="0 0 0 0 .25  0 0 0 0 .18  0 0 0 0 .12  0 0 0 -1.6 1.05" result="gg"/>
    <feComposite in="gg" in2="SourceAlpha" operator="in"/>
  </filter>
  <filter id="f-sombra" x="-20%" y="-20%" width="140%" height="160%"><feGaussianBlur stdDeviation="2.2"/></filter>
  <filter id="f-olas" x="0" y="0" width="${W}" height="${H}" filterUnits="userSpaceOnUse">
    <feTurbulence type="turbulence" baseFrequency=".02 .09" numOctaves="2" seed="5" result="o"/>
    <feColorMatrix in="o" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 -.9 .45"/>
  </filter>
  <clipPath id="c-mar"><path d="M640 0H1200V250C1170 236 1150 214 1128 196S1080 176 1052 160S1008 120 990 96S950 58 920 42S860 20 820 12S700 4 640 0Z"/></clipPath>
</defs>`;

/* --- 1. Suelo del desierto --- */
s += `<rect width="${W}" height="${H}" fill="url(#g-suelo)"/>`;
s += `<rect width="${W}" height="${H}" filter="url(#f-manchas)" opacity=".55"/>`;

/* --- 6. Botaderos de estéril (montones grises de techo plano) --- */
function botadero(cx, cy, rx, ry, capas = 4) {
  let o = `<g filter="url(#f-borde)">`;
  for (let k = 0; k < capas; k++) {
    const f = 1 - k * .16, c = ['#8f857a', '#9c9186', '#a69a8e', '#b0a497', '#b9ad9f'][k];
    o += `<polygon points="${P(mancha(cx + k * 3, cy - k * 4, rx * f, ry * f, .16, 34))}" fill="${c}"/>`;
    o += `<polygon points="${P(mancha(cx + k * 3, cy - k * 4, rx * f, ry * f, .16, 34))}" fill="none" stroke="#c7bcae" stroke-width="1.2" stroke-opacity=".6"/>`;
  }
  return o + `</g>`;
}
s += `<polygon points="${P(mancha(140, 720, 200, 95, .15, 30))}" fill="#3a2a1d" opacity=".25" filter="url(#f-sombra)" transform="translate(8 8)"/>` + botadero(140, 715, 195, 90);
s += `<polygon points="${P(mancha(1080, 705, 180, 85, .15, 30))}" fill="#3a2a1d" opacity=".25" filter="url(#f-sombra)" transform="translate(8 8)"/>` + botadero(1080, 700, 175, 82);

/* --- 2. Relieve: cordillera de la Costa, cerros del interior y lomas --- */
const cordilleras = [
  mancha(250, 150, 330, 95, .3, 40), mancha(560, 120, 160, 70, .3, 30), mancha(120, 330, 170, 70, .35, 30),
  mancha(1090, 330, 150, 85, .3, 30), mancha(1000, 245, 120, 50, .3, 26), mancha(470, 300, 110, 45, .35, 26),
  mancha(60, 520, 90, 60, .3, 24), mancha(1170, 520, 70, 70, .3, 24),
  mancha(140, 712, 150, 60, .2, 26), mancha(1080, 698, 140, 56, .2, 26),
];
s += `<g filter="url(#f-relieve)" style="mix-blend-mode:multiply">${cordilleras.map(c => `<polygon points="${P(c)}" fill="#fff"/>`).join('')}<rect width="${W}" height="${H}" fill="#fff" fill-opacity="0"/></g>`;

/* --- 3. Mar, costa y Antofagasta --- */
s += `<g clip-path="url(#c-mar)"><rect width="${W}" height="${H}" fill="url(#g-mar)"/><rect width="${W}" height="${H}" filter="url(#f-olas)" opacity=".22"/></g>`;
s += `<path d="M640 0C700 4 760 4 820 12S900 26 920 42S970 74 990 96S1020 140 1052 160S1106 178 1128 196S1170 236 1200 250" fill="none" stroke="#f4efe2" stroke-width="5" stroke-opacity=".8"/>`;
s += `<path d="M640 0C700 4 760 4 820 12S900 26 920 42S970 74 990 96S1020 140 1052 160S1106 178 1128 196S1170 236 1200 250" fill="none" stroke="#9fd3d9" stroke-width="12" stroke-opacity=".35" transform="translate(5 -4)"/>`;
// ciudad: franja angosta entre los cerros y el mar
let ciudad = '';
for (let i = 0; i < 520; i++) {
  const t = rnd(), x = 690 + t * 470 + (rnd() - .5) * 30;
  const yCosta = 6 + t * 200 + Math.sin(t * 5) * 8;
  const y = yCosta + 10 + rnd() * 42;
  const w = 3 + rnd() * 7, h = 2.5 + rnd() * 5;
  const c = ['#e9e4da', '#d8d0c3', '#c9bfae', '#f3f1ec', '#b8ae9f', '#9ea3a6'][Math.floor(rnd() * 6)];
  ciudad += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" fill="${c}" transform="rotate(${(30 + t * 12).toFixed(0)} ${x.toFixed(0)} ${y.toFixed(0)})"/>`;
}
s += `<g opacity=".95">${ciudad}</g>`;
// calles de la ciudad
for (let i = 0; i < 9; i++) { const t = i / 9; s += `<path d="M${700 + t * 460} ${18 + t * 198} l -36 36" stroke="#efe8dc" stroke-width="1.2" stroke-opacity=".7"/>`; }
// puerto: muelles, acopio de concentrado y nave
s += `<path d="M1062 168 L1102 138 L1108 144 L1070 175Z" fill="#9aa0a3"/><path d="M1086 182 L1126 156 L1131 162 L1093 189Z" fill="#9aa0a3"/>`;
s += `<rect x="1046" y="176" width="34" height="18" fill="#c5c2bb" transform="rotate(35 1046 176)"/><ellipse cx="1058" cy="190" rx="13" ry="6" fill="#4b3f36" transform="rotate(35 1058 190)"/>`;
s += `<g transform="translate(1128 128) rotate(-37)"><path d="M-30 -5h52l8 5l-8 5h-52z" fill="#7b2f25"/><rect x="-24" y="-3.5" width="34" height="7" fill="#d9d4cb"/><rect x="12" y="-4" width="7" height="8" fill="#f3f1ec"/></g>`;

/* --- 4. Camino: Ruta 25 y camino privado de la faena a Antofagasta --- */
const ruta = 'M610 470 C 640 430, 700 420, 700 380 S 640 330, 690 290 S 800 260, 790 220 S 760 170, 830 140 S 900 110, 930 92';
s += `<path d="${ruta}" fill="none" stroke="#8d6f58" stroke-width="9" stroke-linecap="round" filter="url(#f-borde2)" opacity=".8"/><path d="${ruta}" fill="none" stroke="#e4d3bd" stroke-width="5" stroke-linecap="round" filter="url(#f-borde2)"/>`;
// caminos interiores de la faena
const internos = ['M610 470 C 560 480, 480 500, 420 520', 'M610 470 C 660 490, 700 500, 740 512', 'M760 520 C 840 520, 900 480, 940 450', 'M560 560 C 590 600, 600 630, 600 650', 'M420 520 C 300 520, 230 560, 200 620', 'M760 560 C 840 600, 900 640, 960 660'];
internos.forEach(d => s += `<path d="${d}" fill="none" stroke="#e1cfb8" stroke-width="3.4" stroke-linecap="round" filter="url(#f-borde2)" opacity=".9"/>`);

/* --- 5. Depósito de relaves --- */
const rel = mancha(1035, 440, 135, 62, .2, 40, .3);
s += `<g filter="url(#f-borde)"><polygon points="${P(rel)}" fill="#cfd2c9"/><polygon points="${P(mancha(1040, 442, 112, 48, .22, 36, .3))}" fill="#b9c1b8"/><polygon points="${P(mancha(1062, 446, 70, 28, .3, 30, .3))}" fill="#93aaa6"/><polygon points="${P(mancha(1070, 448, 30, 12, .3, 24))}" fill="#6f9294"/></g>`;
s += `<path d="M915 470 C 960 505, 1080 515, 1160 470" fill="none" stroke="#a5917b" stroke-width="7" filter="url(#f-borde2)"/><path d="M915 466 C 960 500, 1080 510, 1160 466" fill="none" stroke="#e6dccb" stroke-width="2"/>`;
s += `<path d="M830 520 C 870 500, 900 480, 930 468" stroke="#6a6a68" stroke-width="2" stroke-dasharray="5 3" fill="none"/>`;

/* --- 7. Rajo Aranda: bancos escalonados con luz propia, rampa, fondo y equipos ---
   La altura de cada banco se dibuja en gris (más claro = más alto) y un filtro
   la convierte en relieve iluminado; encima va el color de la roca y la rampa. */
const RC = [560, 650], RX = 312, RY = 150, N = 17, BAJA = 5.6;
const borde = mancha(RC[0], RC[1], RX * 1.05, RY * 1.07, .045, 72);
const anillos = [];
for (let k = 0; k < N; k++) {
  const f = 1 - k / (N + .8), g = k * .41;
  anillos.push(mancha(RC[0] + k * 1.6, RC[1] + k * BAJA, RX * f, RY * f, .035 + k * .002, 88, g));
}
const fondoPit = mancha(RC[0] + N * 1.6, RC[1] + N * BAJA + 3, RX * .13, RY * .1, .18, 30);
// a) altura escalonada
let alto = `<polygon points="${P(borde)}" fill="#fff"/>`;
anillos.forEach((a, k) => alto += `<polygon points="${P(a)}" fill="${(() => { const v = Math.round(250 - (k + 1) * (230 / N)); return `rgb(${v},${v},${v})`; })()}"/>`);
alto += `<polygon points="${P(fondoPit)}" fill="#0c0c0c"/>`;
// b) color de la roca: bandas de alteración (gris, ocre, rojizo) que se oscurecen con la profundidad
const ROCA = ['#b39c84', '#a68d76', '#b8a089', '#9b8473', '#ad8a70', '#a09488', '#b49478', '#968779'];
let color = `<polygon points="${P(borde)}" fill="#ab937b"/>`;
anillos.forEach((a, k) => {
  const c = ROCA[(k * 3 + Math.floor(k / 4)) % ROCA.length];
  color += `<polygon points="${P(a)}" fill="${c}"/><polygon points="${P(a)}" fill="#2a1c12" fill-opacity="${(k / N * .32).toFixed(3)}"/>`;
});
color += `<polygon points="${P(fondoPit)}" fill="#8a7c6e"/><polygon points="${P(mancha(RC[0] + N * 1.6 + 10, RC[1] + N * BAJA + 6, RX * .045, RY * .035, .25, 20))}" fill="#4f8582"/>`;
// bermas: borde claro de cada banco
anillos.forEach((a, k) => color += `<polygon points="${P(a)}" fill="none" stroke="#efe1cb" stroke-width="${(1.5 - k * .04).toFixed(2)}" stroke-opacity="${(.75 - k * .02).toFixed(2)}"/>`);
s += `<g filter="url(#f-borde2)">`
  + `<g>${color}</g>`
  + `<g filter="url(#f-pitluz)" style="mix-blend-mode:multiply">${alto}</g>`
  + `<polygon points="${P(borde)}" filter="url(#f-pitgrano)" opacity=".5"/>`
  + `<polygon points="${P(borde)}" fill="url(#g-luzrajo)" opacity=".6"/>`
  + `</g>`;
// c) rampa de acarreo: tramos que bajan por la pared norte con curvas de retorno (switchbacks)
const enAnillo = (a, k) => { const f = 1 - (k + .5) / (N + .8); return [RC[0] + k * 1.6 + Math.cos(a) * RX * f, RC[1] + k * BAJA + Math.sin(a) * RY * f]; };
const tramos = [[-.15, -2.75, 0, 3.4], [-2.75, -.45, 4, 7], [-.45, -2.6, 7.6, 10.2], [-2.6, -.75, 10.8, 13.2], [-.75, -1.95, 13.8, 15.9]];
/** Une tramos con curvas en U: el tramo siguiente parte medio banco más abajo. */
function trazar(lista, pasos = 40) {
  const r = [];
  let dk = 0;
  lista.forEach(([a0, a1, k0, k1], j) => {
    const sg = Math.sign(a1 - a0);
    if (j) {
      const prev = lista[j - 1], sp = Math.sign(prev[1] - prev[0]), kk = prev[3];
      for (let u = 1; u < 8; u++) { const th = u / 8 * Math.PI; r.push(enAnillo(prev[1] + sp * Math.sin(th) * .07, kk + .3 - Math.cos(th) * .3)); }
    }
    for (let i = j ? 0 : 0; i <= pasos; i++) { const t = i / pasos; r.push(enAnillo(a0 + (a1 - a0) * t, k0 + dk + (k1 - k0) * t)); }
    dk += 0;
    void sg;
  });
  return r;
}
const rampa = trazar(tramos.map(([a0, a1, k0, k1], j) => [a0, a1, k0 + (j ? .0 : 0), k1]));
const via = (r, w) => `<polyline points="${P(r)}" fill="none" stroke="#3e3026" stroke-width="${w + 3.4}" stroke-opacity=".55" stroke-linejoin="round" transform="translate(1.2 2.4)"/>`
  + `<polyline points="${P(r)}" fill="none" stroke="#7d6a57" stroke-width="${w + 1.6}" stroke-linejoin="round"/>`
  + `<polyline points="${P(r)}" fill="none" stroke="#cdb99c" stroke-width="${w}" stroke-linejoin="round"/>`
  + `<polyline points="${P(r)}" fill="none" stroke="#e2d2b9" stroke-width="${w * .45}" stroke-linejoin="round" transform="translate(-.6 -.8)"/>`
  + `<polyline points="${P(r)}" fill="none" stroke="#f6ecdb" stroke-width=".9" stroke-dasharray="3 6" stroke-opacity=".8"/>`;
s += via(rampa, 6.4);
// rampa sur hacia los botaderos
const rampaSur = trazar([[.4, 2.75, 0, 3.4], [2.75, .7, 4, 6.8], [.7, 2.35, 7.4, 9.8]], 36);
s += via(rampaSur, 5.4);
// acceso desde el borde hacia el chancador y los botaderos
s += `<path d="M${rampa[0][0]} ${rampa[0][1]} C 880 610, 850 570, 800 545" fill="none" stroke="#cbb699" stroke-width="5"/><path d="M${rampaSur[0][0]} ${rampaSur[0][1]} C 900 740, 950 720, 990 700" fill="none" stroke="#c7b295" stroke-width="4.4"/>`;
// d) equipos: camiones en la rampa (con sombra), palas y perforadoras en los bancos
const camionPit = (x, y, ang, k = 1) => `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${ang.toFixed(0)}) scale(${k})"><rect x="-3.2" y="-1.6" width="7.5" height="4.6" fill="#000" opacity=".3"/><rect x="-4" y="-2.4" width="6" height="4.6" fill="#f2c430" stroke="#6a4f10" stroke-width=".5"/><rect x="2" y="-2" width="2.4" height="3.8" fill="#d99a1c"/></g>`;
for (let i = 6; i < rampa.length - 2; i += 14) {
  const [x, y] = rampa[i], [x2, y2] = rampa[i + 1];
  s += camionPit(x, y, Math.atan2(y2 - y, x2 - x) * 180 / Math.PI, 1 - i / 400);
}
const pala = (x, y, k = 1) => `<g transform="translate(${x} ${y}) scale(${k})"><ellipse cx="1" cy="3" rx="9" ry="3" fill="#000" opacity=".3"/><rect x="-6" y="-4" width="11" height="7" fill="#e9b62a" stroke="#5c4510" stroke-width=".6"/><rect x="-6" y="-6" width="6" height="3" fill="#cfd4d6"/><path d="M5 -1 L14 -7 L17 -3" stroke="#3b3b3b" stroke-width="2" fill="none"/><path d="M14 -8 l5 1 l-1 4z" fill="#3b3b3b"/></g>`;
s += pala(RC[0] + N * 1.6 - 22, RC[1] + N * BAJA - 2, .9) + pala(RC[0] - 120, RC[1] + 60, .8) + pala(RC[0] + 150, RC[1] + 40, .8);
[[RC[0] - 60, RC[1] - 86], [RC[0] - 40, RC[1] - 88], [RC[0] + 210, RC[1] - 40]].forEach(([x, y]) => s += `<g transform="translate(${x} ${y})"><rect x="-2" y="-9" width="3" height="11" fill="#e0793a"/><rect x="-4" y="1" width="8" height="4" fill="#5b5f61"/></g>`);
// mallas de perforación sobre un banco
for (let i = 0; i < 18; i++) s += `<circle cx="${(RC[0] - 72 + (i % 9) * 5).toFixed(1)}" cy="${(RC[1] - 78 + Math.floor(i / 9) * 4).toFixed(1)}" r=".9" fill="#5a4a3c"/>`;

/* --- 8. Estructuras: piezas reutilizables con sombra proyectada al sureste --- */
const sombra = (pts, k = .3) => `<polygon points="${P(pts)}" fill="#2a1b10" opacity="${k}" filter="url(#f-sombra)"/>`;
/** Galpón o nave: techo, muro frontal con paneles y muro lateral en sombra. */
function nave(x, y, w, d, h, o = {}) {
  const dx = d * .62, dy = d * .38, c = o.c || ['#f1f2ef', '#cfd3d1', '#a9b0b0'];
  let r = sombra([[x, y + h], [x + w, y + h], [x + w + dx + h * .9, y - dy + h + h * .55], [x + dx + h * .9, y - dy + h + h * .55]]);
  r += `<polygon points="${P([[x + w, y], [x + w + dx, y - dy], [x + w + dx, y - dy + h], [x + w, y + h]])}" fill="${c[2]}"/>`;
  r += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c[1]}"/>`;
  for (let i = 1; i < w / 4; i++) r += `<path d="M${x + i * 4} ${y + 1}v${h - 1}" stroke="#000" stroke-opacity=".07" stroke-width=".8"/>`;
  if (o.ventanas) for (let i = 0; i < w / 7 - 1; i++) r += `<rect x="${x + 3 + i * 7}" y="${y + h * .35}" width="3.5" height="${Math.max(1.6, h * .18)}" fill="#3d4a52" opacity=".75"/>`;
  if (o.porton) r += `<rect x="${x + w * .2}" y="${y + h * .3}" width="${w * .22}" height="${h * .7}" fill="#5d666b"/>`;
  r += `<polygon points="${P([[x, y], [x + w, y], [x + w + dx, y - dy], [x + dx, y - dy]])}" fill="${c[0]}"/>`;
  if (o.cumbrera) r += `<path d="M${x + dx / 2} ${y - dy / 2} L${x + w + dx / 2} ${y - dy / 2}" stroke="#fff" stroke-width="1.2" stroke-opacity=".9"/><polygon points="${P([[x, y], [x + w, y], [x + w + dx / 2, y - dy / 2], [x + dx / 2, y - dy / 2]])}" fill="#000" opacity=".06"/>`;
  if (o.lucarnas) for (let i = 0; i < w / 10; i++) r += `<polygon points="${P([[x + 4 + i * 10 + dx * .3, y - dy * .3], [x + 9 + i * 10 + dx * .3, y - dy * .3], [x + 9 + i * 10 + dx * .7, y - dy * .7], [x + 4 + i * 10 + dx * .7, y - dy * .7]])}" fill="#9fb9c6" opacity=".8"/>`;
  if (o.solar) for (let i = 0; i < w / 6; i++) r += `<polygon points="${P([[x + 1.5 + i * 6 + dx * .15, y - dy * .15], [x + 5.5 + i * 6 + dx * .15, y - dy * .15], [x + 5.5 + i * 6 + dx * .85, y - dy * .85], [x + 1.5 + i * 6 + dx * .85, y - dy * .85]])}" fill="#2f4f7a" opacity=".9"/>`;
  return r + `<path d="M${x} ${y} L${x + w} ${y} L${x + w + dx} ${y - dy}" stroke="#fff" stroke-opacity=".75" stroke-width=".8" fill="none"/>`;
}
/** Estanque cilíndrico. */
function estanque(x, y, r, h, c = ['#e3e6e4', '#b9bfbf']) {
  return sombra([[x - r, y + h], [x + r, y + h], [x + r + h * .9, y + h * 1.5], [x - r + h * .9, y + h * 1.5]], .25)
    + `<rect x="${x - r}" y="${y}" width="${2 * r}" height="${h}" fill="${c[1]}"/><ellipse cx="${x}" cy="${y + h}" rx="${r}" ry="${r * .45}" fill="${c[1]}"/>`
    + `<rect x="${x + r * .35}" y="${y}" width="${r * .65}" height="${h}" fill="#000" opacity=".12"/><ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * .45}" fill="${c[0]}" stroke="#fff" stroke-width=".7"/>`;
}
/** Espesador: estanque circular bajo con brazo rastrillo. */
function espesador(x, y, r) {
  return `<ellipse cx="${x + 2}" cy="${y + 3}" rx="${r + 1}" ry="${r * .5 + 1}" fill="#2a1b10" opacity=".25"/><ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * .5}" fill="#cfd4d2"/><ellipse cx="${x}" cy="${y}" rx="${r * .86}" ry="${r * .43}" fill="#7f9796"/>`
    + `<ellipse cx="${x}" cy="${y}" rx="${r * .5}" ry="${r * .25}" fill="#6c8584"/><path d="M${x - r * .86} ${y} L${x + r * .86} ${y}" stroke="#e7ebe9" stroke-width="1.3"/><circle cx="${x}" cy="${y}" r="1.6" fill="#e7ebe9"/>`;
}
/** Correa transportadora elevada, con su sombra. */
const correa = (a, b) => `<path d="M${a[0] + 5} ${a[1] + 6} L${b[0] + 5} ${b[1] + 6}" stroke="#2a1b10" stroke-opacity=".22" stroke-width="3"/><path d="M${a[0]} ${a[1]} L${b[0]} ${b[1]}" stroke="#5b6164" stroke-width="3.2"/><path d="M${a[0]} ${a[1]} L${b[0]} ${b[1]}" stroke="#d8dcdb" stroke-width="1.1" stroke-dasharray="2.5 2"/>`;
/** Acopio de mineral en domo o cónico. */
const acopio = (x, y, r, c = '#6b5747') => `<ellipse cx="${x + r * .5}" cy="${y + r * .35}" rx="${r * 1.1}" ry="${r * .45}" fill="#2a1b10" opacity=".28" filter="url(#f-sombra)"/><ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * .55}" fill="${c}"/><ellipse cx="${x - r * .25}" cy="${y - r * .12}" rx="${r * .55}" ry="${r * .28}" fill="#fff" opacity=".12"/><path d="M${x - r * .1} ${y - r * .5} L${x + r * .6} ${y + r * .3}" stroke="#2a1b10" stroke-opacity=".2" stroke-width="2"/>`;
const vehiculo = (x, y, c, ang = -28) => `<rect x="${x}" y="${y}" width="3.6" height="1.9" fill="${c}" transform="rotate(${ang} ${x} ${y})"/>`;

/* Planta concentradora: chancador primario, acopio, molienda, flotación, espesadores, filtrado y estanques */
s += `<polygon points="${P(mancha(840, 505, 140, 52, .12, 30))}" fill="#d8c5ab" opacity=".6" filter="url(#f-pad)"/>`;
// caminos y patios de la planta
s += `<path d="M720 500 L960 482 M800 540 L940 528" stroke="#e2d4bf" stroke-width="5" opacity=".85"/><path d="M880 600 C 890 570, 880 545, 860 530" stroke="#e2d4bf" stroke-width="4.5" fill="none"/>`;
s += espesador(858, 468, 15) + espesador(892, 474, 13) + espesador(922, 480, 11);
s += correa([905, 585], [893, 548]) + correa([882, 538], [826, 494]) + correa([760, 492], [730, 484]);
s += nave(890, 582, 20, 14, 20, { c: ['#d9dcda', '#a9b0b0', '#899091'], porton: true });
s += acopio(890, 545, 20, '#5f4c3e');
s += nave(764, 494, 62, 26, 20, { cumbrera: true, lucarnas: true, ventanas: true });
s += nave(826, 500, 26, 22, 26, { c: ['#e9ecea', '#c0c6c5', '#9aa2a3'], ventanas: true });
s += `<rect x="809" y="460" width="5" height="30" fill="#c4cacb"/><rect x="812" y="460" width="2" height="30" fill="#000" opacity=".15"/>`;
for (let f = 0; f < 2; f++) for (let c = 0; c < 6; c++) s += `<rect x="${858 + c * 7 + f * 4}" y="${514 + f * 6}" width="5.5" height="4.2" fill="#9aa9ae" stroke="#e8ecec" stroke-width=".6"/>`;
s += nave(708, 486, 24, 16, 13, { c: ['#e4e1da', '#bdb7ad', '#a39d93'], porton: true });
s += acopio(742, 470, 9, '#3b3a3c');
s += estanque(950, 520, 8, 12) + estanque(970, 528, 8, 12) + estanque(938, 548, 6, 9, ['#d8e1e6', '#a9b8c0']);
for (let i = 0; i < 4; i++) s += `<path d="M${960 + i * 6} 560 v10 M${957 + i * 6} 562 h6" stroke="#7d8486" stroke-width="1"/>`;
s += nave(950, 586, 46, 22, 18, { c: ['#d4d8d6', '#9ea6a7', '#7f8788'], porton: true, cumbrera: true });
for (let i = 0; i < 6; i++) s += vehiculo(736 + i * 6, 506 + (i % 2) * 2, i % 2 ? '#f2c430' : '#e9e6df');

/* --- 9. Área de servicios, portería y campamento --- */
s += `<polygon points="${P(mancha(300, 466, 180, 58, .1, 30))}" fill="#dac6aa" opacity=".6" filter="url(#f-pad)"/>`;
// calles del campamento
s += `<path d="M120 500 L470 486 M150 452 L455 438 M300 420 L310 512 M200 425 L208 510 M400 418 L408 505" stroke="#e8dccb" stroke-width="3.2" opacity=".9"/>`;
// pabellones de dormitorios en grupos de cuatro, con paneles solares en algunos
for (let g = 0; g < 3; g++) for (let f = 0; f < 2; f++) for (let i = 0; i < 4; i++) {
  const x = 140 + g * 100 + f * 3, y = 438 + f * 32 + i * 7.2 - g * 4;
  s += nave(x, y, 52, 7, 4.2, { cumbrera: true, solar: (g + f + i) % 3 === 0, c: ['#f4f3ef', '#d6d1c7', '#b7b0a3'] });
}
// casino, gimnasio y policlínico
s += nave(440, 470, 36, 20, 10, { c: ['#eae7df', '#c9c2b5', '#aba395'], ventanas: true, lucarnas: true });
s += nave(445, 500, 26, 14, 8, { c: ['#c8d2d8', '#9aa8b0', '#7f8c94'], ventanas: true });
s += nave(108, 476, 26, 16, 8, { c: ['#e7e2d6', '#c8bfae', '#ada294'], ventanas: true });
// cancha de fútbol (tierra) y estanques de agua
s += `<rect x="350" y="506" width="44" height="22" fill="#a7a06e" stroke="#efe9d8" stroke-width="1.2" transform="rotate(-6 350 506)"/><path d="M372 504 l2 22" stroke="#efe9d8" stroke-width="1" transform="rotate(-6 350 506)"/>`;
s += estanque(118, 452, 6, 10) + estanque(132, 448, 6, 10);
// estacionamiento con vehículos
for (let i = 0; i < 22; i++) s += vehiculo(244 + (i % 11) * 5.5, 512 + Math.floor(i / 11) * 5, ['#f1efe9', '#d33', '#2f5d8a', '#e9e6df', '#888'][i % 5], -4);
// portería con barrera de acceso
s += nave(470, 500, 12, 8, 6, { c: ['#f2f0ea', '#d1c9bb', '#b3aa9b'] }) + `<path d="M484 506 l16 -1" stroke="#e0793a" stroke-width="2"/><rect x="483" y="502" width="2" height="6" fill="#eef1f3"/>`;

/* --- 10. Bruma de altura, viñeta y grano --- */
s += `<rect width="${W}" height="${H}" fill="url(#g-bruma)"/>`;
s += `<rect width="${W}" height="${H}" filter="url(#f-grano)" opacity=".16"/>`;
s += `<rect width="${W}" height="${H}" fill="url(#g-vineta)"/>`;

process.stdout.write(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${defs}${s}</svg>`);
