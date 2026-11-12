/* Componentes pequeños de presentación: tarjeta, indicador, aviso, ayuda emergente,
   estado vacío, línea de tiempo, pasos, esqueleto y pestañas. */
import { Component, ElementRef, HostListener, computed, inject, input, model, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Icon } from './icon';
import { HtmlPipe } from './html.pipe';

/** Tarjeta con título. El contenido extra a la derecha del título va con el atributo `derecha`. */
@Component({
  selector: 'app-card',
  host: { class: 'block card' },
  template: `
    @if (titulo()) {
      <div class="flex justify-between items-center gap-3 mb-3">
        <h3 class="mb-2">{{ titulo() }}</h3>
        <ng-content select="[derecha]" />
      </div>
    }
    @if (sub()) { <p class="muted text-sm" [innerHTML]="sub() | html"></p> }
    <ng-content />
  `,
  imports: [HtmlPipe],
})
export class Card {
  readonly titulo = input('');
  readonly sub = input('');
}

/** Ayuda contextual emergente (25.4): botón de 44 px con globo al pasar el mouse o con teclado; Esc la cierra. */
let tipN = 0;
@Component({
  selector: 'app-tip',
  host: { class: 'inline-block align-middle' },
  template: `
    <button type="button" class="relative inline-grid place-items-center size-11 rounded-full text-acero cursor-help" [class]="inl() ? '-my-2.5 ml-1' : ''"
      aria-label="Más información" [attr.aria-describedby]="id"
      (mouseenter)="ver.set(true)" (mouseleave)="ver.set(false)" (focus)="ver.set(true)" (blur)="ver.set(false)" (keydown.escape)="ver.set(false)">
      <app-icon name="help" />
      <span role="tooltip" [id]="id" class="absolute z-30 left-1/2 bottom-[90%] -translate-x-1/2 w-60 bg-pizarra text-white px-3 py-2.5 rounded-lg text-[0.8125rem] text-left font-normal shadow-suave"
        [class.hidden]="!ver()">{{ texto() }}</span>
    </button>`,
  imports: [Icon],
})
export class Tip {
  readonly texto = input.required<string>();
  readonly inl = input(false);
  readonly id = 'tip-' + ++tipN;
  readonly ver = signal(false);
}

/** Tarjeta de indicador (KPI). Con `href` es un enlace al detalle. */
@Component({
  selector: 'app-kpi',
  host: { class: 'block' },
  template: `
    <ng-template #cuerpo>
      <span class="text-[0.8125rem] text-acero font-medium">{{ lbl() }}</span>
      <span class="font-titulo font-bold text-[2.125rem] leading-tight">{{ val() }}@if (unit()) { <small class="ml-1 text-base font-semibold text-acero">{{ unit() }}</small>}</span>
      @if (dlt()) {
        <span class="text-[0.8125rem] font-semibold flex gap-1.5 items-center" [class]="cls() === 'good' ? 'text-senal' : cls() === 'bad' ? 'text-error' : 'text-acero'">
          {{ dlt() }}
          @if (!href() && lineaBase()) { <app-tip [inl]="true" texto="Línea base: el valor de 2025, antes de SITCO. La flecha muestra la mejora esperada." /> }
        </span>
      }
      <ng-content />
    </ng-template>
    @if (href()) {
      <a [routerLink]="href()" [attr.aria-label]="lbl() + ': ' + val() + ' ' + unit() + '. Ver detalle'" [class]="caja"><ng-container *ngTemplateOutlet="cuerpo" /></a>
    } @else {
      <div [class]="caja"><ng-container *ngTemplateOutlet="cuerpo" /></div>
    }`,
  imports: [RouterLink, Tip, NgTemplateOutlet],
})
export class Kpi {
  readonly lbl = input.required<string>();
  readonly val = input.required<string | number>();
  readonly unit = input('');
  readonly dlt = input('');
  readonly cls = input<'good' | 'bad' | 'neu' | ''>('');
  readonly href = input('');
  readonly lineaBase = computed(() => /Línea base/i.test(this.dlt()));
  readonly caja = 'flex flex-col gap-0.5 h-full text-left no-underline text-pizarra bg-white border border-arena-2 rounded-xl p-4 shadow-suave transition hover:-translate-y-0.5 hover:border-cobre hover:text-pizarra';
}

