/* Tabla de datos: buscar, filtrar, ordenar, paginar y seleccionar varias filas.
   Las celdas especiales se escriben en la página con `<ng-template appCell="clave" let-r>`. */
import { Component, Directive, TemplateRef, computed, contentChildren, effect, inject, input, output, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { Icon } from './icon';
import { Empty } from './ui';
import { nf } from '../core/util';

export interface Col<T = any> { key: string; label: string; num?: boolean; nosort?: boolean; sortv?: (r: T) => number | string }
export interface Filtro { key: string; label: string; options: string[] }
export interface Masiva { id: string; label: string }

/** Plantilla de una celda: `<ng-template appCell="estado" let-r>…</ng-template>` */
@Directive({ selector: 'ng-template[appCell]' })
export class Cell {
  readonly appCell = input.required<string>();
  readonly tpl = inject(TemplateRef);
}

@Component({
  selector: 'app-data-table',
  host: { class: 'block' },
  template: `
    <div class="flex gap-3 flex-wrap items-center mb-3">
      @if (buscar()) {
        <div class="flex-[1_1_200px] min-w-[200px]"><label class="sr" [for]="id + 'q'">Buscar</label>
          <input type="search" [id]="id + 'q'" [placeholder]="buscarPh()" [value]="q()" (input)="q.set($any($event.target).value); page.set(1)"></div>
      }
      @for (f of filtros(); track f.key) {
        <div class="flex-[1_1_200px] min-w-[200px]"><label class="sr" [for]="id + f.key">{{ f.label }}</label>
          <select [id]="id + f.key" [value]="fv()[f.key] || ''" (change)="filtrar(f.key, $any($event.target).value)">
            <option value="">{{ f.label }}: todos</option>
            @for (o of f.options; track o) { <option [value]="o">{{ o }}</option> }
          </select></div>
      }
      <ng-content />
    </div>

    @if (sel().size && masivas().length) {
      <div class="flex gap-3 items-center flex-wrap bg-pizarra text-white px-3.5 py-2 rounded-lg mb-3" role="region" aria-label="Acciones masivas">
        <strong>{{ sel().size }} seleccionado{{ sel().size > 1 ? 's' : '' }}</strong>
        @for (b of masivas(); track b.id) { <button type="button" class="btn btn-sm btn-sec" (click)="masiva.emit({ accion: b.id, ids: [...sel()] }); limpiarSel()">{{ b.label }}</button> }
        <button type="button" class="btn btn-sm btn-ter text-white!" (click)="limpiarSel()">Limpiar</button>
      </div>
    }

    <div aria-live="polite">
      @if (!filtradas().length) {
        <app-empty [titulo]="vacio()" mensaje="No hay registros que coincidan con los filtros aplicados.">
          <button type="button" class="btn btn-sec" (click)="reiniciar()">Limpiar filtros</button>
        </app-empty>
      } @else {
        <div tabindex="0" role="region" aria-label="Tabla, se puede desplazar" class="relative overflow-x-auto border border-arena-2 rounded-xl bg-white">
          <table [class.stack]="apilar()">
            <caption class="sr">{{ caption() }}</caption>
            <thead><tr>
              @if (masivas().length) { <th class="w-14"><label class="inline-grid place-items-center size-11 cursor-pointer"><input type="checkbox" aria-label="Seleccionar página" class="size-[22px] accent-cobre" [checked]="paginaMarcada()" (change)="marcarPagina($any($event.target).checked)"></label></th> }
              @for (c of cols(); track c.key) {
                <th [class.text-right]="c.num" [attr.aria-sort]="orden()?.key === c.key ? (orden()!.dir > 0 ? 'ascending' : 'descending') : null">
                  @if (c.nosort || !c.key) { {{ c.label }} } @else {
                    <button type="button" class="inline-flex gap-1.5 items-center min-h-11 font-semibold cursor-pointer" (click)="ordenar(c.key)">{{ c.label }}<app-icon name="sort" class="size-3.5 opacity-60" /></button>
                  }
                </th>
              }
            </tr></thead>
            <tbody>
              @for (r of pagina(); track r.id) {
                <tr [class.bg-cobre-l]="sel().has(r.id)">
                  @if (masivas().length) { <td><label class="inline-grid place-items-center size-11 cursor-pointer"><input type="checkbox" class="size-[22px] accent-cobre" [attr.aria-label]="'Seleccionar ' + r.id" [checked]="sel().has(r.id)" (change)="marcar(r.id, $any($event.target).checked)"></label></td> }
                  @for (c of cols(); track c.key) {
                    <td [attr.data-l]="c.label" [class.text-right]="c.num" [class.tabular-nums]="c.num">
                      @if (celda(c.key); as t) { <ng-container *ngTemplateOutlet="t; context: { $implicit: r }" /> } @else { {{ r[c.key] }} }
                    </td>
                  }
                </tr>
              }
            </tbody>
          </table>
        </div>
        <div class="flex justify-between items-center gap-3 flex-wrap mt-3 text-sm">
          <span>Mostrando {{ (page() - 1) * tam() + 1 }}–{{ min(filtradas().length, page() * tam()) }} de {{ nf(filtradas().length) }}</span>
          <nav class="flex gap-1" aria-label="Paginación">
            <button type="button" [class]="pg" [disabled]="page() === 1" aria-label="Página anterior" (click)="page.set(page() - 1)"><app-icon name="chL" class="mx-auto" /></button>
            @for (p of paginas(); track $index) {
              @if (p === 0) { <span class="px-1 py-3">…</span> } @else {
                <button type="button" [class]="pg" [class.bg-pizarra]="p === page()" [class.text-white]="p === page()" [attr.aria-current]="p === page() ? 'page' : null" [attr.aria-label]="'Página ' + p" (click)="page.set(p)">{{ p }}</button>
              }
            }
            <button type="button" [class]="pg" [disabled]="page() === totalPag()" aria-label="Página siguiente" (click)="page.set(page() + 1)"><app-icon name="chR" class="mx-auto" /></button>
          </nav>
        </div>
      }
    </div>`,
  imports: [Icon, Empty, NgTemplateOutlet],
})
export class DataTable {
  private static n = 0;
  readonly id = 'tb' + ++DataTable.n;
  readonly rows = input.required<any[]>();
  readonly cols = input.required<Col[]>();
  readonly filtros = input<Filtro[]>([]);
  readonly masivas = input<Masiva[]>([]);
  readonly tam = input(8);
  readonly buscar = input(true);
  readonly buscarPh = input('Buscar…');
  readonly buscarEn = input<string[] | null>(null);
  readonly caption = input('Tabla de datos');
  readonly vacio = input('Sin resultados');
  readonly apilar = input(true);
  readonly ordenInicial = input<{ key: string; dir: number } | null>(null);
  readonly masiva = output<{ accion: string; ids: string[] }>();

  private celdas = contentChildren(Cell);
  readonly q = signal('');
  readonly fv = signal<Record<string, string>>({});
  readonly orden = signal<{ key: string; dir: number } | null>(null);
  readonly page = signal(1);
  readonly sel = signal(new Set<string>());
  readonly nf = nf;
  readonly min = Math.min;
  readonly pg = 'min-w-11 min-h-11 border border-arena-3 bg-white rounded-lg text-sm font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed';

  constructor() { effect(() => { const o = this.ordenInicial(); if (o && !this.orden()) this.orden.set(o); }); }

  readonly filtradas = computed(() => {
    let r = this.rows().slice();
    const keys = this.buscarEn() || this.cols().map(c => c.key).filter(Boolean);
    const q = this.q().toLowerCase();
    if (q) r = r.filter(x => keys.some(k => String(x[k] ?? '').toLowerCase().includes(q)));
    const f = this.fv();
    for (const k in f) if (f[k]) r = r.filter(x => String(x[k]) === f[k]);
    const o = this.orden();
    if (o) {
      const c = this.cols().find(c => c.key === o.key);
      const g = c?.sortv || ((x: any) => x[o.key]);
      r.sort((a, b) => { const A = g(a), B = g(b); return (A > B ? 1 : A < B ? -1 : 0) * o.dir; });
    }
    return r;
  });
  readonly totalPag = computed(() => Math.max(1, Math.ceil(this.filtradas().length / this.tam())));
  readonly pagina = computed(() => { const p = Math.min(this.page(), this.totalPag()); return this.filtradas().slice((p - 1) * this.tam(), p * this.tam()); });
  /** Números de página visibles; 0 marca un salto (…). */
  readonly paginas = computed(() => {
    const n = this.totalPag(), cur = this.page(), out: number[] = [];
    Array.from({ length: n }, (_, i) => i + 1).filter(p => p === 1 || p === n || Math.abs(p - cur) <= 1)
      .forEach((p, i, a) => { if (i && p - a[i - 1] > 1) out.push(0); out.push(p); });
    return out;
  });
  readonly paginaMarcada = computed(() => this.pagina().length > 0 && this.pagina().every(r => this.sel().has(r.id)));

  celda(k: string) { return this.celdas().find(c => c.appCell() === k)?.tpl ?? null; }
  filtrar(k: string, v: string) { this.fv.update(f => ({ ...f, [k]: v })); this.page.set(1); }
  ordenar(k: string) { const o = this.orden(); this.orden.set(o && o.key === k ? { key: k, dir: -o.dir } : { key: k, dir: 1 }); }
  marcar(id: string, on: boolean) { const s = new Set(this.sel()); on ? s.add(id) : s.delete(id); this.sel.set(s); }
  marcarPagina(on: boolean) { const s = new Set(this.sel()); this.pagina().forEach(r => (on ? s.add(r.id) : s.delete(r.id))); this.sel.set(s); }
  limpiarSel() { this.sel.set(new Set()); }
  reiniciar() { this.q.set(''); this.fv.set({}); this.page.set(1); }
}
