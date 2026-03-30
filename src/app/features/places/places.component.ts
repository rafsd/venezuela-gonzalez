import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { SupabaseService } from '../../core/services/supabase.service';
import { AuthService, Profile } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { PLACE_CATS, PlaceCat } from '../../shared/constants';

@Component({
  selector: 'app-places',
  standalone: true,
  imports: [],
  templateUrl: './places.component.html',
  styleUrl: './places.component.scss'
})
export class PlacesComponent implements OnInit {
  readonly supabase = inject(SupabaseService);
  private auth = inject(AuthService);
  private toast = inject(ToastService);

  // ── Form state ──────────────────────────────────────────────────────────────
  readonly placeName     = signal('');
  readonly placeDesc     = signal('');
  readonly placeCategory = signal('attraction');
  readonly visibilityMode = signal<'all' | 'specific'>('all');
  readonly sharedWith    = signal<string[]>([]);
  readonly filter        = signal('all');
  readonly adding        = signal(false);

  // ── Members list ─────────────────────────────────────────────────────────────
  readonly members = signal<Profile[]>([]);

  // ── Edit state ───────────────────────────────────────────────────────────────
  readonly editingId          = signal<string | null>(null);
  readonly editName           = signal('');
  readonly editDesc           = signal('');
  readonly editCategory       = signal('');
  readonly editVisibilityMode = signal<'all' | 'specific'>('all');
  readonly editSharedWith     = signal<string[]>([]);
  readonly saving             = signal(false);

  readonly PLACE_CATS     = PLACE_CATS;
  readonly PLACE_CAT_KEYS = Object.keys(PLACE_CATS);

  readonly currentUser = computed(() => this.auth.profile()?.display_name ?? '');

  readonly filteredPlaces = computed(() => {
    const f    = this.filter();
    const me   = this.currentUser();
    const all  = this.supabase.places();

    // Visibility: show if shared_with is empty (public) OR I'm the creator OR I'm in the list
    const visible = all.filter(p => {
      const sw = p.shared_with ?? [];
      return sw.length === 0 || p.added_by === me || sw.includes(me);
    });

    if (f === 'all') return visible;
    return visible.filter(p => p.category === f);
  });

  async ngOnInit() {
    const all = await this.auth.loadAllProfiles();
    this.members.set(all.filter(p => p.role === 'admin' || p.role === 'member'));
  }

  getCat(key: string): PlaceCat {
    return PLACE_CATS[key] ?? PLACE_CATS['other'];
  }

  membersExcludingSelf() {
    return this.members().filter(m => m.display_name !== this.currentUser());
  }

  initials(name: string) {
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  }

  // ── Add form visibility ───────────────────────────────────────────────────────
  setVisibilityMode(mode: 'all' | 'specific') {
    this.visibilityMode.set(mode);
    if (mode === 'all') this.sharedWith.set([]);
  }

  toggleSharedWith(name: string) {
    this.sharedWith.update(l => l.includes(name) ? l.filter(n => n !== name) : [...l, name]);
  }

  isShared(name: string) { return this.sharedWith().includes(name); }

  // ── Add ──────────────────────────────────────────────────────────────────────
  async addPlace() {
    const name = this.placeName().trim();
    if (!name) return;
    const userName = this.currentUser();
    if (!userName) { this.toast.show('Por favor inicia sesión primero'); return; }

    const visibility = this.visibilityMode() === 'specific' ? this.sharedWith() : [];

    this.adding.set(true);
    const desc = this.placeDesc().trim() || null;
    const { error } = await this.supabase.addPlace(name, desc, this.placeCategory(), userName, visibility);
    this.adding.set(false);

    if (error) {
      this.toast.show('Error al guardar: ' + error.message);
    } else {
      this.placeName.set('');
      this.placeDesc.set('');
      this.placeCategory.set('attraction');
      this.visibilityMode.set('all');
      this.sharedWith.set([]);
      this.toast.show('¡Lugar agregado!');
    }
  }

  // ── Edit ─────────────────────────────────────────────────────────────────────
  startEdit(place: any) {
    const sw = place.shared_with ?? [];
    this.editingId.set(place.id);
    this.editName.set(place.name);
    this.editDesc.set(place.description ?? '');
    this.editCategory.set(place.category);
    this.editVisibilityMode.set(sw.length > 0 ? 'specific' : 'all');
    this.editSharedWith.set([...sw]);
  }

  cancelEdit() { this.editingId.set(null); }

  setEditVisibilityMode(mode: 'all' | 'specific') {
    this.editVisibilityMode.set(mode);
    if (mode === 'all') this.editSharedWith.set([]);
  }

  toggleEditSharedWith(name: string) {
    this.editSharedWith.update(l => l.includes(name) ? l.filter(n => n !== name) : [...l, name]);
  }

  isEditShared(name: string) { return this.editSharedWith().includes(name); }

  async saveEdit(id: string) {
    const name = this.editName().trim();
    if (!name) return;
    const visibility = this.editVisibilityMode() === 'specific' ? this.editSharedWith() : [];
    this.saving.set(true);
    const { error } = await this.supabase.updatePlace(id, {
      name,
      description: this.editDesc().trim() || null,
      category: this.editCategory(),
      shared_with: visibility
    });
    this.saving.set(false);
    if (error) {
      this.toast.show('Error al guardar');
    } else {
      this.editingId.set(null);
      this.toast.show('Lugar actualizado');
    }
  }

  // ── Delete ───────────────────────────────────────────────────────────────────
  async deletePlace(id: string) {
    const { error } = await this.supabase.deletePlace(id);
    if (error) this.toast.show('Error al eliminar el lugar');
    else this.toast.show('Lugar eliminado');
  }

  formatDate(dt: string): string {
    return new Date(dt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
  }
}
