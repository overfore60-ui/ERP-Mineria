import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MODULOS, NAV, ROLES } from '../../core/data';
import { SessionService } from '../../core/session.service';
import { esc } from '../../core/util';
import { HtmlPipe } from '../../shared/html.pipe';
import { PageHeader } from '../../shared/page-header';
import { Tabs } from '../../shared/ui';

/** Mapa del sitio: secciones con sus pantallas (↳ = segundo nivel). */
export const SITEMAP = [
  { g: 'Público', c: '#4A5A66', items: [['Portal público', '/'], ['Iniciar sesión', '/login'], ['Segundo factor', '/2fa'], ['Recuperar acceso', '/recuperar'], ['Registro de contratista (5 pasos)', '/registro']] },
  { g: 'Operación', c: '#9C4A1F', items: [['Inicio (por perfil)', '/inicio'], ['Centro de control', '/control'], ['Terreno (móvil)', '/terreno'], ['Trazabilidad de lotes', '/trazabilidad'], ['↳ Detalle de lote', '/trazabilidad/lote/E-2026-26'], ['↳ Conformar lote (7 pasos)', '/trazabilidad/nuevo'], ['Conciliación metalúrgica', '/conciliacion'], ['Plan minero y versiones', '/plan'], ['Perforación y pozos', '/perforacion'], ['Equipos y detenciones', '/equipos'], ['↳ Vista única del equipo', '/equipos/CF-07']] },
  { g: 'Personas y cumplimiento', c: '#1F7A5C', items: [['Acreditación', '/acreditacion'], ['↳ Ficha de persona', '/acreditacion/W-2100'], ['↳ Nueva acreditación', '/acreditacion/nueva'], ['Consola de portería', '/porteria'], ['Seguridad y fatiga', '/seguridad'], ['Ambiental y huella', '/ambiental'], ['Terceros', '/terceros'], ['↳ Ficha de tercero', '/terceros/T-1000']] },
  { g: 'Análisis', c: '#1E2B35', items: [['Tablero analítico', '/tablero'], ['↳ Detalle de indicador', '/tablero/detalle/utilizacion']] },
  { g: 'Plataforma', c: '#7E3A16', items: [['Conectividad y nube', '/conectividad'], ['Integrador de sistemas', '/integrador'], ['Administración · Usuarios', '/admin/usuarios'], ['↳ Roles y permisos', '/admin/roles'], ['↳ Parametrización', '/admin/parametros'], ['↳ Auditoría', '/admin/auditoria'], ['Ayuda y accesibilidad', '/ayuda']] },
  { g: 'Documentación', c: '#4A5A66', items: [['Arquitectura de información', '/arquitectura-informacion'], ['Sistema de diseño', '/sistema-diseno']] },
];

