/* =====================================================================
   Datos ficticios de demostración, coherentes con el Caso 01
   (Compañía Minera Altos de Aranda S.A., empresa ficticia).
   El orden de creación importa: los generadores con semilla dan
   siempre los mismos valores que el prototipo en HTML.
   ===================================================================== */
import { dOff, fd, hace, nf, pad, rng, rutDv } from './util';

export const BRAND = { product: 'SITCO Aranda', vendor: 'OVERFORE', client: 'Compañía Minera Altos de Aranda S.A.' };

/* ---------- Perfiles de persona usuaria ---------- */
export interface Rol { label: string; person: string; ini: string; desc: string; home: string; ico: string; items: string[] }
export const ROLES: Record<string, Rol> = {
  operador: { label: 'Operador de pala', person: 'Eleodoro Painemal', ini: 'EP', desc: 'Opera la pala PA-03 en turno. Guantes, sol, sin señal en el fondo del rajo.', home: '/terreno', ico: 'truck', items: ['inicio', 'terreno', 'ayuda'] },
  supervisor: { label: 'Supervisor de turno mina', person: 'Camila Rojas Fuentes', ini: 'CR', desc: 'Atiende equipos detenidos, incidentes e inspecciones de su turno.', home: '/inicio', ico: 'wrench', items: ['inicio', 'control', 'terreno', 'equipos', 'plan', 'perforacion', 'seguridad', 'tablero', 'ayuda'] },
  planificacion: { label: 'Planificación minera', person: 'Francisca Ledermann', ini: 'FL', desc: 'Versiona el plan semanal y revisa el cumplimiento del turno anterior.', home: '/inicio', ico: 'cal', items: ['inicio', 'control', 'plan', 'perforacion', 'trazabilidad', 'equipos', 'tablero', 'ayuda'] },
  metalurgia: { label: 'Metalurgia y conciliación', person: 'Héctor Sanhueza', ini: 'HS', desc: 'Concilia mina–planta–embarque y explica cada diferencia por punto de la cadena.', home: '/inicio', ico: 'scale', items: ['inicio', 'control', 'trazabilidad', 'conciliacion', 'terceros', 'tablero', 'ayuda'] },
  seguridad: { label: 'Seguridad y salud ocupacional', person: 'Marcelo Tapia', ini: 'MT', desc: 'Acreditación de personas, incidentes y alertas de fatiga con acción documentada.', home: '/inicio', ico: 'shield', items: ['inicio', 'acreditacion', 'porteria', 'seguridad', 'terceros', 'tablero', 'ayuda'] },
  sustentabilidad: { label: 'Sustentabilidad y regulatorio', person: 'Paula Guerrero', ini: 'PG', desc: 'Reportes a la autoridad, huella de carbono y convenio con la comunidad.', home: '/inicio', ico: 'leaf', items: ['inicio', 'ambiental', 'trazabilidad', 'tablero', 'ayuda'] },
  contratista: { label: 'Empresa contratista (externa)', person: 'Daniela Fuentes (Transportes Salar Grande)', ini: 'DF', desc: 'Acredita a sus trabajadores y sube documentos antes de que venzan.', home: '/inicio', ico: 'badge', items: ['inicio', 'acreditacion', 'ayuda'] },
  gerencia: { label: 'Gerencia general', person: 'Rodrigo Palma', ini: 'RP', desc: 'Vista ejecutiva: trazabilidad, conciliación, cumplimiento y continuidad operacional.', home: '/inicio', ico: 'chart', items: ['inicio', 'control', 'trazabilidad', 'conciliacion', 'plan', 'perforacion', 'equipos', 'porteria', 'ambiental', 'tablero', 'conectividad', 'integrador', 'ayuda'] },
  admin: { label: 'Administración TI', person: 'Verónica Alcaíno', ini: 'VA', desc: 'Usuarios, roles, parámetros, auditoría y estado de la plataforma.', home: '/inicio', ico: 'gear', items: ['inicio', 'control', 'terceros', 'conectividad', 'integrador', 'admin', 'ayuda'] },
};
export const ROLKEYS = Object.keys(ROLES);

export interface NavItem { id: string; l: string; h: string; i: string }
export const NAV: { g: string; items: NavItem[] }[] = [
  { g: 'Operación', items: [
    { id: 'inicio', l: 'Inicio', h: '/inicio', i: 'home' },
    { id: 'control', l: 'Centro de control', h: '/control', i: 'map' },
    { id: 'terreno', l: 'Terreno (móvil)', h: '/terreno', i: 'phone' },
    { id: 'trazabilidad', l: 'Trazabilidad de lotes', h: '/trazabilidad', i: 'route' },
    { id: 'conciliacion', l: 'Conciliación metalúrgica', h: '/conciliacion', i: 'scale' },
    { id: 'plan', l: 'Plan minero y versiones', h: '/plan', i: 'cal' },
    { id: 'perforacion', l: 'Perforación y pozos', h: '/perforacion', i: 'drill' },
    { id: 'equipos', l: 'Equipos y detenciones', h: '/equipos', i: 'truck' }] },
  { g: 'Personas y cumplimiento', items: [
    { id: 'acreditacion', l: 'Acreditación', h: '/acreditacion', i: 'badge' },
    { id: 'porteria', l: 'Consola de portería', h: '/porteria', i: 'lock' },
    { id: 'seguridad', l: 'Seguridad y fatiga', h: '/seguridad', i: 'shield' },
    { id: 'ambiental', l: 'Ambiental y huella', h: '/ambiental', i: 'leaf' },
    { id: 'terceros', l: 'Terceros', h: '/terceros', i: 'bld' }] },
  { g: 'Análisis', items: [{ id: 'tablero', l: 'Tablero analítico', h: '/tablero', i: 'chart' }] },
  { g: 'Plataforma', items: [
    { id: 'conectividad', l: 'Conectividad y nube', h: '/conectividad', i: 'cloud' },
    { id: 'integrador', l: 'Integrador de sistemas', h: '/integrador', i: 'link' },
    { id: 'admin', l: 'Administración', h: '/admin/usuarios', i: 'gear' },
    { id: 'ayuda', l: 'Ayuda y accesibilidad', h: '/ayuda', i: 'help' }] },
];

