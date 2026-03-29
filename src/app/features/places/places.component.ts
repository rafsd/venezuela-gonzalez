import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgStyle } from '@angular/common';
import { SupabaseService } from '../../core/services/supabase.service';
import { UserService } from '../../core/services/user.service';
import { ToastService } from '../../core/services/toast.service';
import { PLACE_CATS, PlaceCat } from '../../shared/constants';

@Component({
  selector: 'app-places',
  standalone: true,
  imports: [FormsModule, NgStyle],
  templateUrl: './places.component.html',
  styleUrl: './places.component.scss'
})
export class PlacesComponent {
  readonly supabase = inject(SupabaseService);
  private userService = inject(UserService);
  private toast = inject(ToastService);

  readonly placeName = signal('');
  readonly placeDesc = signal('');
  readonly placeCategory = signal('attraction');
  readonly filter = signal('all');
  readonly adding = signal(false);

  readonly PLACE_CATS = PLACE_CATS;
  readonly PLACE_CAT_KEYS = Object.keys(PLACE_CATS);

  readonly filteredPlaces = computed(() => {
    const f = this.filter();
    const places = this.supabase.places();
    if (f === 'all') return places;
    return places.filter(p => p.category === f);
  });

  getCat(key: string): PlaceCat {
    return PLACE_CATS[key] ?? PLACE_CATS['other'];
  }

  async addPlace() {
    const name = this.placeName().trim();
    if (!name) return;
    const userName = this.userService.userName().trim();
    if (!userName) {
      this.toast.show('Por favor ingresa tu nombre primero');
      return;
    }
    this.adding.set(true);
    const desc = this.placeDesc().trim() || null;
    const { error } = await this.supabase.addPlace(name, desc, this.placeCategory(), userName);
    this.adding.set(false);
    if (error) {
      this.toast.show('Error al guardar el lugar');
    } else {
      this.placeName.set('');
      this.placeDesc.set('');
      this.placeCategory.set('attraction');
      this.toast.show('¡Lugar agregado!');
    }
  }

  async deletePlace(id: string) {
    const { error } = await this.supabase.deletePlace(id);
    if (error) this.toast.show('Error al eliminar el lugar');
    else this.toast.show('Lugar eliminado');
  }

  formatDate(dt: string): string {
    const date = new Date(dt);
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
  }
}
