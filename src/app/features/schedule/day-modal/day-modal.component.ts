import { Component, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgStyle } from '@angular/common';
import { SupabaseService } from '../../../core/services/supabase.service';
import { UserService } from '../../../core/services/user.service';
import { ToastService } from '../../../core/services/toast.service';
import { DAY_NAMES, MONTHS } from '../../../shared/constants';
import { personColor, personInitials } from '../../../shared/utils/person-color.util';

@Component({
  selector: 'app-day-modal',
  standalone: true,
  imports: [FormsModule, NgStyle],
  templateUrl: './day-modal.component.html',
  styleUrl: './day-modal.component.scss'
})
export class DayModalComponent {
  readonly selectedDate = input.required<string>();
  readonly close = output<void>();

  private supabase = inject(SupabaseService);
  private userService = inject(UserService);
  private toast = inject(ToastService);

  readonly noteText = signal('');
  readonly saving = signal(false);
  readonly editingNoteId = signal<string | null>(null);
  readonly editNoteText = signal('');
  readonly savingEdit = signal(false);
  readonly confirmDeleteId = signal<string | null>(null);

  readonly dateLabel = computed(() => {
    const dateStr = this.selectedDate();
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const dayName = DAY_NAMES[date.getDay()];
    const monthName = MONTHS[month - 1];
    return `${dayName}, ${day} de ${monthName} ${year}`;
  });

  readonly dayAvailability = computed(() => {
    return this.supabase.availability().filter(a => a.date === this.selectedDate());
  });

  readonly dayNotes = computed(() => {
    return this.supabase.calendarNotes()
      .filter(n => n.date === this.selectedDate())
      .slice()
      .sort((a, b) => a.created_at.localeCompare(b.created_at));
  });

  readonly hasMe = computed(() => {
    const userName = this.userService.userName();
    if (!userName) return false;
    return this.dayAvailability().some(a => a.person_name === userName);
  });

  async toggleAvailability() {
    const userName = this.userService.userName().trim();
    if (!userName) {
      this.toast.show('Por favor ingresa tu nombre primero');
      return;
    }
    if (this.hasMe()) {
      const existing = this.dayAvailability().find(a => a.person_name === userName);
      if (existing) {
        const { error } = await this.supabase.deleteAvailability(existing.id);
        if (error) this.toast.show('Error al eliminar disponibilidad');
        else this.toast.show('Disponibilidad eliminada');
      }
    } else {
      const { error } = await this.supabase.addAvailability(userName, this.selectedDate());
      if (error) this.toast.show('Error al guardar disponibilidad');
      else this.toast.show('¡Disponibilidad marcada!');
    }
  }

  async addNote() {
    const userName = this.userService.userName().trim();
    const text = this.noteText().trim();
    if (!userName) {
      this.toast.show('Por favor ingresa tu nombre primero');
      return;
    }
    if (!text) return;
    this.saving.set(true);
    const { error } = await this.supabase.addCalendarNote(userName, this.selectedDate(), text);
    this.saving.set(false);
    if (error) {
      this.toast.show('Error al guardar la nota');
    } else {
      this.noteText.set('');
      this.toast.show('Nota agregada');
    }
  }

  startEditNote(id: string, currentText: string) {
    this.editingNoteId.set(id);
    this.editNoteText.set(currentText);
  }

  cancelEditNote() {
    this.editingNoteId.set(null);
    this.editNoteText.set('');
  }

  async saveEditNote(id: string) {
    const text = this.editNoteText().trim();
    if (!text) return;
    this.savingEdit.set(true);
    const { error } = await this.supabase.updateCalendarNote(id, text);
    this.savingEdit.set(false);
    if (error) {
      this.toast.show('Error al guardar la nota');
    } else {
      this.editingNoteId.set(null);
      this.editNoteText.set('');
    }
  }

  requestDeleteNote(id: string) {
    this.confirmDeleteId.set(id);
  }

  cancelDeleteNote() {
    this.confirmDeleteId.set(null);
  }

  async confirmDelete(id: string) {
    if (this.editingNoteId() === id) this.cancelEditNote();
    this.confirmDeleteId.set(null);
    const { error } = await this.supabase.deleteCalendarNote(id);
    if (error) this.toast.show('Error al eliminar la nota');
    else this.toast.show('Nota eliminada');
  }

  canManageNote(personName: string): boolean {
    const userName = this.userService.userName().trim();
    return !!userName && userName === personName;
  }

  formatNoteTime(dt: string): string {
    const date = new Date(dt);
    return date.toLocaleString('es-ES', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  personColor = personColor;
  personInitials = personInitials;
}