/* ---------- Módulos de la solución (Subdocumento 3: nueve módulos, más el Integrador) ----------
   nodo: también corre en el Nodo de Faena (48 h sin enlace).
   items: pantallas del prototipo que muestran el módulo. */
export interface Modulo { id: string; n: string; g: string; d: string; nodo: boolean; items: string[] }
export const MODULOS: Modulo[] = [
  { id: 'opmina', n: 'Operación Mina', g: 'Problema 1 · Trazabilidad comercial', d: 'Plan, declaración y perforación', nodo: true, items: ['plan', 'perforacion', 'terreno'] },
  { id: 'traz', n: 'Trazabilidad y Embarque', g: 'Problema 1 · Trazabilidad comercial', d: 'Stock, recepción y embarque', nodo: true, items: ['trazabilidad'] },
  { id: 'conc', n: 'Conciliación Metalúrgica', g: 'Problema 1 · Trazabilidad comercial', d: 'Pesaje y balance', nodo: true, items: ['conciliacion'] },
  { id: 'equ', n: 'Equipos y Mantenimiento', g: 'Problema 2 · Productividad operacional', d: 'Avisos de falla, alarmas y mantención', nodo: false, items: ['equipos'] },
  { id: 'acr', n: 'Acreditación y Acceso', g: 'Problema 3 · Cumplimiento regulatorio y personas', d: 'Habilitación, credencial y portería', nodo: true, items: ['acreditacion', 'porteria'] },
  { id: 'sso', n: 'Seguridad y Salud Ocupacional', g: 'Problema 3 · Cumplimiento regulatorio y personas', d: 'Incidentes e inspecciones', nodo: true, items: ['seguridad'] },
  { id: 'amb', n: 'Cumplimiento Ambiental', g: 'Problema 3 · Cumplimiento regulatorio y personas', d: 'Mediciones e informes', nodo: false, items: ['ambiental'] },
  { id: 'ind', n: 'Indicadores y Centro Integrado', g: 'Transversales', d: 'Tableros de turno y vista del CIO', nodo: false, items: ['control', 'tablero'] },
  { id: 'adm', n: 'Administración y Servicios Comunes', g: 'Transversales', d: 'Identidad, auditoría, firma y flujos', nodo: false, items: ['admin'] },
  { id: 'int', n: 'Integrador de Sistemas', g: 'Integración', d: 'Un conector por cada sistema existente', nodo: true, items: ['integrador'] },
];
export const modOf = (item?: string | null) => (item ? MODULOS.find(m => m.items.includes(item)) : undefined);

/* ---------- Sistemas existentes y su conector (Subdocumento 3, 3.3.2.2) ----------
   t: tratamiento · dir: sentido del dato · loc: 'faena' (el conector corre en el Nodo) o 'nube' · mod: módulo que lo usa. */
export interface Sistema { id: string; n: string; t: string; dir: string; loc: string; mod: string; q: string; lat: number }
export const SISTEMAS: Sistema[] = [
  { id: 'SYS-01', n: 'SAP S/4HANA', t: 'Se integra', dir: 'Ida y vuelta', loc: 'nube', mod: 'Administración, Equipos, Trazabilidad', q: 'Avisos de falla, pautas, guías de despacho y cierre de conciliación. SAP sigue siendo el sistema de registro y emite los documentos.', lat: 420 },
  { id: 'SYS-02', n: 'Despacho de flota', t: 'Se integra', dir: 'Ida y vuelta', loc: 'faena', mod: 'Operación Mina', q: 'Viajes, cargas y destino de cada camión; recibe la versión vigente del plan.', lat: 35 },
  { id: 'SYS-03', n: 'Laboratorio', t: 'Se integra', dir: 'Ida y vuelta', loc: 'faena', mod: 'Trazabilidad y Embarque', q: 'Muestras y resultados de ley y arsénico, sin transcripción.', lat: 60 },
  { id: 'SYS-04', n: 'Telemetría de fabricantes (3 portales)', t: 'Se integra', dir: 'Entrada', loc: 'nube', mod: 'Equipos y Mantenimiento', q: 'Alarmas, horas, consumos y códigos de falla de camiones, palas y perforadoras.', lat: 640 },
  { id: 'SYS-05', n: 'Control de fatiga', t: 'Se integra', dir: 'Entrada', loc: 'faena', mod: 'Seguridad y Salud Ocupacional', q: 'Alertas de somnolencia y distracción, para documentar la acción.', lat: 40 },
  { id: 'SYS-06', n: 'Historiador de proceso', t: 'Solo lectura', dir: 'Entrada', loc: 'faena', mod: 'Conciliación Metalúrgica', q: 'Balanza de alimentación y variables de planta, por diodo de datos desde la red de control.', lat: 55 },
  { id: 'SYS-07', n: 'Planificación minera', t: 'Solo lectura', dir: 'Entrada', loc: 'nube', mod: 'Operación Mina', q: 'Plan semanal y polígonos con ley estimada.', lat: 380 },
  { id: 'SYS-08', n: 'Báscula de camiones', t: 'Solo lectura', dir: 'Entrada', loc: 'faena', mod: 'Conciliación Metalúrgica', q: 'Pesaje de control y de despacho a puerto.', lat: 30 },
  { id: 'SYS-09', n: 'Acceso de portería', t: 'Se amplía', dir: 'Ida y vuelta', loc: 'faena', mod: 'Acreditación y Acceso', q: 'Recibe la habilitación vigente de cada persona y devuelve los ingresos y rechazos.', lat: 45 },
  { id: 'SYS-10', n: 'Planillas y carpetas', t: 'Se reemplaza', dir: '—', loc: '—', mod: 'Todos', q: 'Dejan de ser el sistema de registro; su historia se migra y quedan como consulta.', lat: 0 },
];

