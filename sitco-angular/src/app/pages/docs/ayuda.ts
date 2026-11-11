import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SessionService } from '../../core/session.service';
import { PageHeader } from '../../shared/page-header';

/** Ayuda y accesibilidad: preferencias de visualización, atajos, preguntas frecuentes y declaración WCAG. */
@Component({
  selector: 'app-ayuda',
  template: `
    <div [class]="ses.user() ? '' : 'px-4 py-8 md:px-6 md:py-12'"><div [class]="ses.user() ? '' : 'max-w-[900px] mx-auto'">
      <app-page-header titulo="Ayuda y accesibilidad" sub="Respuestas rápidas, atajos y las opciones de visualización para trabajar con guantes, a pleno sol o con lectores de pantalla." />
      <div class="grid gap-4 md:grid-cols-2">
        <div class="card">
          <h3>Preferencias de visualización</h3>
          <label class="switch"><input type="checkbox" [checked]="ses.sol()" (change)="ses.alternarSol()"><span class="tr"></span><span>Modo sol (alto contraste)</span></label><br>
          <label class="switch"><input type="checkbox" [checked]="ses.grande()" (change)="ses.alternarGrande()"><span class="tr"></span><span>Texto grande</span></label>
          <p class="text-sm muted mt-2">Las opciones se aplican a todo el prototipo.</p>
        </div>
        <div class="card">
          <h3>Atajos de teclado</h3>
          <table class="text-sm!"><tbody>
            @for (x of atajos; track x[0]) { <tr><th scope="row" class="bg-transparent!"><kbd>{{ x[0] }}</kbd></th><td>{{ x[1] }}</td></tr> }
          </tbody></table>
        </div>
      </div>

      <h2 class="mt-6">Preguntas frecuentes</h2>
      <details open [class]="acc"><summary [class]="sum">¿Qué pasa si se corta la fibra?</summary>
        <div class="px-4 pb-4"><p>La operación sigue en modo local desde el Nodo de Faena, hasta 48 horas. Todo se sincroniza solo al volver el enlace. @if (ses.permitidoRuta('/conectividad')) { Mira el estado en <a routerLink="/conectividad">Conectividad y nube</a>. }</p></div></details>
      @for (f of preguntas; track f[0]) {
        <details [class]="acc"><summary [class]="sum">{{ f[0] }}</summary><div class="px-4 pb-4"><p>{{ f[1] }}</p></div></details>
      }

      <h2 class="mt-6">Declaración de accesibilidad</h2>
      <div class="card"><p class="mb-0">El prototipo apunta a cumplir <strong>WCAG 2.2 nivel AA</strong>: contraste adecuado, navegación completa por teclado, objetivos táctiles de al menos 44×44 px, etiquetas y textos alternativos, foco visible, mensajes de error asociados a cada campo, y respeto de la preferencia de movimiento reducido.</p></div>
    </div></div>`,
  imports: [RouterLink, PageHeader],
})
export class Ayuda {
  readonly ses = inject(SessionService);
  readonly acc = 'border border-arena-2 rounded-lg bg-white mb-2';
  readonly sum = 'min-h-12 px-4 flex items-center gap-2.5 font-semibold cursor-pointer';
  readonly atajos = [['Tab / Mayús+Tab', 'Moverse entre elementos'], ['Enter / Espacio', 'Activar botones y enlaces'], ['← →', 'Cambiar de pestaña'], ['↑ ↓ Enter', 'Elegir una sugerencia de autocompletado'], ['Esc', 'Cerrar menús y diálogos']];
  readonly preguntas = [
    ['¿Por qué el operador de pala usa una botonera y no una pantalla?', 'Porque la operación no puede aceptar pasos adicionales ni pantallas que no se ven con guantes y a pleno sol. Un toque en el destino correcto registra el cambio de material con su contexto, y ese destino es la razón del cambio. La credencial se toca una vez por turno.'],
    ['¿Cómo evito que me rechacen en portería?', 'El sistema avisa 30, 15 y 7 días antes de cada vencimiento a la persona, a su empleador y a Seguridad. Renueva el documento desde la ficha de la persona.'],
    ['¿Quién emite los documentos contables?', 'SAP. La plataforma entrega los datos y la cadena de custodia; no hay dos verdades contables.'],
    ['¿Cómo pido soporte?', 'Soporte presencial en faena 24/7 (turnos 7x7, considerando la altura y el traslado de 145 km) y mesa de ayuda en Santiago y Antofagasta.'],
  ];
}
