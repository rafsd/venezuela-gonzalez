import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';

export interface Profile {
  id: string;
  email: string;
  display_name: string;
  role: 'admin' | 'member' | 'pending' | 'rejected';
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private supabase = inject(SupabaseService);
  private router = inject(Router);

  private _user = signal<User | null>(null);
  private _profile = signal<Profile | null>(null);
  private _loading = signal(true);
  private _impersonatedProfile = signal<Profile | null>(null);

  readonly user = this._user.asReadonly();
  readonly profile = this._profile.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly impersonatedProfile = this._impersonatedProfile.asReadonly();
  readonly isAdmin = computed(() => this._profile()?.role === 'admin');
  readonly isApproved = computed(() => {
    const role = this._profile()?.role;
    return role === 'admin' || role === 'member';
  });

  constructor() {
    this.init();
  }

  private async init() {
    const { data: { session } } = await this.supabase.client.auth.getSession();
    if (session?.user) {
      this._user.set(session.user);
      await this.loadProfile(session.user.id);
    }
    this._loading.set(false);

    this.supabase.client.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        this._user.set(session.user);
        await this.loadProfile(session.user.id);
      } else {
        this._user.set(null);
        this._profile.set(null);
      }
    });
  }

  async loadProfile(userId: string) {
    const { data } = await this.supabase.client
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (data) this._profile.set(data as Profile);
  }

  async signIn(email: string, password: string) {
    const { error } = await this.supabase.client.auth.signInWithPassword({ email, password });
    return { error };
  }

  async signUp(email: string, password: string, displayName: string) {
    const { error } = await this.supabase.client.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } }
    });
    return { error };
  }

  async signOut() {
    await this.supabase.client.auth.signOut();
    this._user.set(null);
    this._profile.set(null);
    this.router.navigate(['/login']);
  }

  async loadAllProfiles(): Promise<Profile[]> {
    const { data } = await this.supabase.client
      .from('profiles')
      .select('*')
      .order('created_at');
    return (data ?? []) as Profile[];
  }

  async approveUser(userId: string) {
    const { error } = await this.supabase.client
      .from('profiles')
      .update({ role: 'member' })
      .eq('id', userId);
    return { error };
  }

  async rejectUser(userId: string) {
    const { error } = await this.supabase.client
      .from('profiles')
      .update({ role: 'rejected' })
      .eq('id', userId);
    return { error };
  }

  async setRole(userId: string, role: 'admin' | 'member') {
    const { error } = await this.supabase.client
      .from('profiles')
      .update({ role })
      .eq('id', userId);
    return { error };
  }

  startImpersonating(profile: Profile) {
    this._impersonatedProfile.set(profile);
  }

  stopImpersonating() {
    this._impersonatedProfile.set(null);
  }
}