/* ---------- Perforación: pozos del turno (RF-TER-006) ---------- */
export interface Pozo { id: string; poli: string; pf: string; prof: number; diam: number; dur: number; agua: string; origen: string; f: Date; nuevo?: boolean }
const rP = rng(909), PERF = ['PF-01', 'PF-02', 'PF-03', 'PF-04', 'PF-05', 'PF-06', 'PF-07', 'PF-08', 'PF-09'];
export const POZOS: Pozo[] = Array.from({ length: 36 }, (_, i) => {
  const pf = PERF[Math.floor(rP() * 9)], inst = pf === 'PF-01' || pf === 'PF-02';
  return { id: 'PZ-' + (4800 + i), poli: '', pf, prof: +(13 + rP() * 4).toFixed(1), diam: pf === 'PF-09' ? 251 : 311, dur: Math.round(38 + rP() * 54), agua: rP() < .18 ? 'Sí' : 'No', origen: inst ? 'Instrumentada' : 'App SITCO Terreno', f: hace(12 + i * 41) };
});

/* ---------- Generadores base ---------- */
const R = rng(2026);
export const pick = <T>(a: T[], r = R) => a[Math.floor(r() * a.length)];
const NOMBRES = ['Juan', 'Pedro', 'Luis', 'Carlos', 'Jorge', 'Mario', 'Hugo', 'Rodrigo', 'Víctor', 'Marcos', 'Ana', 'María', 'Carolina', 'Paola', 'Daniela', 'Sandra', 'Patricia', 'Claudia', 'Ximena', 'Valeria', 'Cristian', 'Sergio', 'Felipe', 'Matías', 'Ignacio'];
const APELL = ['Rojas', 'Muñoz', 'Pizarro', 'Araya', 'Tapia', 'Cortés', 'Vega', 'Soto', 'Campos', 'Díaz', 'Flores', 'Lagos', 'Salinas', 'Mamani', 'Choque', 'Cruz', 'Godoy', 'Olivares', 'Reyes', 'Valdés', 'Carvajal', 'Aguilera', 'Zúñiga', 'Figueroa'];
export const mkRut = () => { const n = 9000000 + Math.floor(R() * 14000000); return `${nf(n)}-${rutDv(n)}`; };
const fullName = () => `${pick(NOMBRES)} ${pick(APELL)} ${pick(APELL)}`;

/* ---------- Terceros ---------- */
export interface Tercero { id: string; nombre: string; rut: string; tipo: string; rubro: string; trabajadores: number; score: number; estado: string }
const EMPRESAS_BASE = ['Transportes Salar Grande Ltda.', 'Servicios Atacama Andes SpA', 'Constructora Cordillera Norte SpA', 'Mantención Industrial Loa SpA', 'Ingeniería y Montajes Calama Sur', 'Perforaciones Altiplano SpA', 'Logística Puerto Norte S.A.', 'Alimentación y Casino Desierto Ltda.', 'Seguridad Privada Quebrada Seca', 'Aljibes y Caminos Pampa SpA', 'Geotecnia Andina Ltda.', 'Laboratorio Analítico Norte S.A.', 'Neumáticos y Servicios Mineros SpA', 'Electricidad Industrial Tarapacá', 'Soldaduras Especiales Antofagasta', 'Gestión Ambiental Salar SpA', 'Capacitación Minera del Norte', 'Servicios Médicos Altura SpA', 'Hotelería y Campamentos Kimsa', 'Radiocomunicaciones del Desierto'];
const RUBROS = ['Transporte', 'Servicios', 'Construcción', 'Mantención', 'Montaje', 'Perforación', 'Logística', 'Alimentación', 'Seguridad', 'Caminos', 'Geotecnia', 'Laboratorio', 'Neumáticos', 'Electricidad', 'Soldadura', 'Ambiental', 'Capacitación', 'Salud', 'Campamento', 'Comunicaciones'];
export const EMPRESAS: Tercero[] = EMPRESAS_BASE.map((n, i) => ({ id: 'T-' + (1000 + i), nombre: n, rut: mkRut(), tipo: 'Contratista', rubro: RUBROS[i], trabajadores: 8 + Math.floor(R() * 120), score: 62 + Math.floor(R() * 36), estado: pick(['Vigente', 'Vigente', 'Vigente', 'Con observaciones']) }));
export const TERCEROS: Tercero[] = [
  ...EMPRESAS,
  { id: 'C-01', nombre: 'Pacific Smelting Co. (Japón)', rut: 'Extranjero', tipo: 'Comprador', rubro: 'Fundición · 38 % del concentrado', trabajadores: 0, score: 94, estado: 'Vigente' },
  { id: 'C-02', nombre: 'Han River Metals (Corea)', rut: 'Extranjero', tipo: 'Comprador', rubro: 'Fundición · exige huella de carbono', trabajadores: 0, score: 91, estado: 'Vigente' },
  { id: 'L-01', nombre: 'Laboratorio del vendedor (Aranda)', rut: '—', tipo: 'Laboratorio', rubro: 'Muestreo comercial', trabajadores: 0, score: 97, estado: 'Vigente' },
  { id: 'L-02', nombre: 'Laboratorio del comprador', rut: 'Extranjero', tipo: 'Laboratorio', rubro: 'Análisis de liquidación', trabajadores: 0, score: 93, estado: 'Vigente' },
  { id: 'L-03', nombre: 'Laboratorio árbitro (tercero independiente)', rut: 'Extranjero', tipo: 'Laboratorio', rubro: 'Dirime discrepancias', trabajadores: 0, score: 96, estado: 'Vigente' },
  { id: 'F-01', nombre: 'Fabricante de camiones (portal telemetría A)', rut: 'Extranjero', tipo: 'Fabricante', rubro: 'Camiones · 3 generaciones', trabajadores: 0, score: 71, estado: 'Con observaciones' },
  { id: 'F-02', nombre: 'Fabricante de palas (portal telemetría B)', rut: 'Extranjero', tipo: 'Fabricante', rubro: 'Palas eléctricas de cable', trabajadores: 0, score: 78, estado: 'Vigente' },
  { id: 'F-03', nombre: 'Fabricante de perforadoras (portal telemetría C)', rut: 'Extranjero', tipo: 'Fabricante', rubro: 'Perforadoras · 2 con instrumentación', trabajadores: 0, score: 64, estado: 'Con observaciones' },
  { id: 'P-01', nombre: 'Operador del terminal portuario (Antofagasta)', rut: '—', tipo: 'Portuario', rubro: 'Acopio 25.000 t y embarque', trabajadores: 0, score: 82, estado: 'Vigente' },
];

