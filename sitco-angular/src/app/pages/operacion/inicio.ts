import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AUDIT, COMPROMISOS, CUMPL, EMBARQUES, EQUIPOS, FATIGA, ROLES, TRAB, USUARIOS } from '../../core/data';
import { gauge, line } from '../../core/charts';
import { SessionService } from '../../core/session.service';
import { SimService } from '../../core/sim.service';
import { ToastService } from '../../core/toast.service';
import { desde, fd, fdt, nd, nf } from '../../core/util';
import { HtmlPipe } from '../../shared/html.pipe';
import { Icon } from '../../shared/icon';
import { PageHeader } from '../../shared/page-header';
import { Banner, Estado, Kpi, Timeline } from '../../shared/ui';

type K = [string, string | number, string, string, 'good' | 'bad' | 'neu', string];
interface W { id: string; on: boolean }

const cnt = <T>(a: T[], f: (x: T) => boolean) => a.filter(f).length;
const detenidos = () => EQUIPOS.filter(e => e.estado === 'Detenido');

/** Componentes que puede tener el inicio de cada perfil. */
const TITULOS: Record<string, string> = {
  kpis: 'Indicadores de tu turno', pend: 'Mis pendientes', plan: 'Cumplimiento del plan', det: 'Equipos detenidos ahora', acr: 'Acreditaciones',
  conc: 'Diferencia de conciliación', amb: 'Compromisos ambientales', emb: 'Próximos embarques', conn: 'Continuidad operacional', act: 'Actividad reciente',
};
const POR_DEFECTO: Record<string, string[]> = {
  supervisor: ['kpis', 'pend', 'det', 'plan', 'act'], planificacion: ['kpis', 'pend', 'plan', 'det', 'emb'], metalurgia: ['kpis', 'pend', 'conc', 'emb', 'act'],
  seguridad: ['kpis', 'pend', 'acr', 'det', 'act'], sustentabilidad: ['kpis', 'pend', 'amb', 'conc', 'act'], contratista: ['kpis', 'pend', 'acr', 'act'],
  gerencia: ['kpis', 'pend', 'conc', 'plan', 'conn', 'amb'], admin: ['kpis', 'pend', 'conn', 'act'],
};
const PENDIENTES: Record<string, [string, string, string][]> = {
  supervisor: [['Clasificar la detención de CF-07 (34 min)', '/equipos/CF-07', 'cu'], ['Registrar acción ante 5 alertas de fatiga', '/seguridad', 'err'], ['Firmar inspección IP-120 (iluminación)', '/terreno', '']],
  planificacion: [['Revisar el cumplimiento del turno anterior', '/plan', 'cu'], ['Publicar ajuste: planta pide más oxidado', '/plan', ''], ['Confirmar polígonos del banco B2985', '/plan', '']],
  metalurgia: [['Resolver excepción de arsénico en E-2026-26', '/trazabilidad/lote/E-2026-26', 'err'], ['Explicar 2 diferencias de conciliación', '/conciliacion', 'cu'], ['Conformar lote E-2026-28', '/trazabilidad/nuevo', '']],
  seguridad: [['Aprobar 4 solicitudes de acreditación', '/acreditacion', 'cu'], ['Registrar acción: 5 alertas de fatiga', '/seguridad', 'err'], ['Revisar INC-0929 (lesión leve)', '/seguridad', 'err']],
  sustentabilidad: [['Enviar reporte del trimestre (aguas subterráneas)', '/ambiental', 'cu'], ['Revisar dato con retraso: relaves', '/ambiental', 'err'], ['Solicitar verificación del tercero (huella)', '/ambiental', '']],
  contratista: [['Renovar examen de altura de 3 trabajadores', '/acreditacion', 'err'], ['Subir curso de riesgos específicos', '/acreditacion', 'cu'], ['Completar solicitud S-0414 (borrador)', '/acreditacion/nueva', '']],
  gerencia: [['Aprobar lote E-2026-26 con excepción de arsénico', '/trazabilidad/lote/E-2026-26', 'err'], ['Revisar conciliación del mes', '/conciliacion', 'cu'], ['Autonomía sin enlace: informe de la última prueba', '/conectividad', '']],
  admin: [['Activar segundo factor a 4 usuarios', '/admin/usuarios', 'err'], ['Revisar elevaciones de privilegio', '/admin/auditoria', 'cu'], ['Cambiar umbral de alertas (propuesto)', '/admin/parametros', '']],
};

