import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { SupabaseService } from '../../../core/services/supabase.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent implements OnInit {
  private supabase = inject(SupabaseService);
  private toast = inject(ToastService);
  private router = inject(Router);

  readonly password = signal('');
  readonly confirmPassword = signal('');
  readonly loading = signal(false);
  readonly done = signal(false);
  readonly errorMsg = signal('');
  readonly ready = signal(false);

  ngOnInit() {
    // Check for error in the URL hash (e.g. expired link)
    const hash = window.location.hash;
    if (hash.includes('error=')) {
      const params = new URLSearchParams(hash.slice(1));
      const desc = params.get('error_description') ?? 'El enlace es inválido o ha expirado';
      this.errorMsg.set(desc.replace(/\+/g, ' '));
      return;
    }

    // Supabase sets the session from the hash token automatically;
    // listen for PASSWORD_RECOVERY event to confirm it's ready
    this.supabase.client.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        this.ready.set(true);
      }
    });

    // If session already exists (token was processed), mark ready
    this.supabase.client.auth.getSession().then(({ data }) => {
      if (data.session) this.ready.set(true);
    });
  }

  async submit() {
    const pwd = this.password();
    if (pwd.length < 6) {
      this.toast.show('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (pwd !== this.confirmPassword()) {
      this.toast.show('Las contraseñas no coinciden');
      return;
    }
    this.loading.set(true);
    const { error } = await this.supabase.client.auth.updateUser({ password: pwd });
    this.loading.set(false);
    if (error) {
      this.toast.show('Error al cambiar la contraseña');
    } else {
      this.done.set(true);
      setTimeout(() => this.router.navigate(['/schedule']), 2000);
    }
  }
}
