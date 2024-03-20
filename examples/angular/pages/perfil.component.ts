import { Component, inject } from '@angular/core';
import { AsyncPipe, JsonPipe } from '@angular/common';
import { KeycloakService } from 'keycloak-universal-auth/angular';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [AsyncPipe, JsonPipe],
  template: `
    <div class="container">
      <h2>Meu Perfil</h2>

      @if (userProfile$ | async; as profile) {
        <p><strong>Nome:</strong> {{ profile.firstName }} {{ profile.lastName }}</p>
        <p><strong>Email:</strong> {{ profile.email }}</p>
        <p><strong>Username:</strong> {{ profile.username }}</p>
      }

      <h3>Roles</h3>
      <pre>{{ (roles$ | async) | json }}</pre>
    </div>
  `,
  styles: [`
    .container { padding: 2rem; font-family: system-ui; }
    pre {
      background: #1e293b;
      color: #e2e8f0;
      padding: 1rem;
      border-radius: 6px;
      overflow-x: auto;
    }
  `],
})
export class PerfilComponent {
  private readonly keycloak = inject(KeycloakService);
  readonly userProfile$ = this.keycloak.userProfile$;
  readonly roles$ = this.keycloak.roles$;
}