function indicadores(role: string): K[] {
  const det = detenidos().length, sc = cnt(detenidos(), e => e.det!.causa === 'Sin clasificar'), fat = cnt(FATIGA, f => !f.accion);
  const pv = cnt(TRAB, t => t.estado === 'Por vencer'), vc = cnt(TRAB, t => t.estado === 'Vencido');
  const k: Record<string, K[]> = {
    supervisor: [['Equipos detenidos', det, '', `${sc} sin clasificar`, sc ? 'bad' : 'good', '/equipos'], ['Utilización de flota', 74, '%', '▲ 3 pts vs línea base (71 %)', 'good', '/tablero/detalle/utilizacion'], ['Alertas de fatiga sin acción', fat, '', 'Cada una debe tener acción documentada', fat ? 'bad' : 'good', '/seguridad'], ['Cumplimiento del plan', 95, '%', 'Medido contra la versión vigente (v6)', 'good', '/plan']],
    planificacion: [['Cumplimiento (versión vigente)', 95, '%', 'Del turno anterior, disponible al inicio del turno', 'good', '/plan'], ['Versiones del plan esta semana', 6, '', 'Todas con motivo y autor', 'neu', '/plan'], ['Cumplimiento medido contra el domingo', 70, '%', 'Así se medía antes: engañoso', 'bad', '/plan'], ['Polígonos ajustados', 9, '', 'Notificados al despacho sin carga manual', 'good', '/plan']],
    metalurgia: [['Diferencia de conciliación (mes)', '2,6', '%', 'Línea base 2025: 3,1–6,8 %', 'good', '/conciliacion'], ['Días de cierre', 3, 'días háb.', 'Línea base: 18 días', 'good', '/conciliacion'], ['Lotes en conformación', cnt(EMBARQUES, e => ['En conformación', 'En muestreo', 'Pendiente de aprobación'].includes(e.estado)), '', 'Un lote con excepción de arsénico', 'bad', '/trazabilidad'], ['Origen de un lote', '1 min 48 s', '', 'Meta: menos de 2 horas', 'good', '/trazabilidad']],
    seguridad: [['Documentos por vencer (30 d)', pv, '', 'Ya notificados a persona, empleador y Seguridad', 'bad', '/acreditacion'], ['Con documentos vencidos', vc, '', 'No deben viajar a faena', 'bad', '/acreditacion'], ['Acreditación promedio', 38, 'h', 'Línea base: 9 días · meta < 48 h', 'good', '/acreditacion'], ['Alertas de fatiga sin acción', fat, '', 'Plazo: dentro del turno', fat ? 'bad' : 'good', '/seguridad']],
    sustentabilidad: [['Compromisos por vencer', cnt(COMPROMISOS, c => c.ok === 'Próximo a vencer'), '', 'RCA y convenio con la comunidad', 'bad', '/ambiental'], ['Huella de carbono', '2,52', 'tCO₂e/t Cu fino', 'Mensual y auditable (antes: anual)', 'good', '/ambiental'], ['Reportes listos para enviar', 2, '', 'Con trazabilidad hasta la medición', 'good', '/ambiental'], ['Datos con retraso', cnt(COMPROMISOS, c => c.ok === 'Dato con retraso'), '', 'Relaves: transmisión intermitente', 'bad', '/ambiental']],
    contratista: [['Trabajadores habilitados', 41, '', 'de 52 de tu empresa', 'good', '/acreditacion'], ['Por vencer en 30 días', 7, '', 'Renueva antes: evitas rechazos en portería', 'bad', '/acreditacion'], ['Con documentos vencidos', 2, '', 'No pueden ingresar', 'bad', '/acreditacion'], ['Solicitudes en curso', 2, '', 'Respuesta en menos de 48 h', 'neu', '/acreditacion']],
    gerencia: [['Diferencia de conciliación', '2,6', '%', 'Línea base 3,1–6,8 %', 'good', '/conciliacion'], ['Cumplimiento del plan', 95, '%', 'Contra la versión vigente', 'good', '/plan'], ['Utilización de flota', 74, '%', 'Meta interna: 80 %', 'neu', '/tablero/detalle/utilizacion'], ['Autonomía sin enlace', '48', 'h', 'Se verifica en la marcha blanca', 'good', '/conectividad']],
    admin: [['Usuarios activos', cnt(USUARIOS, u => u.estado === 'Activo'), '', `de ${USUARIOS.length} en el directorio`, 'neu', '/admin/usuarios'], ['Con segundo factor pendiente', cnt(USUARIOS, u => u.mfa === 'Pendiente'), '', 'Obligatorio para todos', 'bad', '/admin/usuarios'], ['Cuentas bloqueadas', cnt(USUARIOS, u => u.estado === 'Bloqueado'), '', 'Por intentos fallidos', 'bad', '/admin/usuarios'], ['Eventos auditados hoy', 412, '', 'Con retención declarada', 'neu', '/admin/auditoria']],
  };
  return k[role] || [];
}

