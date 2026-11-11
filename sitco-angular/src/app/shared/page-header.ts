import { Component, computed, inject, input } from '@angular/core';
import { modOf } from '../core/data';
import { PageService } from '../core/page.service';
import { HtmlPipe } from './html.pipe';
import { Tip } from './ui';

/** Cabecera de cada pantalla: título, módulo de la solución (con marca NODO) y acciones a la derecha. */
@Component({
  selector: 'app-page-header',
  host: { class: 'flex justify-between items-start gap-4 flex-wrap mb-4' },
  template: `
    <div>
      <h1 id="pgh" tabindex="-1">{{ titulo() }}</h1>
      @if (modulo(); as m) {
        <div class="flex items-center gap-1.5 flex-wrap mt-0.5 mb-2">
          <span class="text-[0.8125rem] muted">Módulo</span> <strong class="text-sm">{{ m.n }}</strong>
          @if (m.nodo) {
            <span class="badge badge-dk">NODO</span>
            <app-tip class="-ml-1" [inl]="true" texto="NODO: también corre en el Nodo de Faena y sigue funcionando 48 h sin enlace. Fuente: Subdocumento 3." />
          }
        </div>
      }
      @if (sub()) { <p class="m-0 text-acero max-w-[70ch]" [innerHTML]="sub() | html"></p> }
    </div>
    <div class="flex gap-3 items-center flex-wrap"><ng-content /></div>`,
  imports: [Tip, HtmlPipe],
})
export class PageHeader {
  private page = inject(PageService);
  readonly titulo = input.required<string>();
  readonly sub = input('');
  readonly modulo = computed(() => modOf(this.page.item()));
}
