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
  readonly placeName = signal('');
  readonly placeDesc = signal('');
  readonly placeCategory = signal('attraction');
  readonly sharedWith = signal<string[]>([]);
  readonly filter = signal('all');
  readonly adding = signal(false);

  // ── Members list (for the shared-with picker) ────────────────────────────────
  readonly members = signal<Profile[]>([]);

  // ── Edit state ───────────────────────────────────────────────────────────────
  readonly editingId = signal<string | null>(null);
  readonly editName = signal('');
  readonly editDesc = signal('');
  readonly editCategory = signal('');
  readonly editSharedWith = signal<string[]>([]);
  readonly saving = signal(false);

  readonly PLACE_CATS = PLACE_CATS;
  readonly PLACE_CAT_KEYS = Object.keys(PLACE_CATS);

  readonly currentUser = computed(() => this.auth.profile()?.display_name ?? '');

  readonly filteredPlaces = computed(() => {
    const f = this.filter();
    const places = this.supabase.places();
    if (f === 'all') return places;
    return places.filter(p => p.category === f);
  });

  async ngOnInit() {
    const all = await this.auth.loadAllProfiles();
    this.members.set(all.filter(p => p.role === 'admin' || p.role === 'member'));
  }

  getCat(key: string): PlaceCat {
    return PLACE_CATS[key] ?? PLACE_CATS['other'];
  }

  // ── Shared-with picker helpers ───────────────────────────────────────────────
  toggleSharedWith(name: string) {
    this.sharedWith.update(list =>
      list.includes(name) ? list.filter(n => n !== name) : [...list, name]
    );
  }

  isShared(name: string) {
    return this.sharedWith().includes(name);
  }

  membersExcludingSelf() {
    return this.members().filter(m => m.display_name !== this.currentUser());
  }

  initials(name: string) {
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  }

  // ── Add ──────────────────────────────────────────────────────────────────────
  async addPlace() {
    const name = this.placeName().trim();
    if (!name) return;
    const userName = this.currentUser();
    if (!userName) { this.toast.show('Por favor inicia sesión primero'); return; }
    this.adding.set(true);
    const desc = this.placeDesc().trim() || null;
    const { error } = await this.supabase.addPlace(name, desc, this.placeCategory(), userName, this.sharedWith());
    this.adding.set(false);
    if (error) {
      this.toast.show('Error al guardar: ' + error.message);
    } else {
      this.placeName.set('');
      this.placeDesc.set('');
      this.placeCategory.set('attraction');
      this.sharedWith.set([]);
      this.toast.show('¡Lugar agregado!');
    }
  }

  // ── Edit ─────────────────────────────────────────────────────────────────────
  startEdit(place: any) {
    this.editingId.set(place.id);
    this.editName.set(place.name);
    this.editDesc.set(place.description ?? '');
    this.editCategory.set(place.category);
    this.editSharedWith.set([...(place.shared_with ?? [])]);
  }

  cancelEdit() {
    this.editingId.set(null);
  }

  toggleEditSharedWith(name: string) {
    this.editSharedWith.update(list =>
      list.includes(name) ? list.filter(n => n !== name) : [...list, name]
    );
  }

  isEditShared(name: string) {
    return this.editSharedWith().includes(name);
  }

  async saveEdit(id: string) {
    const name = this.editName().trim();
    if (!name) return;
    this.saving.set(true);
    const { error } = await this.supabase.updatePlace(id, {
      name,
      description: this.editDesc().trim() || null,
      category: this.editCategory(),
      shared_with: this.editSharedWith()
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