/** Listas para los campos con autocompletado. */
export const AC: Record<string, string[]> = {
  empresas: EMPRESAS.map(e => e.nombre),
  cargos: ['Operador de camión CAEX', 'Mecánico de mantención', 'Eléctrico industrial', 'Soldador calificado', 'Conductor de aljibe', 'Prevencionista de riesgos', 'Supervisor de obra', 'Auxiliar de servicios', 'Técnico instrumentista', 'Operador de grúa'],
  polis: [],
  trab: [],
};

/* ---------- Polígonos, stocks y embarques ---------- */
export interface Poligono { id: string; banco: string; ley: number; as: number; destino: string; plan: number; real: number; fecha: Date }
const BANCOS = ['B3030', 'B3015', 'B3000', 'B2985', 'B2970', 'B2955'];
export const POLIS: Poligono[] = Array.from({ length: 18 }, (_, i) => {
  const b = BANCOS[i % 6]; const ley = 0.42 + R() * 0.34, as = 90 + Math.round(R() * 520);
  return { id: `${b}-P${100 + i * 3}`, banco: b, ley: +ley.toFixed(2), as, destino: ley < 0.46 ? 'Stock baja ley' : 'Planta', plan: 4000 + Math.round(R() * 5000), real: 0, fecha: dOff(-Math.floor(R() * 90)) };
});
POLIS.forEach(p => (p.real = Math.round(p.plan * (0.82 + R() * 0.24))));
AC['polis'] = POLIS.map(p => p.id);
POZOS.forEach((p, i) => (p.poli = POLIS[(i * 7) % POLIS.length].id));
export const STOCKS = [
  { id: 'STK-A', n: 'Stock A · alta ley', t: 182000, ley: 0.61 },
  { id: 'STK-B', n: 'Stock B · mezcla', t: 240000, ley: 0.53 },
  { id: 'STK-C', n: 'Stock C · oxidado', t: 96000, ley: 0.49 },
  { id: 'STK-BL', n: 'Stock baja ley', t: 410000, ley: 0.38 },
];
/** Límites que se cambian en Administración › Parametrización.
    as: supuesto ilustrativo del límite contractual de arsénico en concentrado (%), igual al de S13 Anexos (el caso no entrega el valor). */
export const LIMITES = { as: 0.40 };

export interface Embarque { id: string; nave: string; comprador: string; t: number; cu: number; as: number; estado: string; paso: number; fecha: Date; exc: boolean }
const NAVES = ['MN Hokuetsu Star', 'MV Han River', 'MN Pacific Ayame', 'MV Coral Andes', 'MN Seto Maru', 'MV Pampa Sur', 'MN Kaiyo Pearl', 'MV Dalian Spirit'];
const ST = ['Programado', 'Programado', 'En conformación', 'En muestreo', 'Pendiente de aprobación', 'Embarcado', 'Embarcado', 'Liquidado', 'Liquidado', 'Liquidado', 'Liquidado', 'Liquidado', 'Liquidado', 'Liquidado'];
const PASO = [1, 1, 2, 3, 4, 7, 7, 8, 8, 8, 8, 8, 8, 8];
const FECHA_E = [14, 7, 2, -1, -3, -9, -15, -21, -32, -44, -55, -68, -80, -92];
export const EMBARQUES: Embarque[] = Array.from({ length: 14 }, (_, i) => {
  const t = 11400 + Math.round(R() * 1400), cu = +(26.6 + R() * 1.1).toFixed(1);
  const as = i === 7 ? 0.39 : +(0.28 + R() * 0.1).toFixed(2);
  return { id: `E-2026-${String(30 - i).padStart(2, '0')}`, nave: NAVES[i % NAVES.length], comprador: i % 3 === 2 ? 'Han River Metals (Corea)' : 'Pacific Smelting Co. (Japón)', t, cu, as, estado: ST[i], paso: PASO[i], fecha: dOff(FECHA_E[i]), exc: false };
});
EMBARQUES[4].exc = true;
EMBARQUES[4].as = 0.43;
export const EMB = (id: string) => EMBARQUES.find(e => e.id === id);

