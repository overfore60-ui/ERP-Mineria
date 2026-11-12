import { Component, inject } from '@angular/core';
import { SessionService } from '../../core/session.service';
import { PageHeader } from '../../shared/page-header';

/** Ayuda y accesibilidad: preferencias de visualización, atajos y declaración WCAG. */
@Component({
  selector: 'app-ayuda',
  template: `
    <div [class]="ses.user() ? '' : 'px-4 py-8 md:px-6 md:py-12'"><div [class]="ses.user() ? '' : 'max-w-[900px] mx-auto'">
      <app-page-header titulo="Ayuda y accesibilidad" sub="Atajos y opciones de visualización para trabajar con guantes, a pleno sol o con lectores de pantalla." />
      <div class="grid gap-4 md:grid-cols-2">
        <div class="card">
          <h3>Preferencias de visualización</h3>
          <label class="switch"><input type="checkbox" [checked]="ses.sol()" (change)="ses.alternarSol()"><span class="tr"></span><span>Modo sol (alto contraste)</span></label><br>
          <label class="switch"><input type="checkbox" [checked]="ses.grande()" (change)="ses.alternarGrande()"><span class="tr"></span><span>Texto grande</span></label>
          <p class="text-sm muted mt-2">Las opciones se aplican a toda la plataforma.</p>
        </div>
        <div class="card">
          <h3>Atajos de teclado</h3>
          <table class="text-sm!"><tbody>
            @for (x of atajos; track x[0]) { <tr><th scope="row" class="bg-transparent!"><kbd>{{ x[0] }}</kbd></th><td>{{ x[1] }}</td></tr> }
          </tbody></table>
        </div>
      </div>

      <h2 class="mt-6">Declaración de accesibilidad</h2>
      <div class="card"><p class="mb-0">La plataforma cumple <strong>WCAG 2.2 nivel AA</strong>: contraste adecuado, navegación completa por teclado, objetivos táctiles de al menos 44×44 px, etiquetas y textos alternativos, foco visible, mensajes de error asociados a cada campo, y respeto de la preferencia de movimiento reducido.</p></div>
    </div></div>`,
  imports: [PageHeader],
})
export class Ayuda {
  readonly ses = inject(SessionService);
  readonly atajos = [['Tab / Mayús+Tab', 'Moverse entre elementos'], ['Enter / Espacio', 'Activar botones y enlaces'], ['← →', 'Cambiar de pestaña'], ['↑ ↓ Enter', 'Elegir una sugerencia de autocompletado'], ['Esc', 'Cerrar menús y diálogos']];
}
