import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  private router = inject(Router);

  readonly loading = signal(false);
  readonly email = signal('');
  readonly password = signal('');

  set(field: 'email' | 'password', value: string) {
    if (field === 'email') this.email.set(value);
    else this.password.set(value);
  }

  async submit() {
    const email = this.email().trim();
    const password = this.password();
    if (!email || !password) {
      this.toast.show('Por favor completa todos los campos');
      return;
    }
    this.loading.set(true);
    const { error } = await this.auth.signIn(email, password);
    this.loading.set(false);
    if (error) {
      this.toast.show('Correo o contraseña incorrectos');
      return;
    }
    const role = this.auth.profile()?.role;
    if (role === 'pending') {
      this.router.navigate(['/pending']);
    } else if (role === 'rejected') {
      this.toast.show('Tu solicitud fue rechazada');
      await this.auth.signOut();
    } else {
      this.router.navigate(['/schedule']);
    }
  }
}