/** Diagrama de navegación: portal → seis áreas → pantallas. */
function diagrama() {
  const rowH = 26, x0 = 20;
  let y = 20, enlaces = '';
  const pos: { g: (typeof SITEMAP)[number]; mid: number; a: number; b: number }[] = [];
  SITEMAP.forEach(g => {
    const ini = y;
    g.items.forEach(it => {
      const hoja = it[0].startsWith('↳');
      enlaces += `<a href="#${it[1]}"><g><rect x="${x0 + 520}" y="${y}" width="${hoja ? 240 : 250}" height="22" rx="5" fill="#fff" stroke="${g.c}" stroke-width="${hoja ? 1 : 2}" ${hoja ? 'stroke-dasharray="3 3"' : ''} transform="translate(${hoja ? 10 : 0},0)"/><text x="${x0 + 530 + (hoja ? 10 : 0)}" y="${y + 15}" style="font-size:12px;fill:#1E2B35">${esc(it[0])}</text></g></a>`;
      y += rowH;
    });
    pos.push({ g, mid: (ini + y - rowH + 22) / 2, a: ini, b: y - rowH + 11 });
    y += 10;
  });
  const alto = y + 10, raiz = alto / 2;
  let s = `<rect x="${x0}" y="${raiz - 28}" width="140" height="56" rx="12" fill="#1E2B35"/><text x="${x0 + 70}" y="${raiz - 4}" text-anchor="middle" style="font:700 15px var(--font-titulo);fill:#fff">SITCO Aranda</text><text x="${x0 + 70}" y="${raiz + 14}" text-anchor="middle" style="font-size:11px;fill:#DCE2E6">Portal</text>`;
  pos.forEach(p => {
    s += `<path d="M${x0 + 140} ${raiz} C ${x0 + 200} ${raiz}, ${x0 + 200} ${p.mid}, ${x0 + 250} ${p.mid}" fill="none" stroke="${p.g.c}" stroke-width="2"/><rect x="${x0 + 250}" y="${p.mid - 18}" width="210" height="36" rx="10" fill="${p.g.c}"/><text x="${x0 + 355}" y="${p.mid + 5}" text-anchor="middle" style="font:700 13px var(--font-titulo);fill:#fff">${p.g.g}</text><path d="M${x0 + 460} ${p.mid} H${x0 + 490} V${p.a + 11} V${p.b} M${x0 + 490} ${p.a + 11} H${x0 + 520}" fill="none" stroke="${p.g.c}" stroke-width="1.5"/>`;
    let yy = p.a;
    p.g.items.forEach(() => { s += `<path d="M${x0 + 490} ${yy + 11} H${x0 + 520}" stroke="${p.g.c}" stroke-width="1.5"/>`; yy += rowH; });
  });
  return `<svg class="chart" viewBox="0 0 820 ${alto}" role="img" aria-label="Diagrama de navegación del prototipo: portal, seis áreas y sus pantallas">${s}${enlaces}</svg>`;
}

const TAXONOMIA = [['Lote', 'Embarque comercial de concentrado, trazable a polígonos', 'Embarque (cuando es el evento), partida'], ['Polígono', 'Sector acotado de un banco con ley estimada y destino', 'Zona, bloque'], ['Banco', 'Nivel de extracción del rajo', 'Piso'], ['Stock intermedio', 'Acopio entre mina y planta; trazado por capas', 'Pulmón (jerga), cancha'], ['Nodo de Faena', 'Servidores locales que operan sin enlace', 'Servidor local, edge'], ['Cambio de material', 'Aviso del operador de que el material difiere del plan', 'Reporte de calidad'], ['Versión del plan', 'Estado versionado del plan semanal con motivo', 'Plan actualizado'], ['Habilitado / Por vencer / Vencido', 'Estados de acreditación de una persona', 'Aprobado / Caducado'], ['Detención', 'Equipo parado, con causa raíz clasificada', 'Demora (si está clasificada)'], ['Aviso de falla', 'Registro de falla que se entrega a SAP', 'Orden de trabajo (la emite SAP)'], ['Conciliación', 'Cuadre mina–planta–embarque por punto de la cadena', 'Balance (es otro proceso)'], ['Cadena de custodia', 'Evidencia verificable del origen a destino', 'Historial']];

/** Arquitectura de información (RT-25.09): mapa del sitio, módulos, navegación, taxonomía, menús y jerarquía. */
@Component({
  selector: 'app-arquitectura',
  templateUrl: './arquitectura.html',
  imports: [RouterLink, HtmlPipe, PageHeader, Tabs],
})
export class Arquitectura {
  readonly ses = inject(SessionService);
  readonly tabs = [{ id: 'm', label: 'Mapa del sitio' }, { id: 'o', label: 'Módulos de la solución' }, { id: 'd', label: 'Diagrama de navegación' }, { id: 't', label: 'Taxonomía y nomenclatura' }, { id: 'e', label: 'Menús por perfil' }, { id: 'j', label: 'Jerarquía' }];
  readonly tab = signal('m');
  readonly sitemap = SITEMAP;
  readonly totalPantallas = SITEMAP.reduce((a, g) => a + g.items.length, 0);
  readonly diagrama = diagrama();
  readonly taxonomia = TAXONOMIA;
  readonly roles = Object.values(ROLES);
  readonly secciones = NAV.flatMap(g => g.items);
  readonly modulos = MODULOS.map(m => ({ ...m, pantallas: m.items.map(id => this.secciones.find(i => i.id === id)).filter(x => !!x) }));
}
