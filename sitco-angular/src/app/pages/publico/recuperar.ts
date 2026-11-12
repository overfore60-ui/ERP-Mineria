import { Component, inject, signal, viewChildren } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastService } from '../../core/toast.service';
import { Field, Regla, Strength, validarTodos } from '../../shared/forms';
import { Icon } from '../../shared/icon';
import { Banner, Stepper } from '../../shared/ui';

/** Recuperación de acceso para empresas contratistas, en tres pasos. */
@Component({
  selector: 'app-recuperar',
  templateUrl: './recuperar.html',
  imports: [FormsModule, RouterLink, Field, Regla, Strength, Icon, Banner, Stepper],
})
export class Recuperar {
  private router = inject(Router);
  private toast = inject(ToastService);
  private reglas = viewChildren(Regla);
  readonly pasos = ['Identificarte', 'Verificar', 'Nueva clave'];
  readonly paso = signal(0);
  d = { rc: '', cd: '', pw: '', pw2: '' };
  readonly noCoincide = signal(false);

  atras() { this.paso.update(p => p - 1); }
  continuar() {
    if (!validarTodos(this.reglas())) { this.toast.show('Revisa los campos marcados antes de continuar.', 'warn'); return; }
    if (this.paso() === 1 && this.d.cd !== '482913') { this.toast.show('El código no coincide. Revisa el correo e intenta de nuevo.', 'warn'); return; }
    if (this.paso() === 2) {
      this.noCoincide.set(this.d.pw !== this.d.pw2);
      if (this.noCoincide()) return;
      this.toast.show('Contraseña actualizada. Ingresa con tu nueva clave.', 'ok');
      this.router.navigateByUrl('/login');
      return;
    }
    this.paso.update(p => p + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
