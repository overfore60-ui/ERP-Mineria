import { Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TR } from '../../core/data';
import { ToastService } from '../../core/toast.service';
import { dOff, fd, fdt, rng } from '../../core/util';
import { FileDrop } from '../../shared/forms';
import { HtmlPipe } from '../../shared/html.pipe';
import { Icon } from '../../shared/icon';
import { Modal } from '../../shared/modal';
import { PageHeader } from '../../shared/page-header';
import { Banner, Card, Empty, Estado, Tabs, Timeline } from '../../shared/ui';
import { diasTipo, diasTxt } from './comun';

/** Ficha de una persona acreditada: documentos con su vigencia, historial y credencial. */
@Component({
  selector: 'app-persona',
  templateUrl: './persona.html',
  imports: [RouterLink, FileDrop, HtmlPipe, Icon, Modal, PageHeader, Banner, Card, Empty, Estado, Tabs, Timeline],
})
export class Persona {
  private toast = inject(ToastService);
  readonly id = input.required<string>();
  readonly diasTxt = diasTxt;
  readonly diasTipo = diasTipo;
  readonly fd = fd;
  readonly dOff = dOff;
  readonly max = Math.max;
  readonly min = Math.min;
  private ver = signal(0);
  readonly t = computed(() => { this.ver(); const t = TR(this.id()); return t ? { ...t, docs: t.docs.map(x => ({ ...x })) } : undefined; });
  readonly iniciales = computed(() => this.t()?.nombre.split(' ').map(w => w[0]).slice(0, 2).join('') || '');
  /** Código QR ilustrativo, siempre igual para la misma persona. */
  readonly qr = computed(() => {
    const t = this.t(); if (!t) return '';
    const celdas = Array.from({ length: 100 }, (_, i) => rng(t.id.length * 7 + i)() > .5 ? `<rect x="${(i % 10) * 10}" y="${Math.floor(i / 10) * 10}" width="10" height="10" fill="#1E2B35"/>` : '').join('');
    return `<svg viewBox="0 0 100 100" width="120" role="img" aria-label="Código QR de la credencial" style="margin:10px auto;display:block">${celdas}</svg>`;
  });
  readonly tabs = [{ id: 'd', label: 'Documentos' }, { id: 'h', label: 'Historial' }];
  readonly tab = signal('d');
  readonly historial = [
    { t: 'Credencial emitida', w: fd(dOff(-120)), s: 'done' },
    { t: 'Examen de altura geográfica cargado', w: fd(dOff(-118)), s: 'done' },
    { t: 'Recordatorio automático (30 días)', w: fd(dOff(-6)), s: 'done', d: 'Enviado a la persona, al empleador y a Seguridad.' },
    { t: 'Último ingreso por portería', w: fdt(dOff(-1, 7, 52)), s: 'done' },
  ];

  renovando: number | null = null;
  readonly archivoListo = signal(false);

  recordar() { const t = this.t()!; this.toast.show(`Recordatorio enviado a ${t.nombre}, a ${t.empresa} y a Seguridad.`, 'ok'); }
  abrirRenovacion(i: number) { this.renovando = i; this.archivoListo.set(false); }
  guardarRenovacion() {
    if (!this.archivoListo()) { this.toast.show('Sube un archivo primero.', 'warn'); return; }
    const t = TR(this.id())!;
    t.docs[this.renovando!].dias = 365;
    t.min = Math.min(...t.docs.map(d => d.dias));
    t.estado = t.min < 0 ? 'Vencido' : t.min <= 30 ? 'Por vencer' : 'Habilitado';
    this.renovando = null;
    this.ver.update(v => v + 1);
    this.toast.show('Documento renovado y validado. Avisos reiniciados.', 'ok');
  }
}