/** Contribución de cada polígono a un embarque (determinista por el número del embarque). */
export interface Eslabon { poli: Poligono; pct: number; t: number; stock: string; fx: Date }
export function chain(id: string): Eslabon[] {
  const r = rng(+id.split('-').pop()! * 977);
  const idx = POLIS.map((_, i) => i).sort(() => r() - .5).slice(0, 5);
  let w = idx.map(() => 0.1 + r());
  const s = w.reduce((a, b) => a + b, 0);
  w = w.map(x => x / s);
  const e = EMB(id) || { t: 12000 };
  return idx.map((k, j) => ({ poli: POLIS[k], pct: w[j], t: Math.round(e.t * w[j] * 79), stock: pick(['STK-A', 'STK-B', 'STK-C'], r), fx: dOff(-18 - Math.floor(r() * 60)) }));
}
/** Trazabilidad inversa: en qué embarques terminó un polígono. */
export function reverse(pid: string) {
  const out: { e: Embarque; c: Eslabon }[] = [];
  EMBARQUES.forEach(e => { const c = chain(e.id).find(x => x.poli.id === pid); if (c) out.push({ e, c }); });
  return out;
}
export const CHAIN_STEPS = [
  { t: 'Plan y polígono', s: 'Versión vigente del plan al momento de cada carga', sys: 'Software de planificación → plataforma', ico: 'cal', dato: 'Medido', regla: '' },
  { t: 'Extracción y carguío', s: 'Cambios de destino declarados por el operador en la botonera (1 toque).', sys: 'Despacho de flota + terreno', ico: 'truck', dato: 'Supuesto', regla: 'el viaje se asigna al polígono donde está la pala (SUP-11), versión 1.' },
  { t: 'Descarga y stock intermedio', s: 'Pesaje a bordo, báscula de control y trazabilidad por stock', sys: 'Despacho + báscula', ico: 'layers', dato: 'Supuesto', regla: 'promedio ponderado por tonelaje de lo acopiado (SUP-03), versión 1.' },
  { t: 'Retoma y planta', s: 'Mezcla retomada y balanza de alimentación (solo lectura)', sys: 'Historiador OT (solo lectura)', ico: 'zap', dato: 'Supuesto', regla: 'ley del material retomado con el promedio ponderado del stock (SUP-03), versión 1.' },
  { t: 'Muestreo y laboratorio', s: 'Resultados sin transcripción, en ambos sentidos', sys: 'Sistema de gestión de laboratorio', ico: 'db', dato: 'Medido', regla: '' },
  { t: 'Concentrado y despacho a puerto', s: 'Guías de despacho y pesaje por camión', sys: 'Báscula + SAP (emite la guía con código QR)', ico: 'truck', dato: 'Medido', regla: '' },
  { t: 'Conformación del lote comercial', s: 'Mezcla en acopio portuario y muestreo del protocolo comercial', sys: 'Terminal de terceros', ico: 'box', dato: 'Medido', regla: '' },
  { t: 'Embarque y cierre', s: 'Documentos de embarque; liquidación y árbitro meses después', sys: 'SAP emite · plataforma entrega datos', ico: 'flag', dato: 'Medido', regla: '' },
];

/* ---------- Plan minero ---------- */
export interface VersionPlan { v: string; f: Date; a: string; m: string; c: number; t: number }
export const PLAN_VERS: VersionPlan[] = [
  { v: 'v1', f: dOff(-6, 20, 0), a: 'F. Ledermann', m: 'Plan semanal exportado (domingo)', c: 0, t: 0 },
  { v: 'v2', f: dOff(-5, 7, 40), a: 'F. Ledermann', m: 'Caída de rampa norte: se reasignan 3 polígonos del banco B3015', c: 3, t: -18400 },
  { v: 'v3', f: dOff(-4, 14, 10), a: 'Supervisor de turno', m: 'Tronadura desplazó el contacto del polígono B3000-P106', c: 1, t: -4200 },
  { v: 'v4', f: dOff(-3, 9, 25), a: 'F. Ledermann', m: 'La planta pide más mineral oxidado (Stock C)', c: 2, t: 6100 },
  { v: 'v5', f: dOff(-1, 6, 55), a: 'Despachador', m: 'Pala PA-02 en mantención: se redistribuye carguío a PA-01 y PA-04', c: 2, t: -9300 },
  { v: 'v6', f: dOff(0, 7, 5), a: 'F. Ledermann', m: 'Vigente: ajuste de destino de B2985-P118 a stock baja ley', c: 1, t: -1200 },
];
export const CUMPL = { labels: ['T-6', 'T-5', 'T-4', 'T-3', 'T-2', 'T-1', 'Hoy'], vigente: [91, 88, 93, 90, 94, 92, 95], domingo: [91, 80, 76, 74, 79, 72, 70] };

