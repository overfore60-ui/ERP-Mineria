import { Component, inject, signal, viewChildren } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ROLES } from '../../core/data';
import { SessionService } from '../../core/session.service';
import { Field, Regla, validarTodos } from '../../shared/forms';
import { BrandLock, HeroPit } from '../../shared/hero-pit';
import { Icon } from '../../shared/icon';
import { Modal } from '../../shared/modal';
import { Tabs } from '../../shared/ui';

interface Credencial { rol: string; nombre: string; cargo: string; ini: string }

/** Ingreso unificado: cuenta corporativa con segundo factor, o credencial de faena (lo que tienes) más PIN (lo que sabes). */
@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  imports: [FormsModule, RouterLink, Field, Regla, BrandLock, HeroPit, Icon, Modal, Tabs],
})
export class Login {
  private ses = inject(SessionService);
  private router = inject(Router);
  private reglas = viewChildren(Regla);

  readonly tabs = [{ id: 'corp', label: 'Cuenta corporativa' }, { id: 'cred', label: 'Credencial de faena' }];
  tab = 'corp';
  readonly perfiles = Object.entries(ROLES).filter(([k]) => k !== 'operador');
  correo = '';
  perfil = 'supervisor';
  /** Credenciales de demostración que se pueden «acercar al lector». */
  readonly credenciales: Credencial[] = ['supervisor', 'guardia'].map(k => ({ rol: k, nombre: ROLES[k].person, cargo: ROLES[k].label, ini: ROLES[k].ini }));
  readonly leida = signal<Credencial | null>(null);
  readonly leyendo = signal(false);
  readonly redirigiendo = signal(false);

  readonly pin = signal('');
  readonly pinError = signal('');
  private intentos = 0;
  readonly claseTecla = 'h-16 rounded-xl border-2 border-pizarra bg-white font-titulo font-bold text-[1.625rem] cursor-pointer hover:bg-cobre-l';

  entrar() {
    if (!validarTodos(this.reglas())) return;
    this.ses.pendiente = { role: this.perfil, kind: 'corp' };
    this.redirigiendo.set(true);
    setTimeout(() => { this.redirigiendo.set(false); this.router.navigateByUrl('/2fa'); }, 1300);
  }

  /** Simula que la persona acerca su credencial al lector: no escribe nada. */
  leerCredencial(i = 0) {
    this.leyendo.set(true);
    this.pinError.set('');
    setTimeout(() => { this.leyendo.set(false); this.leida.set(this.credenciales[i]); this.pin.set(''); this.intentos = 0; }, 700);
  }
  otraCredencial() { this.leida.set(null); this.pin.set(''); this.pinError.set(''); }

  tecla(k: string) {
    if (!this.leida() || this.intentos >= 3) return;
    if (k === 'del') this.pin.update(p => p.slice(0, -1));
    else if (k === 'ok') return this.revisarPin();
    else if (this.pin().length < 4) this.pin.update(p => p + k);
    if (this.pin().length === 4) setTimeout(() => this.revisarPin(), 150);
  }

  private revisarPin() {
    const c = this.leida();
    if (!c) { this.pinError.set('Primero acerca tu credencial al lector.'); return; }
    if (this.pin().length < 4) { this.pinError.set('Ingresa los 4 dígitos.'); return; }
    if (this.pin() !== '1234') {
      this.intentos++;
      this.pin.set('');
      const q = 3 - this.intentos;
      this.pinError.set(this.intentos >= 3 ? 'Credencial bloqueada. Avisa a tu supervisor.' : `PIN incorrecto. Te quedan ${q} intento${q > 1 ? 's' : ''}.`);
      return;
    }
    // Los dos factores ya están: la credencial leída y el PIN correcto.
    this.ses.login(c.rol);
  }
}
