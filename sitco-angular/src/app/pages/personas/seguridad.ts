import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AlertaFatiga, FATIGA, INCIDENTES, INSPECCIONES, Incidente } from '../../core/data';
import { SessionService } from '../../core/session.service';
import { ToastService } from '../../core/toast.service';
import { fdt, ft } from '../../core/util';
import { Cell, Col, DataTable } from '../../shared/data-table';
import { ExportDialog } from '../../shared/export-dialog';
import { Icon } from '../../shared/icon';
import { Modal } from '../../shared/modal';
import { PageHeader } from '../../shared/page-header';
import { Banner, Estado, Kpi, Menu, Tabs, Timeline } from '../../shared/ui';
import { cnt } from './comun';

/** Seguridad y salud ocupacional: incidentes firmados en terreno, alertas de fatiga con acción documentada e inspecciones. */
@Component({
  selector: 'app-seguridad',
  templateUrl: './seguridad.html',
  imports: [FormsModule, RouterLink, DataTable, Cell, ExportDialog, Icon, Modal, PageHeader, Banner, Estado, Kpi, Menu, Tabs, Timeline],
})
export class Seguridad {
  readonly ses = inject(SessionService);
  private toast = inject(ToastService);
  readonly fdt = fdt;
  readonly ft = ft;
  readonly incidentes = INCIDENTES;
  readonly inspecciones = INSPECCIONES;
  readonly enInvestigacion = cnt(INCIDENTES, i => i.estado === 'En investigación');
  readonly fatiga = signal([...FATIGA]);
  readonly sinAccion = computed(() => cnt(this.fatiga(), f => !f.accion));
  readonly tabs = [{ id: 'i', label: 'Incidentes e inspecciones' }, { id: 'f', label: 'Alertas de fatiga' }, { id: 'n', label: 'Inspecciones planificadas' }];
  readonly tab = signal('i');
  readonly colsInc: Col<Incidente>[] = [
    { key: 'id', label: 'Registro' }, { key: 'tipo', label: 'Tipo' }, { key: 'lugar', label: 'Lugar' }, { key: 'f', label: 'Fecha', sortv: r => r.f.getTime() },
    { key: 'sev', label: 'Severidad' }, { key: 'estado', label: 'Estado' }, { key: 'acc', label: '', nosort: true },
  ];
  readonly filtrosInc = [
    { key: 'tipo', label: 'Tipo', options: ['Cuasi accidente', 'Observación de conducta', 'Incidente con lesión leve', 'Inspección planificada'] },
    { key: 'estado', label: 'Estado', options: ['En investigación', 'Cerrado'] },
  ];
  readonly colsFat: Col<AlertaFatiga>[] = [
    { key: 'id', label: 'Alerta' }, { key: 'eq', label: 'Equipo' }, { key: 'op', label: 'Operador' }, { key: 'tipo', label: 'Tipo' },
    { key: 'f', label: 'Hora', sortv: r => r.f.getTime() }, { key: 'accion', label: 'Acción documentada', sortv: r => (r.accion ? 1 : 0) }, { key: 'acc', label: '', nosort: true },
  ];
  readonly acciones = ['Pausa activa de 15 min', 'Relevo del operador', 'Contacto por radio y verificación', 'Cambio de turno anticipado'];

  viendo: Incidente | null = null;
  exportando = '';
  exportar = false;
  alerta: AlertaFatiga | null = null;
  accion = this.acciones[0];
  comentario = '';

  traza(i: Incidente) {
    return [
      { t: 'Registro creado en terreno', w: fdt(i.f), s: 'done' },
      { t: 'Sincronizado al Nodo de Faena', w: fdt(new Date(i.f.getTime() + 60000)), s: 'done' },
      { t: 'Disponible para fiscalización', w: fdt(new Date(i.f.getTime() + 3600000)), s: 'done' },
    ];
  }
  exportarInc(id: string) { this.exportando = `Registro ${id} para fiscalización`; this.exportar = true; }
  abrirAccion(f: AlertaFatiga) { this.alerta = f; this.accion = this.acciones[0]; this.comentario = ''; }
  guardarAccion() {
    const f = FATIGA.find(x => x.id === this.alerta!.id)!;
    f.accion = this.accion;
    f.por = this.ses.rol()?.person || '';
    this.fatiga.set([...FATIGA]);
    this.alerta = null;
    this.toast.show(`Acción registrada para ${f.id}. Trazable ante cualquier consulta de la autoridad.`, 'ok');
  }
}
