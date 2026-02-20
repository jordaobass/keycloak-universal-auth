# keycloak-universal-auth

[![CI](https://github.com/jordaobass/keycloak-universal-auth/actions/workflows/ci.yml/badge.svg)](https://github.com/jordaobass/keycloak-universal-auth/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/keycloak-universal-auth)](https://www.npmjs.com/package/keycloak-universal-auth)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Biblioteca universal de autenticação Keycloak para **Angular**, **React**, **Vue** e **Vanilla JS**.

Um core framework-agnostic com adaptadores nativos para cada framework, oferecendo DX nativa (Services, Hooks, Composables) em cada ecossistema.

## Instalação

```bash
npm install keycloak-universal-auth keycloak-js
```

## Uso

### Vanilla JS / TypeScript

```typescript
import { KeycloakAuth } from 'keycloak-universal-auth';

const auth = new KeycloakAuth({
  url: 'https://keycloak.exemplo.com',
  realm: 'meu-realm',
  clientId: 'meu-app',
});

await auth.init();

if (auth.state.authenticated) {
  console.log('Token:', auth.getToken());
  console.log('Roles:', auth.state.roles);
}

// Ações
await auth.login();
await auth.logout();
auth.hasRealmRole('admin');
```

---

### React

```tsx
import { KeycloakProvider, useKeycloak } from 'keycloak-universal-auth/react';

// App.tsx
function App() {
  return (
    <KeycloakProvider
      config={{ url: '...', realm: '...', clientId: '...' }}
      loadingComponent={<p>Carregando...</p>}
    >
      <MeuComponente />
    </KeycloakProvider>
  );
}

// Qualquer componente filho
function MeuComponente() {
  const { authenticated, userProfile, roles, login, logout, hasRealmRole } =
    useKeycloak();

  if (!authenticated) {
    return <button onClick={() => login()}>Entrar</button>;
  }

  return (
    <div>
      <p>Olá, {userProfile?.firstName}!</p>
      <p>Roles: {roles.join(', ')}</p>
      <p>Admin: {hasRealmRole('admin') ? 'Sim' : 'Não'}</p>
      <button onClick={() => logout()}>Sair</button>
    </div>
  );
}
```

---

### Angular

```typescript
// app.config.ts
import { provideKeycloak, keycloakInterceptor } from 'keycloak-universal-auth/angular';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

export const appConfig = {
  providers: [
    provideHttpClient(withInterceptors([keycloakInterceptor])),
    provideKeycloak({
      url: 'https://keycloak.exemplo.com',
      realm: 'meu-realm',
      clientId: 'meu-app',
    }),
  ],
};
```

```typescript
// Qualquer componente
import { Component, inject } from '@angular/core';
import { KeycloakService } from 'keycloak-universal-auth/angular';

@Component({ ... })
export class MeuComponente {
  private readonly keycloak = inject(KeycloakService);

  readonly authenticated$ = this.keycloak.authenticated$;
  readonly roles$ = this.keycloak.roles$;
  readonly userProfile$ = this.keycloak.userProfile$;

  login() { this.keycloak.login(); }
  logout() { this.keycloak.logout(); }
}
```

```typescript
// Protegendo rotas
import { keycloakGuard } from 'keycloak-universal-auth/angular';

export const routes = [
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [keycloakGuard({ roles: ['admin'] })],
  },
];
```

---

### Vue 3

```typescript
// main.ts
import { createApp } from 'vue';
import { keycloakPlugin } from 'keycloak-universal-auth/vue';
import App from './App.vue';

const app = createApp(App);
app.use(keycloakPlugin, {
  url: 'https://keycloak.exemplo.com',
  realm: 'meu-realm',
  clientId: 'meu-app',
});
app.mount('#app');
```

```vue
<!-- Qualquer componente -->
<script setup lang="ts">
import { useKeycloak } from 'keycloak-universal-auth/vue';

const { authenticated, userProfile, roles, login, logout, hasRealmRole } =
  useKeycloak();
</script>

<template>
  <div v-if="authenticated.value">
    <p>Olá, {{ userProfile.value?.firstName }}!</p>
    <p>Roles: {{ roles.value.join(', ') }}</p>
    <button @click="logout()">Sair</button>
  </div>
  <button v-else @click="login()">Entrar</button>
</template>
```

---

## API do Core

| Método | Descrição |
|--------|-----------|
| `init()` | Inicializa conexão com o Keycloak |
| `login(options?)` | Redireciona para a tela de login |
| `logout(options?)` | Desloga o usuário |
| `register(options?)` | Redireciona para a tela de registro |
| `updateToken(minValidity?)` | Atualiza o token se necessário |
| `hasRealmRole(role)` | Verifica role de realm |
| `hasResourceRole(role, resource?)` | Verifica role de recurso |
| `getToken()` | Retorna o token atual |
| `onStateChange(listener)` | Escuta mudanças de estado |
| `onEvent(event, listener)` | Escuta eventos do Keycloak |
| `destroy()` | Limpa timers e listeners |

## Configuração

```typescript
interface KeycloakAuthConfig {
  url: string;                    // URL do Keycloak
  realm: string;                  // Nome do realm
  clientId: string;               // Client ID
  initOptions?: KeycloakInitOptions; // Opções de inicialização
  tokenRefreshInterval?: number;  // Intervalo de refresh em segundos (padrão: 60)
  minTokenValidity?: number;      // Validade mínima do token em segundos (padrão: 30)
}
```

## Exemplos

Veja a pasta `examples/` para implementações completas:

- **[Vanilla JS](./examples/vanilla/)** — HTML puro com ES Modules
- **[React](./examples/react/)** — Provider + Hook
- **[Vue 3](./examples/vue/)** — Plugin + Composable
- **[Angular](./examples/angular/)** — Service + Guard + Interceptor

## Desenvolvimento

```bash
# Instalar dependências
npm install

# Build
npm run build

# Testes
npm test

# Verificar tipos
npm run lint
```

## Licença

MIT
