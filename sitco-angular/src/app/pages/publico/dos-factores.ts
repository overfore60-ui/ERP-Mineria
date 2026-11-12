import { Component, ElementRef, OnDestroy, OnInit, inject, signal, viewChildren } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SessionService } from '../../core/session.service';
import { ToastService } from '../../core/toast.service';
import { Icon } from '../../shared/icon';
import { Empty } from '../../shared/ui';

/** Segundo factor: código de 6 dígitos (cuenta corporativa) o lectura de la credencial (terreno). */
@Component({
  selector: 'app-dos-factores',
  templateUrl: './dos-factores.html',
  imports: [RouterLink, Icon, Empty],
})
export class DosFactores implements OnInit, OnDestroy {
  readonly ses = inject(SessionService);
  private toast = inject(ToastService);
  private casillas = viewChildren<ElementRef<HTMLInputElement>>('dig');
  readonly digitos = [0, 1, 2, 3, 4, 5];
  readonly error = signal('');
  readonly segundos = signal(30);
  private intentos = 0;
  private timer?: ReturnType<typeof setInterval>;

  ngOnInit() { this.iniciarReloj(); setTimeout(() => this.casillas()[0]?.nativeElement.focus(), 60); }
  ngOnDestroy() { clearInterval(this.timer); }

  private iniciarReloj() {
    clearInterval(this.timer);
    this.segundos.set(30);
    this.timer = setInterval(() => { this.segundos.update(s => s - 1); if (this.segundos() <= 0) clearInterval(this.timer); }, 1000);
  }
  private inp(i: number) { return this.casillas()[i]?.nativeElement; }

  escribir(i: number) {
    const el = this.inp(i)!;
    el.value = el.value.replace(/\D/g, '');
    if (el.value && i < 5) this.inp(i + 1)!.focus();
  }
  borrar(i: number, e: KeyboardEvent) { if (e.key === 'Backspace' && !this.inp(i)!.value && i > 0) this.inp(i - 1)!.focus(); }
  pegar(e: ClipboardEvent) {
    const t = (e.clipboardData?.getData('text') || '').replace(/\D/g, '').slice(0, 6);
    if (!t) return;
    e.preventDefault();
    t.split('').forEach((c, k) => { const el = this.inp(k); if (el) el.value = c; });
    this.inp(Math.min(5, t.length))!.focus();
  }

  verificar() {
    const code = this.casillas().map(c => c.nativeElement.value).join('');
    if (code.length < 6) { this.error.set('Ingresa los 6 dígitos.'); return; }
    if (code !== '123456') {
      this.intentos++;
      this.error.set(this.intentos >= 3 ? 'Demasiados intentos. Cuenta bloqueada 5 min.' : `Código incorrecto. Intento ${this.intentos} de 3.`);
      this.casillas().forEach(c => (c.nativeElement.value = ''));
      this.inp(0)!.focus();
      return;
    }
    clearInterval(this.timer);
    this.ses.login(this.ses.pendiente!.role);
  }

  reenviar() { this.toast.show('Se envió un nuevo código a tu aplicación autenticadora.', 'info'); this.iniciarReloj(); }
  leerCredencial() { this.toast.show('Credencial leída correctamente.', 'ok', 2500); this.ses.login('supervisor'); }
}