/* ---------- Equipos ---------- */
export interface Equipo { id: string; tipo: string; fab: string; gen: string; estado: string; util: number; hs: number; zona: string; det: { desde: Date; causa: string } | null; ptos: number }
export const EQUIPOS: Equipo[] = [
  ...Array.from({ length: 38 }, (_, i) => ({ id: `CF-${pad(i + 1)}`, tipo: 'Camión 240 t', fab: 'Fabricante A', gen: i < 14 ? 'Gen 1' : i < 28 ? 'Gen 2' : 'Gen 3' })),
  ...Array.from({ length: 5 }, (_, i) => ({ id: `PA-${pad(i + 1)}`, tipo: 'Pala eléctrica', fab: 'Fabricante B', gen: 'Cable' })),
  ...Array.from({ length: 9 }, (_, i) => ({ id: `PF-${pad(i + 1)}`, tipo: 'Perforadora', fab: 'Fabricante C', gen: i < 2 ? 'Instrumentada' : 'Sin instrumentar' })),
] as Equipo[];
export const CAUSAS = ['Falla mecánica', 'Falla eléctrica', 'Espera de pala', 'Espera de camión', 'Clima / viento', 'Cambio de turno', 'Combustible', 'Sin clasificar'];
const rE = rng(77);
EQUIPOS.forEach(e => {
  const x = rE();
  e.estado = x < .72 ? 'Operando' : x < .82 ? 'Detenido' : x < .9 ? 'Mantención' : x < .95 ? 'Sin señal' : 'Operando';
  e.util = Math.round(58 + rE() * 32);
  e.hs = Math.round(8000 + rE() * 40000);
  e.zona = pick(['Banco B3015', 'Rampa norte', 'Chancador', 'Stock A', 'Botadero sur', 'Taller'], rE);
  e.det = e.estado === 'Detenido' ? { desde: hace(15 + Math.floor(rE() * 140)), causa: pick(CAUSAS, rE) } : null;
  e.ptos = Math.round(rE() * 100);
});
['CF-07', 'CF-18', 'PA-02', 'CF-31'].forEach((id, k) => {
  const e = EQUIPOS.find(x => x.id === id)!;
  e.estado = 'Detenido';
  e.det = { desde: hace([34, 78, 130, 22][k]), causa: ['Sin clasificar', 'Falla mecánica', 'Falla mecánica', 'Sin clasificar'][k] };
});
export const EQ = (id: string) => EQUIPOS.find(e => e.id === id);

/* ---------- Personas acreditadas ---------- */
export const DOCS = ['Contrato vigente', 'Examen preocupacional', 'Examen de altura geográfica', 'Curso de inducción', 'Curso de riesgos específicos'];
export interface Trabajador { id: string; nombre: string; rut: string; empresa: string; cargo: string; docs: { d: string; dias: number }[]; min: number; estado: string; turno: string }
const rW = rng(555);
export const TRAB: Trabajador[] = Array.from({ length: 64 }, (_, i) => {
  const emp = EMPRESAS[Math.floor(rW() * 8)];
  const docs = DOCS.map(d => ({ d, dias: Math.round(-12 + rW() * 400) }));
  if (rW() < .12) docs[Math.floor(rW() * 5)].dias = Math.round(-1 - rW() * 20);
  else if (rW() < .22) docs[Math.floor(rW() * 5)].dias = Math.round(2 + rW() * 27);
  const min = Math.min(...docs.map(x => x.dias)); const rev = rW() < .1;
  return { id: 'W-' + (2100 + i), nombre: `${pick(NOMBRES, rW)} ${pick(APELL, rW)} ${pick(APELL, rW)}`, rut: mkRut(), empresa: emp.nombre, cargo: pick(AC['cargos'], rW), docs, min, estado: rev ? 'En revisión' : min < 0 ? 'Vencido' : min <= 30 ? 'Por vencer' : 'Habilitado', turno: pick(['7x7 · A', '7x7 · B'], rW) };
});
export const TR = (id: string) => TRAB.find(t => t.id === id);
AC['trab'] = TRAB.map(t => `${t.nombre} · ${t.rut}`);
export const SOLICITUDES = [
  { id: 'S-0412', nombre: 'Marta Olivares Cruz', empresa: 'Transportes Salar Grande Ltda.', cargo: 'Conductor de aljibe', hrs: 19, etapa: 2 },
  { id: 'S-0413', nombre: 'Esteban Mamani Lagos', empresa: 'Mantención Industrial Loa SpA', cargo: 'Mecánico de mantención', hrs: 31, etapa: 1 },
  { id: 'S-0414', nombre: 'Jorge Soto Vega', empresa: 'Perforaciones Altiplano SpA', cargo: 'Técnico instrumentista', hrs: 6, etapa: 0 },
  { id: 'S-0415', nombre: 'Ximena Campos Díaz', empresa: 'Servicios Médicos Altura SpA', cargo: 'Auxiliar de servicios', hrs: 44, etapa: 2 },
];
export const ETAPAS_ACR = ['Solicitud de la empresa', 'Revisión documental', 'Aprobación de Seguridad y Salud Ocupacional', 'Credencial emitida'];

