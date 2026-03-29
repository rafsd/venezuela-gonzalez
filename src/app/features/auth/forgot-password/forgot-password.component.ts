import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SupabaseService } from '../../../core/services/supabase.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {
  private supabase = inject(SupabaseService);
  private toast = inject(ToastService);

  readonly email = signal('');
  readonly loading = signal(false);
  readonly sent = signal(false);

  async submit() {
    const email = this.email().trim();
    if (!email) {
      this.toast.show('Ingresa tu correo electrónico');
      return;
    }
    this.loading.set(true);
    const redirectTo = `${window.location.origin}/reset-password`;
    const { error } = await this.supabase.client.auth.resetPasswordForEmail(email, { redirectTo });
    this.loading.set(false);
    if (error) {
      this.toast.show('Error al enviar el correo');
    } else {
      this.sent.set(true);
    }
  }
}
