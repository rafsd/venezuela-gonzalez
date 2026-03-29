import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  private router = inject(Router);

  readonly loading = signal(false);
  readonly displayName = signal('');
  readonly email = signal('');
  readonly password = signal('');
  readonly confirmPassword = signal('');
  readonly submitted = signal(false);

  set(field: 'displayName' | 'email' | 'password' | 'confirmPassword', value: string) {
    if (field === 'displayName') this.displayName.set(value);
    else if (field === 'email') this.email.set(value);
    else if (field === 'password') this.password.set(value);
    else this.confirmPassword.set(value);
  }

  async submit() {
    const name = this.displayName().trim();
    const email = this.email().trim();
    const pwd = this.password();
    const confirm = this.confirmPassword();

    if (!name || !email || !pwd) {
      this.toast.show('Por favor completa todos los campos');
      return;
    }
    if (pwd.length < 6) {
      this.toast.show('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (pwd !== confirm) {
      this.toast.show('Las contraseñas no coinciden');
      return;
    }

    this.loading.set(true);
    const { error } = await this.auth.signUp(email, pwd, name);
    this.loading.set(false);

    if (error) {
      this.toast.show(error.message.includes('already') ? 'Este correo ya está registrado' : 'Error al registrarse');
      return;
    }

    this.submitted.set(true);
  }
}
