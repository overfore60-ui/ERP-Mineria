import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { COMPROMISOS, Compromiso, HUELLA } from '../../core/data';
import { donut, gauge, stack } from '../../core/charts';
import { ToastService } from '../../core/toast.service';
import { isoDia, nd } from '../../core/util';
import { Cell, Col, DataTable } from '../../shared/data-table';
import { HtmlPipe } from '../../shared/html.pipe';
import { Icon } from '../../shared/icon';
import { Modal } from '../../shared/modal';
import { PageHeader } from '../../shared/page-header';
import { Estado, Kpi, Tabs, Timeline } from '../../shared/ui';
import { cnt } from './comun';

/** Cumplimiento ambiental, huella de carbono, agua por área y convenio con la comunidad. */
@Component({
  selector: 'app-ambiental',
  templateUrl: './ambiental.html',
  imports: [FormsModule, DataTable, Cell, HtmlPipe, Icon, Modal, PageHeader, Estado, Kpi, Tabs, Timeline],
})
export class Ambiental {
  private toast = inject(ToastService);
  readonly compromisos = COMPROMISOS;
  readonly alDia = `${cnt(COMPROMISOS, c => c.ok === 'Cumple')} de ${COMPROMISOS.length}`;
  readonly tabs = [{ id: 'c', label: 'Compromisos' }, { id: 'h', label: 'Huella de carbono' }, { id: 'a', label: 'Agua por área' }, { id: 'm', label: 'Comunidad' }];
  readonly tab = signal('c');
  readonly cols: Col<Compromiso>[] = [
    { key: 'id', label: 'Código' }, { key: 'n', label: 'Compromiso' }, { key: 'fr', label: 'Frecuencia' }, { key: 'ult', label: 'Última medición' },
    { key: 'dest', label: 'Destinatario' }, { key: 'ok', label: 'Estado' }, { key: 'acc', label: '', nosort: true },
  ];
  readonly huella = stack({ labels: HUELLA.labels, series: [{ name: 'Alcance 1', values: HUELLA.a1, color: '#1E2B35' }, { name: 'Alcance 2', values: HUELLA.a2, color: '#9C4A1F' }, { name: 'Alcance 3', values: HUELLA.a3, color: '#8A6A3E' }], fmt: v => nd(v, 1), label: 'Huella de carbono mensual por alcance' });
  readonly octubre = donut({ items: [{ label: 'Alcance 1', value: 1.24, color: '#1E2B35' }, { label: 'Alcance 2', value: 0.89, color: '#9C4A1F' }, { label: 'Alcance 3', value: 0.39, color: '#8A6A3E' }], big: '2,52', small: 'tCO₂e / t Cu fino', label: 'Composición de la huella del último mes' });
  readonly agua = stack({ labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'], series: [{ name: 'Planta', values: [4510, 4620, 4480, 4700, 4560, 4390, 4450], color: '#1E2B35' }, { name: 'Campamento', values: [1040, 1010, 1060, 1030, 1020, 1090, 1100], color: '#9C4A1F' }, { name: 'Supresión de polvo', values: [1650, 1500, 1720, 1380, 1590, 1450, 1520], color: '#1F7A5C' }], label: 'Agua por área durante la semana' });
  readonly empleo = gauge({ value: 34, max: 50, target: 30, text: '34 %', sub: 'meta del convenio: 30 %', label: 'Empleo local' });
  readonly compras = gauge({ value: 22, max: 50, target: 25, text: '22 %', sub: 'meta del convenio: 25 %', good: false, label: 'Compras locales' });
  readonly leyHuella = [['Alcance 1 · combustibles', '#1E2B35'], ['Alcance 2 · electricidad', '#9C4A1F'], ['Alcance 3 · cadena', '#8A6A3E']];
  readonly leyAgua = [['Planta', '#1E2B35'], ['Campamento', '#9C4A1F'], ['Supresión de polvo', '#1F7A5C']];

  linaje: Compromiso | null = null;
  generar = false;
  verificar = false;
  readonly reportes = ['Reporte trimestral de monitoreo ambiental', 'Reporte de agua subterránea', 'Reporte semestral del convenio con la comunidad'];
  reporte = this.reportes[0];
  hasta = isoDia(0);
  readonly progreso = signal(0);

  traza(c: Compromiso) {
    return [
      { t: 'Reporte a ' + c.dest, w: 'Generado por el sistema', s: 'done' },
      { t: 'Consolidación y validación', w: 'Reglas de calidad de dato', s: 'done' },
      { t: 'Medición de origen', w: c.orig, s: c.ok === 'Dato con retraso' ? 'warn' : 'done', d: c.ok === 'Dato con retraso' ? 'Transmisión intermitente: el dato llegó con retraso y se marcó.' : 'Sin intervención manual.' },
    ];
  }
  generarReporte() {
    if (!this.hasta) return;
    const t = setInterval(() => {
      this.progreso.update(p => p + 17);
      if (this.progreso() >= 100) {
        clearInterval(t);
        this.generar = false;
        this.progreso.set(0);
        this.toast.show('Reporte generado con trazabilidad hasta la medición de origen. Listo para revisión y envío.', 'ok', 6000);
      }
    }, 250);
  }
  solicitarVerificacion() { this.verificar = false; this.toast.show('Solicitud enviada al verificador.', 'ok'); }
}