const leer = (): Record<string, W[]> => { try { return JSON.parse(sessionStorage.getItem('ha.widgets') || '{}'); } catch { return {}; } };

/** Inicio por perfil: saludo, indicadores del turno y componentes que la persona puede ordenar u ocultar. */
@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.html',
  imports: [RouterLink, HtmlPipe, Icon, PageHeader, Banner, Estado, Kpi, Timeline],
})
export class Inicio {
  readonly ses = inject(SessionService);
  readonly sim = inject(SimService);
  private toast = inject(ToastService);
  readonly titulos = TITULOS;
  readonly nf = nf;
  readonly desde = desde;
  readonly editar = signal(false);
  private guardados = signal(leer());

  readonly rol = computed(() => this.ses.user()?.role || '');
  readonly saludo = computed(() => {
    const h = new Date().getHours();
    const s = h < 12 ? 'Buenos días' : h < 20 ? 'Buenas tardes' : 'Buenas noches';
    return `${s}, ${ROLES[this.rol()]?.person.split(' ')[0] || ''}`;
  });
  readonly sub = computed(() => {
    const h = new Date().getHours();
    return `${ROLES[this.rol()]?.label} · Turno ${h >= 8 && h < 20 ? 'día (08:00–20:00)' : 'noche (20:00–08:00)'} · ${fd(new Date())}`;
  });
  readonly lista = computed<W[]>(() => this.guardados()[this.rol()] || (POR_DEFECTO[this.rol()] || ['kpis']).map(id => ({ id, on: true })));
  readonly ocultos = computed(() => this.lista().filter(w => !w.on));
  readonly kpis = computed(() => indicadores(this.rol()));
  readonly pendientes = computed(() => PENDIENTES[this.rol()] || []);

  readonly detenidos = detenidos();
  readonly porVencer = cnt(TRAB, t => t.estado === 'Por vencer');
  readonly vencidos = cnt(TRAB, t => t.estado === 'Vencido');
  readonly compromisos = COMPROMISOS.filter(c => c.ok !== 'Cumple');
  readonly embarques = EMBARQUES.slice(0, 4);
  readonly actividad = AUDIT.slice(0, 5).map(a => ({ t: a.a, w: `${a.u} · ${fdt(a.f)}`, s: 'done' }));
  readonly grafPlan = line({ labels: CUMPL.labels, series: [{ name: 'Contra versión vigente', values: CUMPL.vigente, color: '#1F7A5C' }, { name: 'Contra plan del domingo', values: CUMPL.domingo, color: '#9C4A1F', dash: true }], min: 60, max: 100, fmt: v => nf(Math.round(v)) + '%', h: 200, label: 'Cumplimiento del plan por turno' });
  readonly grafConc = line({ labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct'], series: [{ name: 'Diferencia mensual (%)', values: [6.8, 5.9, 5.2, 4.7, 4.1, 3.6, 3.1, 2.9, 2.7, 2.6], color: '#9C4A1F' }], ref: 2, refLabel: 'Referencia de industria 2 %', min: 0, max: 8, fmt: v => nd(v, 0) + '%', h: 200, label: 'Diferencia de conciliación mensual' });
  readonly grafAcr = gauge({ value: 38, max: 48, target: 48, text: '38 h', sub: 'promedio de acreditación', label: 'Tiempo promedio de acreditación' });
  /** El medidor de continuidad cambia con el simulador de conectividad. */
  readonly grafConn = computed(() => gauge({ value: Math.min(this.sim.hours, 48), max: 48, target: 48, text: nd(this.sim.hours, 0) + ' h', sub: this.sim.link === 'down' ? 'sin enlace · autonomía usada' : 'enlace activo · autonomía 48 h', label: 'Autonomía sin enlace', good: this.sim.hours <= 36 }));

  alternarEdicion() {
    this.editar.update(v => !v);
    this.toast.show(this.editar() ? 'Modo personalizar: sube, baja u oculta componentes.' : 'Tablero guardado.', 'info', 2500);
  }
  private guardar(l: W[]) {
    const g = { ...this.guardados(), [this.rol()]: l };
    this.guardados.set(g);
    try { sessionStorage.setItem('ha.widgets', JSON.stringify(g)); } catch { /* sin almacenamiento */ }
  }
  mover(i: number, paso: number) {
    const l = this.lista().slice(), j = i + paso;
    if (j < 0 || j >= l.length) return;
    [l[i], l[j]] = [l[j], l[i]];
    this.guardar(l);
  }
  mostrar(id: string, on: boolean) { this.guardar(this.lista().map(w => (w.id === id ? { ...w, on } : w))); }
}
