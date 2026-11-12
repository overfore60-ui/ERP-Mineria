import { Component, inject, signal, viewChildren } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../core/toast.service';
import { rutOk } from '../../core/util';
import { Field, FileDrop, Regla, Strength, validarTodos } from '../../shared/forms';
import { Icon } from '../../shared/icon';
import { Empty, Stepper, Timeline } from '../../shared/ui';

interface Persona { n: string; r: string; c: string }

/** Registro de empresa contratista: 5 pasos más la confirmación. */
@Component({
  selector: 'app-registro',
  templateUrl: './registro.html',
  imports: [FormsModule, RouterLink, Field, FileDrop, Regla, Strength, Icon, Empty, Stepper, Timeline],
})
export class Registro {
  private toast = inject(ToastService);
  private reglas = viewChildren(Regla);
  private zonas = viewChildren(FileDrop);
  readonly pasos = ['Empresa', 'Representante', 'Documentos', 'Trabajadores', 'Revisión'];
  readonly titulos = ['Datos de la empresa', 'Representante y acceso', 'Documentación de la empresa', 'Trabajadores a acreditar', 'Revisa y confirma'];
  readonly paso = signal(0);
  readonly giros = ['Transporte', 'Mantención', 'Construcción', 'Servicios', 'Alimentación', 'Perforación', 'Otro'];
  readonly documentos: [string, string][] = [['Certificado de vigencia de la sociedad', 'certificado-vigencia.pdf'], ['Certificado de cumplimiento laboral', 'cumplimiento-laboral.pdf'], ['Póliza de seguro de responsabilidad civil', 'poliza-seguro.pdf']];
  d = { rs: '', rt: '', gi: 'Transporte', tr: '', ts: 'Permanente', rn: '', rr: '', mail: '', tel: '', pwr: '', f2: 'app', ok1: false, ok2: false };
  readonly cargados = signal(0);
  readonly personas = signal<Persona[]>([]);
  nueva: Persona = { n: '', r: '', c: '' };
  readonly errNueva = signal<Record<string, string>>({});
  readonly enviada = signal('');

  atras() { this.paso.update(p => p - 1); }
  guardar() { this.toast.show('Borrador guardado en el equipo y en la nube (cuando haya enlace).', 'ok'); }

  continuar() {
    if (!validarTodos(this.reglas())) { this.toast.show('Revisa los campos marcados antes de continuar.', 'warn'); return; }
    if (this.paso() === 2 && this.cargados() < 3) { this.toast.show('Sube los tres documentos para continuar.', 'warn'); return; }
    if (this.paso() === 3 && !this.personas().length) { this.toast.show('Agrega al menos un trabajador.', 'warn'); return; }
    if (this.paso() === 4) {
      this.enviada.set('SOL-' + (7000 + Math.floor(Math.random() * 999)));
      this.toast.show('Solicitud enviada con éxito.', 'ok');
      return;
    }
    this.paso.update(p => p + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  ejemplos() {
    this.zonas().forEach((z, i) => { if (!z.archivos().length) z.agregar(this.documentos[i][1]); });
  }

  agregarPersona() {
    const n = this.nueva, e: Record<string, string> = {};
    if (n.n.trim().length < 5) e['n'] = n.n.trim() ? 'Mínimo 5 caracteres.' : 'Este campo es obligatorio.';
    if (!rutOk(n.r)) e['r'] = n.r.trim() ? 'RUT inválido: revisa el dígito verificador (ej. 76.123.456-K).' : 'Este campo es obligatorio.';
    if (!n.c.trim()) e['c'] = 'Este campo es obligatorio.';
    this.errNueva.set(e);
    if (Object.keys(e).length) return;
    this.personas.update(l => [...l, { ...n }]);
    this.nueva = { n: '', r: '', c: '' };
    this.toast.show('Trabajador agregado.', 'ok', 2000);
  }
  quitarPersona(i: number) { this.personas.update(l => l.filter((_, k) => k !== i)); }
}
