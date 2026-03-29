import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  readonly auth = inject(AuthService);

  get initials(): string {
    const name = this.auth.profile()?.display_name ?? '';
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  }
}
