/* Formularios: validación en tiempo real (RT-25.03), campo con etiqueta y
   autocompletado, y carga de archivos simulada con arrastrar y soltar. */
import { Component, Directive, ElementRef, HostListener, QueryList, computed, contentChild, inject, input, output, signal } from '@angular/core';
import { AC } from '../core/data';
import { fuerza, validar } from '../core/util';
import { Icon } from './icon';

/** Valida el campo al salir de él y, si ya mostró un error, mientras se escribe.
    Uso: `<input appRegla="required|email">`. Reglas: required, email, rut, tel, min:n, code6, pwd, gt0, future. */
@Directive({
  selector: '[appRegla]',
  host: { '[attr.aria-invalid]': 'error() ? "true" : "false"', '[attr.aria-required]': 'requerido() || null' },
})
export class Regla {
  readonly el = inject(ElementRef<HTMLInputElement>);
  readonly appRegla = input.required<string>();
  readonly error = signal('');
  readonly tocado = signal(false);
  readonly requerido = computed(() => this.appRegla().includes('required'));

  valor() {
    const e = this.el.nativeElement;
    return e.type === 'checkbox' ? e.checked : e.value;
  }
  /** Revisa el campo y pinta el resultado. Devuelve true si está bien. */
  revisar() {
    this.tocado.set(true);
    this.error.set(validar(this.valor(), this.appRegla()));
    return !this.error();
  }
  @HostListener('blur') salir() { this.revisar(); }
  @HostListener('input') @HostListener('change') escribir() { if (this.tocado()) this.revisar(); }
}

/** Revisa todos los campos de un formulario; enfoca el primero con error. */
export function validarTodos(campos: QueryList<Regla> | readonly Regla[]) {
  let primero: Regla | null = null;
  campos.forEach(c => { if (!c.revisar() && !primero) primero = c; });
  (primero as Regla | null)?.el.nativeElement.focus();
  return !primero;
}

/** Campo con etiqueta, ayuda y mensaje de error. Con `ac` agrega una lista de autocompletado. */
@Component({
  selector: 'app-field',
  host: { class: 'field', '[class.invalid]': '!!regla()?.error()', '[class.valid]': 'valido()', '[class.relative]': '!!ac()' },
  template: `
    @if (label()) { <label [attr.for]="for()">{{ label() }}@if (regla()?.requerido()) { <span aria-hidden="true" class="text-error"> *</span> }</label> }
    <ng-content />
    @if (opciones().length) {
      <div class="absolute left-0 right-0 top-full -mt-4 z-30 bg-white border-2 border-t-0 border-acero rounded-b-lg max-h-56 overflow-auto shadow-suave" role="listbox">
        @for (o of opciones(); track o; let k = $index) {
          <button type="button" role="option" [attr.aria-selected]="k === marcada()" class="block w-full text-left min-h-11 px-3 border-0 text-[0.9375rem] cursor-pointer hover:bg-cobre-l"
            [class.bg-cobre-l]="k === marcada()" (mousedown)="$event.preventDefault()" (click)="elegir(o)">{{ o }}</button>
        }
      </div>
    }
    @if (hint()) { <div class="hint" [id]="for() + '-h'">{{ hint() }}</div> }
    @if (regla()?.error(); as msg) { <div class="err-m" role="alert"><app-icon name="alert" class="size-4" />{{ msg }}</div> }`,
  imports: [Icon],
})
export class Field {
  readonly label = input('');
  readonly for = input('');
  readonly hint = input('');
  /** Fuente de autocompletado: empresas, cargos, polis o trab. */
  readonly ac = input('');
  readonly elegido = output<string>();
  readonly regla = contentChild(Regla);
  readonly opciones = signal<string[]>([]);
  readonly marcada = signal(-1);
  readonly valido = computed(() => { const r = this.regla(); return !!r && r.tocado() && !r.error() && r.valor() !== '' && r.valor() !== false; });

  @HostListener('input', ['$event']) escribir(e: Event) {
    if (!this.ac()) return;
    const q = (e.target as HTMLInputElement).value.toLowerCase();
    this.opciones.set(q ? (AC[this.ac()] || []).filter(x => x.toLowerCase().includes(q)).slice(0, 8) : []);
    this.marcada.set(-1);
  }
  @HostListener('keydown', ['$event']) teclas(e: KeyboardEvent) {
    const n = this.opciones().length; if (!n) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); this.marcada.set((this.marcada() + 1) % n); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); this.marcada.set((this.marcada() - 1 + n) % n); }
    else if (e.key === 'Enter' && this.marcada() >= 0) { e.preventDefault(); this.elegir(this.opciones()[this.marcada()]); }
    else if (e.key === 'Escape') this.opciones.set([]);
  }
  @HostListener('focusout') salir() { setTimeout(() => this.opciones.set([]), 150); }

  elegir(v: string) {
    const r = this.regla();
    if (r) { r.el.nativeElement.value = v; r.el.nativeElement.dispatchEvent(new Event('input', { bubbles: true })); r.revisar(); }
    this.opciones.set([]);
    this.elegido.emit(v);
  }
}

