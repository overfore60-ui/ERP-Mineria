import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NAV, ROLES } from './data';
import { SimService } from './sim.service';
import { ToastService } from './toast.service';

export interface Usuario { role: string; name: string; ini: string }

/** Ids de las secciones con control de acceso (los mismos que usa el menú y `ROLES[...].items`). */
const SECCIONES = new Set(NAV.flatMap(g => g.items.map(i => i.id)));

const leer = <T>(k: string): T | null => { try { return JSON.parse(sessionStorage.getItem('ha.' + k) || 'null'); } catch { return null; } };
const guardar = (k: string, v: unknown) => { try { sessionStorage.setItem('ha.' + k, JSON.stringify(v)); } catch { /* sin almacenamiento */ } };

/** Sesión de demostración: perfil activo, preferencias de accesibilidad y recorrido guiado. */
@Injectable({ providedIn: 'root' })
export class SessionService {
  private router = inject(Router);
  private toast = inject(ToastService);
  private sim = inject(SimService);

  readonly user = signal<Usuario | null>(this.inicial());
  readonly rol = computed(() => { const u = this.user(); return u ? ROLES[u.role] : null; });
  /** Simulador y estado de la faena: el contratista entra por su portal en la nube y no los ve. */
  readonly veFaena = computed(() => { const u = this.user(); return !!u && u.role !== 'contratista'; });
  readonly sol = signal(false);
  readonly grande = signal(false);
  readonly tourVisto = signal<boolean>(leer<boolean>('tour') ?? false);
  readonly tourActivo = signal(false);
  readonly cambiarPerfil = signal(false);
  /** Ingreso a medio camino: perfil elegido y mecanismo (cuenta corporativa o credencial). */
  pendiente: { role: string; kind: 'corp' | 'cred' } | null = null;
  /** Ruta a la que volver después de iniciar sesión. */
  siguiente: string | null = null;

  private inicial(): Usuario | null {
    const s = leer<Usuario>('user');
    return s && ROLES[s.role] ? s : null;
  }

  login(role: string, rapido = false) {
    const r = ROLES[role];
    if (role === 'contratista') this.sim.reset();
    this.user.set({ role, name: r.person, ini: r.ini });
    guardar('user', this.user());
    this.toast.show(`Sesión iniciada como <strong>${r.label}</strong>${rapido ? ' (acceso rápido de demostración: omite el segundo factor)' : ''}.`, 'ok', 5000);
    const destino = this.siguiente || r.home;
    this.siguiente = null;
    this.router.navigateByUrl(destino);
  }

  logout() {
    this.user.set(null);
    guardar('user', null);
    this.toast.show('Sesión cerrada. Los datos locales del equipo se limpian al cerrar sesión.', 'info');
    this.router.navigateByUrl('/');
  }

  /** ¿El perfil activo puede ver esta sección? (control de acceso por roles) */
  permitido(item?: string) {
    const r = this.rol();
    return !item || !r || r.items.includes(item);
  }

  /**
   * ¿El perfil activo puede abrir esta ruta? Mira el primer tramo de la dirección (`/equipos/CF-07` es `equipos`).
   * Lo que no es una sección con permisos (portada, ingreso, documentación) queda permitido.
   */
  permitidoRuta(ruta: string | readonly unknown[]) {
    const r = this.rol();
    if (!r) return true;
    const url = typeof ruta === 'string' ? ruta : String(ruta[0] ?? '');
    const seccion = url.replace(/^[#/]+/, '').split(/[/?#]/)[0];
    return !SECCIONES.has(seccion) || r.items.includes(seccion);
  }

  alternarSol() {
    this.sol.update(v => !v);
    document.documentElement.dataset['sol'] = this.sol() ? '1' : '0';
    this.toast.show(this.sol() ? 'Modo sol activado: contraste máximo para uso a la intemperie.' : 'Modo sol desactivado.', 'info', 3000);
  }

  alternarGrande() {
    this.grande.update(v => !v);
    document.documentElement.style.fontSize = this.grande() ? '19px' : '';
    this.toast.show(this.grande() ? 'Texto grande activado.' : 'Texto normal.', 'info', 3000);
  }

  terminarTour() {
    this.tourActivo.set(false);
    this.tourVisto.set(true);
    guardar('tour', true);
  }
}