/* ---------- Seguridad ---------- */
export interface Incidente { id: string; tipo: string; lugar: string; f: Date; by: string; estado: string; sev: string }
export const INCIDENTES: Incidente[] = [
  { id: 'INC-0931', tipo: 'Cuasi accidente', lugar: 'Rampa norte · km 2', f: dOff(0, 6, 40), by: 'C. Rojas', estado: 'En investigación', sev: 'Media' },
  { id: 'INC-0930', tipo: 'Observación de conducta', lugar: 'Taller de mantenimiento', f: dOff(-1, 15, 10), by: 'M. Tapia', estado: 'Cerrado', sev: 'Baja' },
  { id: 'INC-0929', tipo: 'Incidente con lesión leve', lugar: 'Planta · chancado', f: dOff(-2, 3, 25), by: 'J. Araya', estado: 'En investigación', sev: 'Alta' },
  { id: 'INC-0928', tipo: 'Cuasi accidente', lugar: 'Botadero sur', f: dOff(-3, 11, 5), by: 'C. Rojas', estado: 'Cerrado', sev: 'Media' },
  { id: 'INC-0927', tipo: 'Inspección planificada', lugar: 'Depósito de relaves', f: dOff(-4, 9, 30), by: 'P. Zúñiga', estado: 'Cerrado', sev: 'Baja' },
  { id: 'INC-0926', tipo: 'Observación de conducta', lugar: 'Portería', f: dOff(-5, 19, 50), by: 'M. Tapia', estado: 'Cerrado', sev: 'Baja' },
  { id: 'INC-0925', tipo: 'Cuasi accidente', lugar: 'Fondo del rajo', f: dOff(-6, 22, 15), by: 'C. Rojas', estado: 'Cerrado', sev: 'Media' },
  { id: 'INC-0924', tipo: 'Inspección planificada', lugar: 'Campamento', f: dOff(-8, 10, 0), by: 'P. Zúñiga', estado: 'Cerrado', sev: 'Baja' },
];
export interface AlertaFatiga { id: string; eq: string; op: string; f: Date; tipo: string; accion: string | null; por: string }
export const FATIGA: AlertaFatiga[] = Array.from({ length: 14 }, (_, i) => ({
  id: 'FAT-' + (5200 + i), eq: pick(['CF-04', 'CF-11', 'CF-16', 'CF-22', 'CF-27', 'CF-33'], rW), op: fullName(), f: hace(20 + i * 97),
  tipo: pick(['Somnolencia', 'Microsueño', 'Distracción'], rW),
  accion: i < 5 ? null : pick(['Pausa activa de 15 min', 'Relevo del operador', 'Contacto por radio y verificación', 'Cambio de turno anticipado'], rW),
  por: i < 5 ? '' : pick(['Supervisor C. Rojas', 'Despachador L. Vega'], rW),
}));
export const INSPECCIONES = [
  { id: 'IP-118', n: 'Inspección de rampas y bermas', ok: 11, tot: 14 },
  { id: 'IP-119', n: 'Inspección de extintores en cabinas', ok: 38, tot: 38 },
  { id: 'IP-120', n: 'Inspección de iluminación de caminos', ok: 9, tot: 12 },
];

/* ---------- Ambiental ---------- */
export interface Compromiso { id: string; n: string; fr: string; ult: string; ok: string; dest: string; orig: string }
export const COMPROMISOS: Compromiso[] = [
  { id: 'RCA-01', n: 'Consumo de agua (por área)', fr: 'Diaria', ult: 'Hoy 06:00', ok: 'Cumple', dest: 'Autoridad ambiental', orig: 'Medidores de planta, campamento y supresión de polvo' },
  { id: 'RCA-02', n: 'Calidad del aire (MP10)', fr: 'Horaria', ult: 'Hoy 07:00', ok: 'Cumple', dest: 'Autoridad ambiental', orig: 'Estación fija + laboratorio externo' },
  { id: 'RCA-03', n: 'Ruido ambiental', fr: 'Mensual', ult: fd(dOff(-9)), ok: 'Cumple', dest: 'Autoridad ambiental', orig: 'Sonómetros certificados' },
  { id: 'RCA-04', n: 'Monitoreo geotécnico de relaves', fr: 'Diaria', ult: 'Hoy 05:30', ok: 'Dato con retraso', dest: 'Autoridad minera', orig: 'Instrumentación con transmisión intermitente' },
  { id: 'RCA-05', n: 'Aguas subterráneas (pozos de control)', fr: 'Trimestral', ult: fd(dOff(-40)), ok: 'Próximo a vencer', dest: 'Autoridad ambiental', orig: 'Empresa geotécnica externa' },
  { id: 'RCA-06', n: 'Emisiones de la fundición de pruebas', fr: 'Semestral', ult: fd(dOff(-100)), ok: 'Cumple', dest: 'Autoridad ambiental', orig: 'Laboratorio externo' },
  { id: 'CMN-01', n: 'Convenio comunidad: empleo local', fr: 'Semestral', ult: fd(dOff(-60)), ok: 'Cumple', dest: 'Comunidad', orig: 'RR. HH. (ERP) + acreditación' },
  { id: 'CMN-02', n: 'Convenio comunidad: compras locales', fr: 'Semestral', ult: fd(dOff(-60)), ok: 'Próximo a vencer', dest: 'Comunidad', orig: 'Abastecimiento (ERP)' },
];
export const HUELLA = { labels: ['Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct'], a1: [1.31, 1.28, 1.34, 1.27, 1.25, 1.30, 1.24], a2: [0.94, 0.95, 0.91, 0.93, 0.92, 0.9, 0.89], a3: [0.42, 0.41, 0.43, 0.4, 0.41, 0.4, 0.39] };

