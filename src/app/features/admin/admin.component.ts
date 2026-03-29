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
  private auth = inject(AuthService);
  private toast = inject(ToastService);

  readonly profiles = signal<Profile[]>([]);
  readonly loading = signal(true);

  readonly pending = () => this.profiles().filter(p => p.role === 'pending');
  readonly members = () => this.profiles().filter(p => p.role === 'member');
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
    if (error) {
      this.toast.show('Error al aprobar');
    } else {
      this.toast.show(`${profile.display_name} aprobado ✓`);
      await this.refresh();
    }
  }

  async reject(profile: Profile) {
    const { error } = await this.auth.rejectUser(profile.id);
    if (error) {
      this.toast.show('Error al rechazar');
    } else {
      this.toast.show(`${profile.display_name} rechazado`);
      await this.refresh();
    }
  }

  formatDate(dt: string) {
    return new Date(dt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
  }
}
