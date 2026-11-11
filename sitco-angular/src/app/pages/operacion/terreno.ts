import { Component, OnDestroy, computed, effect, inject, signal, untracked, viewChild, viewChildren } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EQUIPOS } from '../../core/data';
import { SessionService } from '../../core/session.service';
import { SimService } from '../../core/sim.service';
import { ToastService } from '../../core/toast.service';
import { ft } from '../../core/util';
import { Firma } from '../../shared/firma';
import { Field, Regla, validarTodos } from '../../shared/forms';
import { Icon } from '../../shared/icon';
import { PageHeader } from '../../shared/page-header';
import { Banner, Card, Tabs } from '../../shared/ui';

/** Estado de la demostración de terreno (se conserva al cambiar de pantalla). */
const TD = { vista: 'op', tipo: 'tablet', cuenta: 4, credencial: false, rol: '' };
const PLAN = 'Planta';
/** Cada perfil entra a su propio dispositivo: el operador a la botonera y el supervisor a la tableta. */
const vistaDe = (rol: string) => (rol === 'supervisor' ? 'sup' : 'op');

/** Terreno: la Botonera de Pala (sin pantalla) y la tableta de supervisión, ambas funcionan sin señal. */
@Component({
  selector: 'app-terreno',
  templateUrl: './terreno.html',
  imports: [FormsModule, Firma, Field, Regla, Icon, PageHeader, Banner, Card, Tabs],
})
export class Terreno implements OnDestroy {
  readonly ses = inject(SessionService);
  readonly sim = inject(SimService);
  private toast = inject(ToastService);
  private reglas = viewChildren(Regla);
  private firmaInc = viewChild<Firma>('firmaInc');
  private firmaIns = viewChild<Firma>('firmaIns');
  readonly ft = ft;
  readonly plan = PLAN;
  readonly destinos = [['Planta', 'bg-[#2E7D32] text-white'], ['Baja ley', 'bg-[#E0B030] text-pizarra'], ['Estéril', 'bg-[#7A634E] text-white'], ['Borde', 'bg-[#2F5FA8] text-white']];
  readonly equipos = EQUIPOS.map(e => e.id + ' · ' + e.tipo);
  readonly vista = signal(this.vistaInicial());
  readonly tipo = signal(TD.tipo);
  readonly cuenta = signal(TD.cuenta);
  readonly credencial = signal(TD.credencial);
  readonly registrado = signal(false);
  readonly aviso = signal<{ t: string; sinCred: boolean } | null>(null);
  readonly tabs = [{ id: 'inc', label: 'Incidente' }, { id: 'ins', label: 'Inspección' }, { id: 'fal', label: 'Falla' }];
  readonly tab = signal('inc');
  private timer?: ReturnType<typeof setTimeout>;

  inc = { tipo: 'Cuasi accidente', lugar: 'Rampa norte · km 2', hora: '08:30', desc: '' };
  readonly foto = signal(false);
  readonly inspeccion = ['Luminarias de rampa norte', 'Luminarias de botadero', 'Señalética reflectante'];
  respuestas = ['ok', 'ok', 'ok'];
  falla = { equipo: 'CF-07 · Camión 240 t', comp: 'Motor / hidráulico' };

  readonly estadoEquipo = computed(() => this.sim.lte === 'shadow' ? ['warn', 'Sin cobertura · guardando en el equipo'] : this.sim.link === 'down' ? ['warn', 'Nodo de Faena · sin enlace a la nube'] : ['ok', 'Conectado · todo al día']);
  /** Historial del dispositivo en pantalla: la botonera y la tableta guardan cada una sus registros. */
  readonly cola = computed(() => {
    const dev = this.vista() === 'op' ? 'botonera' : 'tableta';
    return this.sim.queue.filter(e => e.dev === dev).slice(0, 6);
  });
  private quien() { return this.ses.user()?.name || 'Supervisor'; }

  constructor() {
    // Cambiar de perfil sin cambiar de dirección no recrea la pantalla: se reinicia la vista aquí.
    effect(() => {
      const rol = this.ses.user()?.role ?? '';
      untracked(() => {
        if (TD.rol === rol) return;
        this.reiniciar(rol);
        this.vista.set(TD.vista);
        this.credencial.set(false);
        this.aviso.set(null);
        this.registrado.set(false);
        clearTimeout(this.timer);
      });
    });
  }

  private vistaInicial() {
    const rol = this.ses.user()?.role ?? '';
    if (TD.rol !== rol) this.reiniciar(rol);
    return TD.vista;
  }
  private reiniciar(rol: string) { TD.rol = rol; TD.vista = vistaDe(rol); TD.credencial = false; }

  ngOnDestroy() { clearTimeout(this.timer); }

  cambiarVista(v: string) { this.vista.set(v); TD.vista = v; this.aviso.set(null); }
  cambiarTipo() { this.tipo.update(t => (t === 'tablet' ? 'phone' : 'tablet')); TD.tipo = this.tipo(); }
  alternarSol(on: boolean) { if (on !== this.ses.sol()) this.ses.alternarSol(); }

  /** Botonera: el botón que se aprieta es el destino; si difiere del plan, es un cambio de destino. */
  declarar(d: string) {
    const cambio = d !== PLAN, cred = this.credencial();
    this.sim.capture(cambio ? 'Cambio de destino' : 'Destino confirmado', `B3015-P106 · PA-03 · ${d}${cambio ? ' (plan: ' + PLAN + ')' : ''}${cred ? '' : ' · sin credencial'}`, cred ? 'Eleodoro Painemal' : 'Operador no identificado', 'botonera');
    this.cuenta.update(c => c + 1); TD.cuenta = this.cuenta();
    this.aviso.set({ t: cambio ? `Cambio de destino registrado: ${d}` : `Destino confirmado: ${d}`, sinCred: !cred });
    this.registrado.set(true);
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.registrado.set(false), 2500);
  }
  leerCredencial() {
    this.credencial.set(true); TD.credencial = true;
    this.aviso.set({ t: 'Credencial leída: tus declaraciones quedan a nombre de Eleodoro Painemal', sinCred: false });
  }

  guardarIncidente() {
    if (!validarTodos(this.reglas())) return;
    if (!this.firmaInc()?.firmado()) { this.toast.show('Falta tu firma en el recuadro.', 'warn'); return; }
    const ev = this.sim.capture('Incidente', `${this.inc.tipo} · ${this.inc.lugar} · hecho a las ${this.inc.hora}`, this.quien(), 'tableta');
    this.toast.show(`<strong>${ev.id} firmado y guardado.</strong> ${this.sim.link === 'down' || this.sim.lte === 'shadow' ? 'Se enviará solo al volver la señal.' : 'Sincronizado.'}`, 'ok', 5000);
    this.inc.desc = '';
    this.foto.set(false);
    this.firmaInc()?.borrar();
  }
  firmarInspeccion() {
    if (!this.firmaIns()?.firmado()) { this.toast.show('Falta tu firma en el recuadro.', 'warn'); return; }
    this.sim.capture('Inspección', 'IP-120 · Iluminación de caminos · firmada por ' + this.quien(), this.quien(), 'tableta');
    this.toast.show('Inspección firmada en terreno y guardada.', 'ok');
    this.firmaIns()?.borrar();
  }
  avisoFalla() {
    this.sim.capture('Aviso de falla', `${this.falla.equipo} · ${this.falla.comp}`, this.quien(), 'tableta');
    this.toast.show('Aviso creado: llegará a SAP con equipo, componente, hora y persona, sin que nadie lo transcriba desde la radio.', 'ok', 5000);
  }
}