/** Aviso destacado: info, ok, warn o err. La acción opcional va con el atributo `accion`. */
@Component({
  selector: 'app-banner',
  host: { class: 'block mb-4' },
  template: `
    <div class="flex gap-3 items-start px-4 py-3 rounded-lg border text-[0.9375rem]" [class]="colores()" [attr.role]="tipo() === 'err' || tipo() === 'warn' ? 'alert' : 'note'">
      <app-icon [name]="tipo() === 'ok' ? 'check' : tipo() === 'info' ? 'info' : 'alert'" />
      <div class="flex-1 min-w-0"><ng-content /></div>
      <ng-content select="[accion]" />
    </div>`,
  imports: [Icon],
})
export class Banner {
  readonly tipo = input<'info' | 'ok' | 'warn' | 'err'>('info');
  readonly colores = computed(() => ({
    info: 'bg-acero-xl border-acero-l',
    ok: 'bg-senal-l border-[#A8D5C4]',
    warn: 'bg-aviso-l border-[#EBCB85] text-[#4a2f00]',
    err: 'bg-error-l border-[#E7A8A8] text-[#6b1111]',
  })[this.tipo()]);
}

/** Estado vacío con ilustración. Las acciones van como contenido. */
@Component({
  selector: 'app-empty',
  host: { class: 'block text-center px-4 py-8 text-acero' },
  template: `
    <svg viewBox="0 0 120 90" aria-hidden="true" class="w-[120px] h-[90px] mx-auto mb-3"><rect x="22" y="30" width="76" height="44" rx="6" fill="#EEF1F3" stroke="#6C8294" stroke-width="2"/><path d="M22 44h76" stroke="#6C8294" stroke-width="2"/><circle cx="86" cy="26" r="14" fill="#F3E1D6" stroke="#9C4A1F" stroke-width="2.5"/><path d="M96 36l10 10" stroke="#9C4A1F" stroke-width="3" stroke-linecap="round"/><path d="M36 58h30M36 66h18" stroke="#6C8294" stroke-width="2" stroke-linecap="round"/></svg>
    <h3>{{ titulo() }}</h3>
    <p [innerHTML]="mensaje() | html"></p>
    <ng-content />`,
  imports: [HtmlPipe],
})
export class Empty {
  readonly titulo = input.required<string>();
  readonly mensaje = input('');
}

/** Línea de tiempo vertical. s: done | cur | bad | warn. */
export interface Hito { t: string; w?: string; d?: string; s?: string }
@Component({
  selector: 'app-timeline',
  template: `
    <ol class="list-none m-0 pl-[22px] border-l-[3px] border-acero-l">
      @for (i of items(); track $index) {
        <li class="relative pl-4 pb-4">
          <span class="absolute -left-[31px] top-1 size-4 rounded-full border-[3px]" [class]="punto(i.s)"></span>
          <strong [innerHTML]="i.t | html"></strong>
          @if (i.w) { <span class="block text-[0.8125rem] text-acero">{{ i.w }}</span> }
          @if (i.d) { <div class="text-sm text-acero" [innerHTML]="i.d | html"></div> }
        </li>
      }
    </ol>`,
  imports: [HtmlPipe],
})
export class Timeline {
  readonly items = input.required<Hito[]>();
  punto(s?: string) {
    return s === 'done' ? 'bg-senal border-senal' : s === 'cur' ? 'bg-cobre border-cobre shadow-[0_0_0_5px_var(--color-cobre-l)]'
      : s === 'bad' ? 'bg-error border-error' : s === 'warn' ? 'bg-[#C58A10] border-[#C58A10]' : 'bg-white border-acero';
  }
}

/** Indicador de pasos de un asistente. */
@Component({
  selector: 'app-stepper',
  template: `
    <ol class="flex p-0 m-0 mb-6 overflow-x-auto pb-1" [attr.aria-label]="'Progreso: paso ' + (actual() + 1) + ' de ' + pasos().length">
      @for (p of pasos(); track $index; let k = $index, ultimo = $last) {
        <li class="relative list-none flex-1 min-w-[78px] md:min-w-24 flex flex-col items-center text-center gap-1.5 text-xs md:text-[0.8125rem] font-semibold"
          [class]="k === actual() ? 'text-pizarra' : 'text-acero'" [attr.aria-current]="k === actual() ? 'step' : null">
          @if (!ultimo) { <span class="absolute top-[18px] left-[calc(50%+20px)] right-[calc(-50%+20px)] h-0.5" [class]="k < actual() ? 'bg-senal' : 'bg-acero-l'"></span> }
          <span class="relative z-10 grid place-items-center size-9 rounded-full border-2 font-titulo font-bold text-base"
            [class]="k < actual() ? 'bg-senal border-senal text-white' : k === actual() ? 'bg-cobre border-cobre text-white' : 'bg-white border-acero'">{{ k < actual() ? '✓' : k + 1 }}</span>
          <span>{{ p }}</span>
        </li>
      }
    </ol>`,
})
export class Stepper {
  readonly pasos = input.required<string[]>();
  readonly actual = input(0);
}

