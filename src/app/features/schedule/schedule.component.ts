import { Component, computed, inject, signal } from '@angular/core';
import { NgStyle } from '@angular/common';
import { SupabaseService } from '../../core/services/supabase.service';
import { UserService } from '../../core/services/user.service';
import { ToastService } from '../../core/services/toast.service';
import { DOWS, MONTHS } from '../../shared/constants';
import { personColor, personInitials } from '../../shared/utils/person-color.util';
import { DayModalComponent } from './day-modal/day-modal.component';

export interface CalendarCell {
  type: 'empty' | 'day';
  dateStr?: string;
  dayNum?: number;
  isToday?: boolean;
  isPast?: boolean;
  hasMe?: boolean;
  avatars?: { name: string; color: string; initials: string }[];
  noteCount?: number;
}

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [DayModalComponent, NgStyle],
  templateUrl: './schedule.component.html',
  styleUrl: './schedule.component.scss'
})
export class ScheduleComponent {
  private supabase = inject(SupabaseService);
  private userService = inject(UserService);
  private toast = inject(ToastService);

  readonly DOWS = DOWS;

  private today = new Date();
  viewYear = signal(this.today.getFullYear());
  viewMonth = signal(this.today.getMonth());
  selectedDate = signal<string | null>(null);

  readonly monthLabel = computed(() => {
    return `${MONTHS[this.viewMonth()]} ${this.viewYear()}`;
  });

  readonly calendarDays = computed<CalendarCell[]>(() => {
    const year = this.viewYear();
    const month = this.viewMonth();
    const todayStr = this.formatDate(this.today);
    const userName = this.userService.userName();
    const availability = this.supabase.availability();
    const notes = this.supabase.calendarNotes();

    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Monday start: (getDay() + 6) % 7 gives 0=Mon, 6=Sun
    const startPad = (firstDay.getDay() + 6) % 7;

    const cells: CalendarCell[] = [];

    for (let i = 0; i < startPad; i++) {
      cells.push({ type: 'empty' });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayAvail = availability.filter(a => a.date === dateStr);
      const dayNotes = notes.filter(n => n.date === dateStr);

      const uniquePeople = Array.from(new Set(dayAvail.map(a => a.person_name)));
      const avatars = uniquePeople.map(name => ({
        name,
        color: personColor(name),
        initials: personInitials(name)
      }));

      const cellDate = new Date(year, month, d);
      const cellDateStr = this.formatDate(cellDate);

      cells.push({
        type: 'day',
        dateStr,
        dayNum: d,
        isToday: dateStr === todayStr,
        isPast: cellDateStr < todayStr,
        hasMe: userName ? dayAvail.some(a => a.person_name === userName) : false,
        avatars,
        noteCount: dayNotes.length
      });
    }

    return cells;
  });

  readonly legend = computed(() => {
    const year = this.viewYear();
    const month = this.viewMonth();
    const availability = this.supabase.availability();

    const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}-`;
    const monthAvail = availability.filter(a => a.date.startsWith(monthPrefix));
    const nameSet = new Set(monthAvail.map(a => a.person_name));

    return Array.from(nameSet).map(name => ({
      name,
      color: personColor(name)
    }));
  });

  private formatDate(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  changeMonth(delta: number) {
    let m = this.viewMonth() + delta;
    let y = this.viewYear();
    if (m > 11) { m = 0; y++; }
    if (m < 0) { m = 11; y--; }
    this.viewMonth.set(m);
    this.viewYear.set(y);
  }

  openModal(dateStr: string) {
    this.selectedDate.set(dateStr);
  }

  closeModal() {
    this.selectedDate.set(null);
  }

  personColor = personColor;
}
