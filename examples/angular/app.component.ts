import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { KeycloakService } from 'keycloak-universal-auth/angular';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, AsyncPipe],
  template: `
    <nav>
      <a routerLink="/">Home</a>
      <a routerLink="/perfil">Perfil</a>
      <a routerLink="/admin">Admin</a>

      @if (authenticated$ | async) {
        <button (click)="logout()">Sair</button>
      } @else {
        <button (click)="login()">Entrar</button>
      }
    </nav>

    <router-outlet />
  `,
  styles: [`
    nav {
      display: flex;
      gap: 1rem;
      padding: 1rem;
      background: #1e293b;
      align-items: center;
    }
    nav a { color: #94a3b8; text-decoration: none; }
    nav a:hover { color: white; }
    nav button {
      margin-left: auto;
      padding: 0.4rem 1rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      background: #3b82f6;
      color: white;
    }
  `],
})
export class AppComponent {
  private readonly keycloak = inject(KeycloakService);
  readonly authenticated$ = this.keycloak.authenticated$;

  login(): void {
    this.keycloak.login();
  }

  logout(): void {
    this.keycloak.logout();
  }
}
