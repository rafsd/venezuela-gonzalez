import { Injectable, signal } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface Availability {
  id: string;
  person_name: string;
  date: string;
  created_at: string;
}

export interface CalendarNote {
  id: string;
  person_name: string;
  date: string;
  note: string;
  created_at: string;
}

export interface Place {
  id: string;
  name: string;
  description: string | null;
  category: string;
  added_by: string;
  shared_with: string[];
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  readonly client: SupabaseClient;
  private _availability = signal<Availability[]>([]);
  private _calendarNotes = signal<CalendarNote[]>([]);
  private _places = signal<Place[]>([]);

  readonly availability = this._availability.asReadonly();
  readonly calendarNotes = this._calendarNotes.asReadonly();
  readonly places = this._places.asReadonly();

  constructor() {
    this.client = createClient(
      'https://ydmdshlbttpnhsksmtml.supabase.co',
      'sb_publishable_p5qTHhy2oR3AOQBqyce6ZA_J7xwI4x0',
      { auth: { lock: <R>(_name: string, _timeout: number, fn: () => Promise<R>) => fn() } }
    );
    this.loadAll();
    this.subscribeRealtime();
  }

  private async loadAll() {
    const [a, n, p] = await Promise.all([
      this.client.from('availability').select('*'),
      this.client.from('calendar_notes').select('*'),
      this.client.from('places').select('*').order('created_at', { ascending: false })
    ]);
    if (a.data) this._availability.set(a.data);
    if (n.data) this._calendarNotes.set(n.data);
    if (p.data) this._places.set(p.data);
  }

  private subscribeRealtime() {
    this.client.channel('vg-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'availability' }, ({ eventType, new: n, old: o }: any) => {
        if (eventType === 'INSERT') this._availability.update(l => l.find(a => a.id === n.id) ? l : [...l, n]);
        if (eventType === 'DELETE') this._availability.update(l => l.filter(a => a.id !== o.id));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'calendar_notes' }, ({ eventType, new: n, old: o }: any) => {
        if (eventType === 'INSERT') this._calendarNotes.update(l => l.find(c => c.id === n.id) ? l : [...l, n]);
        if (eventType === 'UPDATE') this._calendarNotes.update(l => l.map(c => c.id === n.id ? n : c));
        if (eventType === 'DELETE') this._calendarNotes.update(l => l.filter(c => c.id !== o.id));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'places' }, ({ eventType, new: n, old: o }: any) => {
        if (eventType === 'INSERT') this._places.update(l => l.find(p => p.id === n.id) ? l : [n, ...l]);
        if (eventType === 'UPDATE') this._places.update(l => l.map(p => p.id === n.id ? n : p));
        if (eventType === 'DELETE') this._places.update(l => l.filter(p => p.id !== o.id));
      })
      .subscribe();
  }

  async addAvailability(personName: string, date: string) {
    const { data, error } = await this.client
      .from('availability')
      .insert({ person_name: personName, date })
      .select()
      .single();
    if (!error && data) this._availability.update(l => l.find(a => a.id === data.id) ? l : [...l, data]);
    return { error };
  }

  async deleteAvailability(id: string) {
    const { error } = await this.client.from('availability').delete().eq('id', id);
    if (!error) this._availability.update(l => l.filter(a => a.id !== id));
    return { error };
  }

  async addCalendarNote(personName: string, date: string, note: string) {
    const { data, error } = await this.client
      .from('calendar_notes')
      .insert({ person_name: personName, date, note })
      .select()
      .single();
    if (!error && data) this._calendarNotes.update(l => l.find(n => n.id === data.id) ? l : [...l, data]);
    return { data, error };
  }

  async updateCalendarNote(id: string, note: string) {
    const { data, error } = await this.client
      .from('calendar_notes')
      .update({ note })
      .eq('id', id)
      .select()
      .single();
    if (!error && data) this._calendarNotes.update(l => l.map(n => n.id === id ? data as CalendarNote : n));
    return { error };
  }

  async deleteCalendarNote(id: string) {
    const { error } = await this.client.from('calendar_notes').delete().eq('id', id);
    if (!error) this._calendarNotes.update(l => l.filter(n => n.id !== id));
    return { error };
  }

  async addPlace(name: string, description: string | null, category: string, addedBy: string, sharedWith: string[] = []) {
    const { data, error } = await this.client
      .from('places')
      .insert({ name, description, category, added_by: addedBy, shared_with: sharedWith })
      .select()
      .single();
    if (!error && data) this._places.update(l => l.find(p => p.id === data.id) ? l : [data, ...l]);
    return { data, error };
  }

  async updatePlace(id: string, updates: Partial<Pick<Place, 'name' | 'description' | 'category' | 'shared_with'>>) {
    const { data, error } = await this.client
      .from('places')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (!error && data) this._places.update(l => l.map(p => p.id === id ? data as Place : p));
    return { error };
  }

  async deletePlace(id: string) {
    const { error } = await this.client.from('places').delete().eq('id', id);
    if (!error) this._places.update(l => l.filter(p => p.id !== id));
    return { error };
  }
}
