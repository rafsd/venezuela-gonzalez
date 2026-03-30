import { Injectable, computed, inject } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class UserService {
  private auth = inject(AuthService);

  readonly userName = computed(() => {
    const impersonated = this.auth.impersonatedProfile();
    if (impersonated) return impersonated.display_name;
    return this.auth.profile()?.display_name ?? '';
  });
}