/* ---------- Administración ---------- */
export interface Usuario { id: string; nombre: string; correo: string; rol: string; rolL: string; estado: string; mfa: string; acceso: Date; idp: string }
export const USUARIOS: Usuario[] = Array.from({ length: 28 }, (_, i) => {
  const rl = ROLKEYS[i % ROLKEYS.length];
  const nm = i < 9 ? ROLES[ROLKEYS[i]].person.split(' (')[0] : fullName();
  const rol = i === 0 ? 'operador' : rl;
  return {
    id: 'U-' + (300 + i), nombre: nm,
    correo: i === 0 ? 'sin correo personal · credencial + PIN' : nm.toLowerCase().normalize('NFD').replace(/[^a-z ]/g, '').split(' ').slice(0, 2).join('.') + '@aranda.example',
    rol, rolL: ROLES[rol].label, estado: i % 9 === 4 ? 'Inactivo' : i % 11 === 7 ? 'Bloqueado' : 'Activo', mfa: i % 7 === 3 ? 'Pendiente' : 'Activo',
    acceso: dOff(-Math.floor(R() * 12), Math.floor(R() * 23), Math.floor(R() * 59)), idp: i === 0 ? 'Credencial de faena' : 'Directorio corporativo',
  };
});
export const PERMISOS = ['Ver trazabilidad', 'Aprobar lotes', 'Editar plan', 'Clasificar detenciones', 'Aprobar acreditaciones', 'Registrar incidentes', 'Ver datos sensibles (fatiga, salud)', 'Generar reportes a la autoridad', 'Administrar usuarios', 'Cambiar parámetros', 'Ver auditoría'];
export const MATRIZ: Record<string, number[]> = {
  operador: [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0], supervisor: [1, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0], planificacion: [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0], metalurgia: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  seguridad: [0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1], sustentabilidad: [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0], contratista: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], gerencia: [1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1], admin: [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1],
};
export interface Parametro { k: string; l: string; v: number; u: string; min: number; max: number; step: number; h: string }
export const PARAMS: Parametro[] = [
  { k: 'as', l: 'Límite contractual de arsénico en concentrado', v: 0.40, u: '%', min: 0.05, max: 1, step: 0.01, h: 'Supuesto ilustrativo, igual al del Anexo del Subdocumento 13 (el caso no entrega este valor). Se confirma con el contrato de cada comprador.' },
  { k: 'conc', l: 'Umbral de diferencia de conciliación', v: 2.0, u: '%', min: 0.5, max: 5, step: 0.1, h: 'Referencia de industria: bajo 2 %.' },
  { k: 'v1', l: 'Aviso de vencimiento · primer recordatorio', v: 30, u: 'días', min: 7, max: 60, step: 1, h: 'Se notifica a la vez a la persona, su empleador y Seguridad.' },
  { k: 'v15', l: 'Aviso de vencimiento · segundo recordatorio', v: 15, u: 'días', min: 7, max: 30, step: 1, h: 'Se notifica a la vez a la persona, su empleador y Seguridad.' },
  { k: 'v2', l: 'Aviso de vencimiento · tercer recordatorio', v: 7, u: 'días', min: 1, max: 15, step: 1, h: 'Se notifica a la vez a la persona, su empleador y Seguridad.' },
  { k: 'alerta', l: 'Máximo de alertas de mantenimiento por semana', v: 15, u: 'alertas', min: 5, max: 60, step: 1, h: 'Controla el ruido: sobre el máximo se agrupan y priorizan.' },
  { k: 'aut', l: 'Autonomía local garantizada sin enlace', v: 48, u: 'horas', min: 48, max: 96, step: 4, h: 'Compromiso mínimo de 48 h (criterio de aceptación 13), con sincronización en 4 horas o menos. Se puede ampliar, no reducir.' },
  { k: 'ses', l: 'Cierre de sesión por inactividad', v: 15, u: 'minutos', min: 5, max: 60, step: 5, h: 'No aplica a dispositivos de cabina durante el turno.' },
];
const ACC = ['Inició sesión', 'Aprobó acreditación', 'Rechazó acreditación', 'Modificó rol', 'Exportó informe', 'Cambió parámetro', 'Aprobó lote de embarque', 'Registró incidente', 'Clasificó detención', 'Generó reporte ambiental', 'Elevó privilegio (temporal)'];
export interface Auditoria { id: string; f: Date; u: string; rol: string; a: string; ip: string; hash: string }
export const AUDIT: Auditoria[] = Array.from({ length: 140 }, (_, i) => {
  const u = USUARIOS[Math.floor(R() * 20)];
  return { id: 'AU-' + (9000 - i), f: hace(i * 37 + Math.floor(R() * 20)), u: u.nombre, rol: u.rolL, a: pick(ACC), ip: `10.${Math.floor(R() * 40)}.${Math.floor(R() * 250)}.${Math.floor(R() * 250)}`, hash: Math.floor(R() * 0xffffff).toString(16).padStart(6, '0') + '…' };
});
export const NOTIFS: { t: string; d: string; h: string; k: string; solo?: string[]; no?: string[] }[] = [
  { t: '12 personas con documentos por vencer en 30 días', d: 'Se notificó a cada persona, su empleador y Seguridad.', h: '/acreditacion', k: 'warn', no: ['contratista'] },
  { t: '7 personas de tu empresa con documentos por vencer en 30 días', d: 'Se notificó a cada persona y a tu empresa. Renueva antes para evitar rechazos en portería.', h: '/acreditacion', k: 'warn', solo: ['contratista'] },
  { t: 'Detención de CF-07 sin clasificar (34 min)', d: 'Clasifica la causa para que cuente en el análisis de disponibilidad.', h: '/equipos/CF-07', k: 'warn', solo: ['supervisor'] },
  { t: 'Embarque E-2026-26: arsénico proyectado sobre el límite', d: 'Requiere revisar la mezcla antes de aprobar.', h: '/trazabilidad/lote/E-2026-26', k: 'err' },
  { t: 'Sincronización completa con la nube', d: 'Sin conflictos manuales.', h: '/conectividad', k: 'ok' },
];
