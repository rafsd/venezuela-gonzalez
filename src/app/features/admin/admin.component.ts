import { Component, OnInit, inject, signal } from '@angular/core';
import { AuthService, Profile } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent implements OnInit {
  readonly auth = inject(AuthService);
  private toast = inject(ToastService);

  readonly profiles = signal<Profile[]>([]);
  readonly loading = signal(true);

  readonly pending  = () => this.profiles().filter(p => p.role === 'pending');
  readonly members  = () => this.profiles().filter(p => p.role === 'member');
  readonly admins   = () => this.profiles().filter(p => p.role === 'admin' && p.id !== this.auth.profile()?.id);
  readonly rejected = () => this.profiles().filter(p => p.role === 'rejected');

  async ngOnInit() {
    await this.refresh();
  }

  private async refresh() {
    this.loading.set(true);
    this.profiles.set(await this.auth.loadAllProfiles());
    this.loading.set(false);
  }

  async approve(profile: Profile) {
    const { error } = await this.auth.approveUser(profile.id);
    if (error) { this.toast.show('Error al aprobar'); return; }
    this.toast.show(`${profile.display_name} aprobado`);
    await this.refresh();
  }

  async reject(profile: Profile) {
    const { error } = await this.auth.rejectUser(profile.id);
    if (error) { this.toast.show('Error al rechazar'); return; }
    this.toast.show(`${profile.display_name} rechazado`);
    await this.refresh();
  }

  async makeAdmin(profile: Profile) {
    const { error } = await this.auth.setRole(profile.id, 'admin');
    if (error) { this.toast.show('Error al actualizar rol'); return; }
    this.toast.show(`${profile.display_name} es ahora administrador`);
    await this.refresh();
  }

  async removeAdmin(profile: Profile) {
    const { error } = await this.auth.setRole(profile.id, 'member');
    if (error) { this.toast.show('Error al actualizar rol'); return; }
    this.toast.show(`${profile.display_name} ya no es administrador`);
    await this.refresh();
  }

  impersonate(profile: Profile) {
    this.auth.startImpersonating(profile);
    this.toast.show(`Impersonando a ${profile.display_name}`);
  }

  formatDate(dt: string) {
    return new Date(dt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
  }
}
