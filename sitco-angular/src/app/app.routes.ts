import { inject } from '@angular/core';
import { CanActivateChildFn, Router, Routes } from '@angular/router';
import { DatosRuta, Miga } from './core/page.service';
import { SessionService } from './core/session.service';
import { ToastService } from './core/toast.service';
import { DETALLE } from './pages/analisis/tablero-datos';

/** Las pantallas internas piden sesión; si no hay, se recuerda la ruta y se va al ingreso. */
const conSesion: CanActivateChildFn = (_r, state) => {
  const ses = inject(SessionService);
  if (ses.user()) return true;
  ses.siguiente = state.url;
  return inject(Router).parseUrl('/login');
};

const publico: DatosRuta = { publico: true, rapido: true };
const ini: Miga = ['Inicio', '/inicio'];
const d = (item: string, migas?: DatosRuta['migas'], extra: Partial<DatosRuta> = {}): DatosRuta => ({ item, migas, ...extra });
const doc = (s: string): DatosRuta => ({ migas: () => [ini, [s, '']] });
const admin = (s: string) => (): Miga[] => [ini, ['Administración', '/admin/usuarios'], [s, '']];

export const routes: Routes = [
  /* ---------- Portal público y acceso ---------- */
  { path: '', pathMatch: 'full', title: 'Inicio', data: publico, loadComponent: () => import('./pages/publico/portada').then(m => m.Portada) },
  { path: 'login', title: 'Iniciar sesión', data: publico, loadComponent: () => import('./pages/publico/login').then(m => m.Login) },
  { path: '2fa', title: 'Segundo factor', data: publico, loadComponent: () => import('./pages/publico/dos-factores').then(m => m.DosFactores) },
  { path: 'recuperar', title: 'Recuperar acceso', data: publico, loadComponent: () => import('./pages/publico/recuperar').then(m => m.Recuperar) },
  { path: 'registro', title: 'Registro de empresa contratista', data: publico, loadComponent: () => import('./pages/publico/registro').then(m => m.Registro) },
  {
    path: 'conectividad-demo', redirectTo: () => {
      const ses = inject(SessionService);
      if (ses.user()) return ses.permitidoRuta('/conectividad') ? '/conectividad' : '/inicio';
      inject(ToastService).show('Inicia sesión para ver el estado de la conectividad.', 'info');
      return '/login';
    },
  },

  /* ---------- Pantallas con sesión ---------- */
  {
    path: '', canActivateChild: [conSesion], children: [
      /* Operación */
      { path: 'inicio', title: 'Inicio', data: d('inicio'), loadComponent: () => import('./pages/operacion/inicio').then(m => m.Inicio) },
      { path: 'trazabilidad', title: 'Trazabilidad de lotes', data: d('trazabilidad', () => [ini, ['Trazabilidad de lotes', '']]), loadComponent: () => import('./pages/operacion/trazabilidad').then(m => m.Trazabilidad) },
      { path: 'trazabilidad/lote/:id', title: 'Detalle de lote', data: d('trazabilidad', p => [ini, ['Trazabilidad de lotes', '/trazabilidad'], [p['id'], '']]), loadComponent: () => import('./pages/operacion/lote').then(m => m.Lote) },
      { path: 'trazabilidad/nuevo', title: 'Conformar lote de embarque', data: d('trazabilidad', () => [ini, ['Trazabilidad de lotes', '/trazabilidad'], ['Conformar lote', '']]), loadComponent: () => import('./pages/operacion/lote-nuevo').then(m => m.LoteNuevo) },
      { path: 'conciliacion', title: 'Conciliación metalúrgica', data: d('conciliacion', () => [ini, ['Conciliación metalúrgica', '']]), loadComponent: () => import('./pages/operacion/conciliacion').then(m => m.Conciliacion) },
      { path: 'plan', title: 'Plan minero y versiones', data: d('plan', () => [ini, ['Plan minero y versiones', '']]), loadComponent: () => import('./pages/operacion/plan').then(m => m.Plan) },
      { path: 'equipos', title: 'Equipos y detenciones', data: d('equipos', () => [ini, ['Equipos y detenciones', '']]), loadComponent: () => import('./pages/operacion/equipos').then(m => m.Equipos) },
      { path: 'equipos/:id', title: 'Vista única del equipo', data: d('equipos', p => [ini, ['Equipos y detenciones', '/equipos'], [p['id'], '']]), loadComponent: () => import('./pages/operacion/equipo').then(m => m.Equipo) },

      { path: 'control', title: 'Centro de control', data: d('control', () => [ini, ['Centro de control', '']]), loadComponent: () => import('./pages/control/control').then(m => m.Control) },
      { path: 'perforacion', title: 'Perforación y pozos', data: d('perforacion', () => [ini, ['Perforación y pozos', '']]), loadComponent: () => import('./pages/operacion/perforacion').then(m => m.Perforacion) },
      { path: 'terreno', title: 'Terreno (móvil)', data: d('terreno', () => [ini, ['Terreno', '']]), loadComponent: () => import('./pages/operacion/terreno').then(m => m.Terreno) },

      /* Personas y cumplimiento */
      { path: 'acreditacion', title: 'Acreditación de personas', data: d('acreditacion', () => [ini, ['Acreditación', '']]), loadComponent: () => import('./pages/personas/acreditacion').then(m => m.Acreditacion) },
      { path: 'acreditacion/nueva', title: 'Nueva acreditación', data: d('acreditacion', () => [ini, ['Acreditación', '/acreditacion'], ['Nueva', '']]), loadComponent: () => import('./pages/personas/acreditacion-nueva').then(m => m.AcreditacionNueva) },
      { path: 'acreditacion/:id', title: 'Ficha de persona', data: d('acreditacion', p => [ini, ['Acreditación', '/acreditacion'], [p['id'], '']]), loadComponent: () => import('./pages/personas/persona').then(m => m.Persona) },
      { path: 'porteria', title: 'Consola de portería', data: d('porteria', () => [ini, ['Acreditación', '/acreditacion'], ['Consola de portería', '']]), loadComponent: () => import('./pages/personas/porteria').then(m => m.Porteria) },
      { path: 'seguridad', title: 'Seguridad y fatiga', data: d('seguridad', () => [ini, ['Seguridad y fatiga', '']]), loadComponent: () => import('./pages/personas/seguridad').then(m => m.Seguridad) },
      { path: 'ambiental', title: 'Ambiental y huella de carbono', data: d('ambiental', () => [ini, ['Ambiental y huella', '']]), loadComponent: () => import('./pages/personas/ambiental').then(m => m.Ambiental) },
      { path: 'terceros', title: 'Gestión de terceros', data: d('terceros', () => [ini, ['Terceros', '']]), loadComponent: () => import('./pages/personas/terceros').then(m => m.Terceros) },
      { path: 'terceros/:id', title: 'Ficha de tercero', data: d('terceros', p => [ini, ['Terceros', '/terceros'], [p['id'], '']]), loadComponent: () => import('./pages/personas/tercero').then(m => m.TerceroFicha) },

      /* Portal para Compradores */
      { path: 'compradores', title: 'Mis embarques', data: d('compradores', () => [['Mis embarques', '']]), loadComponent: () => import('./pages/comercial/compradores').then(m => m.Compradores) },

      /* Análisis */
      { path: 'tablero', title: 'Tablero analítico', data: d('tablero', () => [ini, ['Tablero analítico', '']]), loadComponent: () => import('./pages/analisis/tablero').then(m => m.Tablero) },
      { path: 'tablero/detalle/:k', title: 'Detalle del indicador', data: d('tablero', p => [ini, ['Tablero analítico', '/tablero'], [(DETALLE[p['k']] || ['Detalle'])[0], '']]), loadComponent: () => import('./pages/analisis/tablero-detalle').then(m => m.TableroDetalle) },

      /* Plataforma */
      { path: 'conectividad', title: 'Conectividad y nube', data: d('conectividad', () => [ini, ['Conectividad y nube', '']]), loadComponent: () => import('./pages/plataforma/conectividad').then(m => m.Conectividad) },
      { path: 'integrador', title: 'Integrador de sistemas', data: d('integrador', () => [ini, ['Integrador de sistemas', '']]), loadComponent: () => import('./pages/plataforma/integrador').then(m => m.Integrador) },
      { path: 'admin', pathMatch: 'full', redirectTo: 'admin/usuarios' },
      { path: 'admin/usuarios', title: 'Usuarios', data: d('admin', admin('Usuarios')), loadComponent: () => import('./pages/admin/usuarios').then(m => m.Usuarios) },
      { path: 'admin/roles', title: 'Roles y permisos', data: d('admin', admin('Roles y permisos')), loadComponent: () => import('./pages/admin/roles').then(m => m.Roles) },
      { path: 'admin/parametros', title: 'Parametrización', data: d('admin', admin('Parametrización')), loadComponent: () => import('./pages/admin/parametros').then(m => m.Parametros) },
      { path: 'admin/auditoria', title: 'Auditoría', data: d('admin', admin('Auditoría')), loadComponent: () => import('./pages/admin/auditoria').then(m => m.Auditoria) },
    ],
  },

  /* ---------- Documentación (con o sin sesión) ---------- */
  { path: 'ayuda', title: 'Ayuda y accesibilidad', data: doc('Ayuda y accesibilidad'), loadComponent: () => import('./pages/docs/ayuda').then(m => m.Ayuda) },
  { path: 'arquitectura-informacion', title: 'Arquitectura de información', data: doc('Arquitectura de información'), loadComponent: () => import('./pages/docs/arquitectura').then(m => m.Arquitectura) },
  { path: 'sistema-diseno', title: 'Sistema de diseño', data: doc('Sistema de diseño'), loadComponent: () => import('./pages/docs/sistema-diseno').then(m => m.SistemaDiseno) },

  { path: '**', title: 'Página no encontrada', data: publico, loadComponent: () => import('./pages/no-encontrada').then(m => m.NoEncontrada) },
];