/** Esqueleto de carga (RT-25.02). */
@Component({
  selector: 'app-skeleton',
  template: `
    <div class="flex flex-col gap-3" aria-busy="true" aria-label="Cargando contenido">
      <div class="skel h-[34px] w-2/5"></div>
      <div class="grid gap-4 md:grid-cols-3">@for (x of [1, 2, 3]; track x) { <div class="skel h-24"></div> }</div>
      @for (x of filas(); track x) { <div class="skel h-14"></div> }
    </div>`,
})
export class Skeleton {
  readonly n = input(2);
  readonly filas = computed(() => Array.from({ length: this.n() }, (_, i) => i));
}

/** Pestañas accesibles (flechas, Inicio y Fin). El panel lo muestra la página según `activa`. */
export interface TabItem { id: string; label: string }
@Component({
  selector: 'app-tabs',
  host: { class: 'block' },
  template: `
    <div class="flex gap-1 border-b-2 border-arena-2 mb-4 overflow-x-auto" role="tablist">
      @for (t of items(); track t.id) {
        <button role="tab" type="button" [attr.aria-selected]="t.id === activa()" [tabindex]="t.id === activa() ? 0 : -1"
          class="min-h-12 px-[18px] border-0 bg-transparent text-[0.9375rem] font-semibold cursor-pointer border-b-4 -mb-0.5 whitespace-nowrap hover:text-pizarra"
          [class]="t.id === activa() ? 'text-pizarra border-cobre' : 'text-acero border-transparent'"
          (click)="activa.set(t.id)" (keydown)="teclas($event)">{{ t.label }}</button>
      }
    </div>`,
})
export class Tabs {
  private el = inject(ElementRef<HTMLElement>);
  readonly items = input.required<TabItem[]>();
  readonly activa = model.required<string>();
  teclas(e: KeyboardEvent) {
    const all = this.items(); let i = all.findIndex(t => t.id === this.activa());
    if (e.key === 'ArrowRight') i = (i + 1) % all.length;
    else if (e.key === 'ArrowLeft') i = (i - 1 + all.length) % all.length;
    else if (e.key === 'Home') i = 0;
    else if (e.key === 'End') i = all.length - 1;
    else return;
    e.preventDefault();
    this.activa.set(all[i].id);
    setTimeout(() => (this.el.nativeElement.querySelectorAll('[role=tab]')[i] as HTMLElement)?.focus());
  }
}

/** Menú desplegable con botón. El botón va con el atributo `boton` y las opciones como contenido. */
@Component({
  selector: 'app-menu',
  host: { class: 'relative inline-block' },
  template: `
    <button type="button" [class]="claseBoton()" aria-haspopup="menu" [attr.aria-expanded]="abierto()" [attr.aria-label]="etiqueta() || null" (click)="abierto.set(!abierto())">
      <ng-content select="[boton]" />
    </button>
    @if (abierto()) {
      <div class="menu" [class]="ancho()" role="menu" (click)="abierto.set(false)"><ng-content /></div>
    }`,
})
export class Menu {
  private el = inject(ElementRef<HTMLElement>);
  readonly etiqueta = input('');
  readonly claseBoton = input('ibtn');
  readonly ancho = input('');
  readonly abierto = signal(false);
  @HostListener('document:click', ['$event']) fuera(e: Event) {
    if (!this.el.nativeElement.contains(e.target as Node)) this.abierto.set(false);
  }
  @HostListener('document:keydown.escape') esc() { this.abierto.set(false); }
}


/** Color de la etiqueta según el estado (Operando, Vencido, En revisión…). */
const TONO: Record<string, string> = {
  Operando: 'ok', Habilitado: 'ok', Vigente: 'ok', Cumple: 'ok', Liquidado: 'ok', Embarcado: 'ok', Cerrado: 'ok', Activo: 'ok', Explicada: 'ok',
  Detenido: 'err', Vencido: 'err', Bloqueado: 'err', Alta: 'err',
  'Por explicar': 'warn', 'Por vencer': 'warn', 'Próximo a vencer': 'warn', 'Dato con retraso': 'warn', Mantención: 'warn', 'En revisión': 'warn',
  'En investigación': 'warn', 'Con observaciones': 'warn', Media: 'warn', Pendiente: 'warn',
  'Pendiente de aprobación': 'cu', 'En muestreo': 'cu', 'En conformación': 'cu', 'Sin señal': 'dk',
};
export const tono = (s: string) => (TONO[s] ? 'badge-' + TONO[s] : '');

/** Etiqueta de estado: `<app-estado v="Vencido" />`. Con `tipo` se fuerza el color (ok, warn, err, cu, dk). */
@Component({
  selector: 'app-estado',
  host: { class: 'contents' },
  template: `<span class="badge" [class]="tipo() ? 'badge-' + tipo() : clase()">{{ v() }}<ng-content /></span>`,
})
export class Estado {
  readonly v = input('');
  readonly tipo = input('');
  readonly clase = computed(() => tono(this.v()));
}
