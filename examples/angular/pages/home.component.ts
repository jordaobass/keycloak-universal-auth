import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { KeycloakService } from 'keycloak-universal-auth/angular';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [AsyncPipe],
  template: `
    <div class="container">
      <h1>Exemplo Angular — Keycloak Universal Auth</h1>

      @if (authenticated$ | async) {
        <p>Você está autenticado!</p>
        <p>Roles: {{ (roles$ | async)?.join(', ') || 'nenhuma' }}</p>
      } @else {
        <p>Você não está autenticado.</p>
        <button (click)="login()">Entrar</button>
      }
    </div>
  `,
  styles: [`
    .container { padding: 2rem; font-family: system-ui; }
    button {
      padding: 0.6rem 1.2rem;
      border: none;
      border-radius: 6px;
      background: #3b82f6;
      color: white;
      cursor: pointer;
      margin-top: 0.5rem;
    }
  `],
})
export class HomeComponent {
  private readonly keycloak = inject(KeycloakService);
  readonly authenticated$ = this.keycloak.authenticated$;
  readonly roles$ = this.keycloak.roles$;

  login(): void {
    this.keycloak.login();
  }
}