/** Carga de archivos simulada: arrastrar y soltar, o elegir con clic o teclado. */
interface Archivo { id: number; name: string; size: number; p: number; timer?: ReturnType<typeof setInterval> }
let fileSeq = 0;
@Component({
  selector: 'app-file-drop',
  host: { class: 'block' },
  template: `
    <div tabindex="0" role="button" [attr.aria-label]="etiqueta() + ': arrastra archivos aquí o presiona Enter para elegir'"
      class="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors hover:bg-cobre-l hover:border-cobre"
      [class]="sobre() ? 'bg-cobre-l border-cobre' : 'bg-acero-xl border-acero'"
      (click)="sel.click()" (keydown.enter)="sel.click()" (keydown.space)="$event.preventDefault(); sel.click()"
      (dragover)="$event.preventDefault(); sobre.set(true)" (dragleave)="sobre.set(false)" (drop)="soltar($event)">
      <app-icon name="upload" class="mx-auto" />
      <div><strong>{{ etiqueta() }}</strong></div>
      <div class="text-sm muted">Arrastra y suelta aquí, o <span class="underline">elige un archivo</span></div>
      <div class="text-[0.8125rem] muted">{{ hint() }}</div>
      <input #sel type="file" class="sr" tabindex="-1" multiple (click)="$event.stopPropagation()" (change)="elegidos(sel)">
    </div>
    <div aria-live="polite">
      @for (f of archivos(); track f.id) {
        <div class="flex gap-3 items-center px-3 py-2.5 mt-2 border border-arena-2 rounded-lg bg-white">
          <app-icon name="file" />
          <div class="flex-1 min-w-0">
            <div class="text-sm"><strong>{{ f.name }}</strong> <span class="muted">{{ (f.size / 1024).toFixed(0) }} KB</span></div>
            <div class="flex items-center gap-2"><div class="bar"><i [style.width.%]="f.p"></i></div>
              @if (f.p >= 100) { <span class="text-[0.8125rem] text-senal">✓ Cargado y validado</span> } @else { <span class="text-[0.8125rem] muted">{{ f.p.toFixed(0) }}%</span> }
            </div>
          </div>
          <button type="button" class="ibtn" [attr.aria-label]="'Quitar ' + f.name" (click)="quitar(f)"><app-icon name="x" /></button>
        </div>
      }
    </div>`,
  imports: [Icon],
})
export class FileDrop {
  readonly etiqueta = input.required<string>();
  readonly hint = input('PDF, JPG o PNG · máx. 10 MB');
  readonly subido = output<string>();
  readonly quitado = output<void>();
  readonly archivos = signal<Archivo[]>([]);
  readonly sobre = signal(false);

  elegidos(i: HTMLInputElement) { [...(i.files || [])].forEach(f => this.agregar(f.name, f.size)); i.value = ''; }
  soltar(e: DragEvent) { e.preventDefault(); this.sobre.set(false); [...(e.dataTransfer?.files || [])].forEach(f => this.agregar(f.name, f.size)); }

  /** Simula la subida de un archivo (también sirve para la demostración con un clic). */
  agregar(name = 'documento.pdf', size = 240000 + Math.random() * 400000) {
    const f: Archivo = { id: ++fileSeq, name, size, p: 0 };
    this.archivos.update(l => [...l, f]);
    f.timer = setInterval(() => {
      f.p = Math.min(100, f.p + 8 + Math.random() * 14);
      if (f.p >= 100) { clearInterval(f.timer); this.subido.emit(name); }
      this.archivos.update(l => [...l]);
    }, 140);
  }
  quitar(f: Archivo) { clearInterval(f.timer); this.archivos.update(l => l.filter(x => x !== f)); this.quitado.emit(); }
  get listos() { return this.archivos().filter(f => f.p >= 100).length; }
}

/** Medidor de fuerza de la contraseña. */
@Component({
  selector: 'app-strength',
  host: { class: 'block mb-4 -mt-2' },
  template: `
    <div class="flex gap-1" aria-hidden="true">
      @for (k of [0, 1, 2, 3]; track k) { <i class="flex-1 h-1.5 rounded-sm" [style.background]="k < nivel() ? colores[nivel() - 1] : 'var(--color-acero-l)'"></i> }
    </div>
    <div class="text-[0.8125rem] muted mt-1" aria-live="polite">{{ valor() ? textos[nivel()] : '' }}</div>`,
})
export class Strength {
  readonly valor = input('');
  readonly nivel = computed(() => fuerza(this.valor()));
  readonly colores = ['#A32020', '#C58A10', '#6C8E3A', '#1F7A5C'];
  readonly textos = ['Muy débil', 'Débil', 'Aceptable', 'Fuerte', 'Muy fuerte'];
}
