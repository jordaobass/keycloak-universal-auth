import { Component } from '@angular/core';

@Component({
  selector: 'app-admin',
  standalone: true,
  template: `
    <div class="container">
      <h2>Painel Admin</h2>
      <p>Este conteúdo só é acessível para usuários com a role "admin".</p>
      <p>O guard <code>keycloakGuard</code> protege esta rota automaticamente.</p>
    </div>
  `,
  styles: [`
    .container {
      padding: 2rem;
      font-family: system-ui;
    }
    code {
      background: #e2e8f0;
      padding: 0.15rem 0.4rem;
      border-radius: 4px;
      font-size: 0.9rem;
    }
  `],
})
export class AdminComponent {}
