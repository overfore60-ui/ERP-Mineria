import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TRAB, Trabajador } from '../../core/data';
import { SessionService } from '../../core/session.service';
import { SimService } from '../../core/sim.service';
import { ToastService } from '../../core/toast.service';
import { dOff, fd, ft, hace, rng, uid } from '../../core/util';
import { Cell, Col, DataTable } from '../../shared/data-table';
import { Field } from '../../shared/forms';
import { Icon } from '../../shared/icon';
import { PageHeader } from '../../shared/page-header';
import { Card, Empty, Estado, Kpi } from '../../shared/ui';

interface Ingreso { id: string; nombre: string; empresa: string; f: Date; res: string; motivo: string }

/** Bitácora del turno (se conserva mientras dure la sesión). */
const BITACORA: Ingreso[] = [];
{
  const r = rng(4242);
  for (let i = 0; i < 14; i++) {
    const t = TRAB[Math.floor(r() * TRAB.length)];
    if (t.estado === 'Vencido' || t.estado === 'En revisión') continue;
    BITACORA.push({ id: 'IN-' + (7100 + i), nombre: t.nombre, empresa: t.empresa, f: hace(8 + i * 23), res: 'Ingresó', motivo: t.estado === 'Por vencer' ? 'Habilitado · documento por vencer, ya avisado' : 'Habilitado' });
  }
}

interface Lectura { t: Trabajador; tipo: 'ok' | 'warn' | 'err'; titulo: string; doc: string; vence: string; dias: number; avisos: string[]; caso: string }

/** Consola de portería (Acreditación y Acceso · criterio 7): lo que ve el guardia al leer una credencial. */
@Component({
  selector: 'app-porteria',
  templateUrl: './porteria.html',
  imports: [RouterLink, DataTable, Cell, Field, Icon, PageHeader, Card, Empty, Estado, Kpi],
})
export class Porteria {
  private sim = inject(SimService);
  readonly ses = inject(SessionService);
  private toast = inject(ToastService);
  readonly ft = ft;
  readonly bitacora = signal([...BITACORA]);
  readonly rechazos = computed(() => this.bitacora().filter(x => x.res !== 'Ingresó').length);
  readonly porVencido = computed(() => this.bitacora().filter(x => / vencido$/.test(x.motivo)).length);
  readonly avisados = TRAB.filter(t => t.min <= 30).length;
  readonly cols: Col<Ingreso>[] = [
    { key: 'f', label: 'Hora', sortv: r => r.f.getTime() }, { key: 'nombre', label: 'Persona' }, { key: 'empresa', label: 'Empresa' }, { key: 'res', label: 'Resultado' }, { key: 'motivo', label: 'Motivo' },
  ];
  busqueda = '';
  readonly lectura = signal<Lectura | null>(null);

  leer(k: 'ok' | 'warn' | 'err' | 'q') {
    let t: Trabajador | undefined;
    if (k === 'q') {
      const v = this.busqueda.trim().toLowerCase();
      t = v ? TRAB.find(x => `${x.nombre} · ${x.rut}`.toLowerCase().includes(v) || x.rut.toLowerCase() === v) : undefined;
      if (!t) { this.toast.show('No se encontró a esa persona. Revisa el nombre o el RUT.', 'warn'); document.getElementById('pt-q')?.focus(); return; }
    } else t = TRAB.find(x => (k === 'ok' ? x.estado === 'Habilitado' : k === 'warn' ? x.estado === 'Por vencer' : x.estado === 'Vencido'))!;

    const venc = t.docs.slice().sort((a, b) => a.dias - b.dias)[0];
    const avisos = [30, 15, 7].map(n => fd(dOff(venc.dias - n)));
    let tipo: Lectura['tipo'] = 'ok', titulo = 'Puede ingresar', res = 'Ingresó', motivo = 'Habilitado', caso = 'vigente';
    if (t.estado === 'Vencido') { tipo = 'err'; titulo = 'No puede ingresar'; res = 'Rechazado'; motivo = `${venc.d} vencido`; caso = 'vencido'; }
    else if (t.estado === 'En revisión') { tipo = 'warn'; titulo = 'Acreditación en revisión'; res = 'Rechazado'; motivo = 'Acreditación en revisión'; caso = 'revision'; }
    else if (t.estado === 'Por vencer') { motivo = 'Habilitado · documento por vencer, ya avisado'; caso = 'porvencer'; }
    this.lectura.set({ t, tipo, titulo, doc: venc.d, vence: fd(dOff(venc.dias)), dias: venc.dias, avisos, caso });

    BITACORA.unshift({ id: uid('IN'), nombre: t.nombre, empresa: t.empresa, f: new Date(), res, motivo });
    this.bitacora.set([...BITACORA]);
    this.sim.capture('acceso', `${res === 'Ingresó' ? 'Ingreso' : 'Rechazo'} en portería · ${t.nombre}`, 'Consola de Portería');
  }
  avisarSeguridad() { this.toast.show('Aviso enviado a Seguridad con el motivo del rechazo.', 'ok'); }
}
