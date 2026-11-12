import { Component, computed, inject, signal, viewChildren } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DOCS } from '../../core/data';
import { SessionService } from '../../core/session.service';
import { ToastService } from '../../core/toast.service';
import { Field, FileDrop, Regla, validarTodos } from '../../shared/forms';
import { Icon } from '../../shared/icon';
import { PageHeader } from '../../shared/page-header';
import { Stepper } from '../../shared/ui';
import { EMPRESA_DEMO } from './comun';

/** Nueva solicitud de acreditación en cuatro pasos; los documentos se validan al subirlos. */
@Component({
  selector: 'app-acreditacion-nueva',
  templateUrl: './acreditacion-nueva.html',
  imports: [FormsModule, RouterLink, Field, FileDrop, Regla, Icon, PageHeader, Stepper],
})
export class AcreditacionNueva {
  private ses = inject(SessionService);
  private toast = inject(ToastService);
  private reglas = viewChildren(Regla);
  private zonas = viewChildren(FileDrop);
  readonly pasos = ['Persona', 'Empresa y cargo', 'Documentos', 'Revisión'];
  readonly titulos = ['Datos de la persona', 'Empresa, cargo y turno', 'Documentos de habilitación', 'Revisa y envía'];
  readonly docs = DOCS;
  readonly paso = signal(0);
  readonly propia = computed(() => this.ses.user()?.role === 'contratista');
  d = { pn: '', pr: '', pt: '', pf: '', emp: this.ses.user()?.role === 'contratista' ? EMPRESA_DEMO : '', car: '', fi: '', tu: '7x7 A', c1: false };
  readonly cargados = signal(0);
  readonly enviada = signal('');

  atras() { this.paso.update(p => p - 1); }
  guardar() { this.toast.show('Borrador guardado en el equipo y en la nube (cuando haya enlace).', 'ok'); }
  continuar() {
    if (!validarTodos(this.reglas())) { this.toast.show('Revisa los campos marcados antes de continuar.', 'warn'); return; }
    if (this.paso() === 2 && this.cargados() < 5) { this.toast.show('Sube los cinco documentos.', 'warn'); return; }
    if (this.paso() === 3) {
      this.enviada.set('S-0' + (416 + Math.floor(Math.random() * 90)));
      this.toast.show('Solicitud enviada a Seguridad y Salud Ocupacional.', 'ok');
      return;
    }
    this.paso.update(p => p + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  ejemplos() { this.zonas().forEach((z, i) => { if (!z.archivos().length) z.agregar(DOCS[i].toLowerCase().replace(/ /g, '-') + '.pdf'); }); }
}
