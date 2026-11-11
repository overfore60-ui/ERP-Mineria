import { Component, inject, signal, viewChildren } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ROLES } from '../../core/data';
import { SessionService } from '../../core/session.service';
import { rutOk } from '../../core/util';
import { Field, Regla, validarTodos } from '../../shared/forms';
import { BrandLock, HeroPit } from '../../shared/hero-pit';
import { Icon } from '../../shared/icon';
import { Modal } from '../../shared/modal';
import { Tabs } from '../../shared/ui';

/** Ingreso unificado: cuenta corporativa con segundo factor, o credencial de faena con PIN. */
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
  rut = '12.345.678-5';
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

  tecla(k: string) {
    if (k === 'del') this.pin.update(p => p.slice(0, -1));
    else if (k === 'ok') return this.revisarPin();
    else if (this.pin().length < 4) this.pin.update(p => p + k);
    if (this.pin().length === 4) setTimeout(() => this.revisarPin(), 150);
  }

  private revisarPin() {
    if (!rutOk(this.rut)) { this.pinError.set('Revisa el RUT de la credencial.'); return; }
    if (this.pin().length < 4) { this.pinError.set('Ingresa los 4 dígitos.'); return; }
    if (this.pin() !== '1234') {
      this.intentos++;
      this.pin.set('');
      const q = 3 - this.intentos;
      this.pinError.set(this.intentos >= 3 ? 'Credencial bloqueada. Avisa a tu supervisor.' : `PIN incorrecto. Te quedan ${q} intento${q > 1 ? 's' : ''}.`);
      return;
    }
    this.ses.pendiente = { role: 'supervisor', kind: 'cred' };
    this.router.navigateByUrl('/2fa');
  }
}
