<!--
  Exemplo Vue 3 — keycloak-universal-auth

  Instalação:
    npm install keycloak-universal-auth keycloak-js vue

  Setup em main.ts:
    import { createApp } from 'vue';
    import { keycloakPlugin } from 'keycloak-universal-auth/vue';
    import App from './App.vue';

    const app = createApp(App);
    app.use(keycloakPlugin, {
      url: 'http://localhost:8080',
      realm: 'meu-realm',
      clientId: 'meu-app',
    });
    app.mount('#app');
-->
<script setup lang="ts">
import { useKeycloak } from 'keycloak-universal-auth/vue';

const {
  initialized,
  authenticated,
  userProfile,
  roles,
  login,
  logout,
  hasRealmRole,
} = useKeycloak();
</script>

<template>
  <div class="container">
    <h1>Exemplo Vue 3 — Keycloak Universal Auth</h1>

    <div v-if="!initialized.value" class="loading">
      Carregando autenticação...
    </div>

    <template v-else>
      <!-- Usuário não autenticado -->
      <div v-if="!authenticated.value" class="unauthenticated">
        <p>Você não está autenticado.</p>
        <div class="actions">
          <button class="btn-login" @click="login()">Entrar</button>
          <button class="btn-register" @click="login({ action: 'register' })">
            Registrar
          </button>
        </div>
      </div>

      <!-- Usuário autenticado -->
      <div v-else class="authenticated">
        <h2>
          Bem-vindo, {{ userProfile.value?.firstName ?? 'Usuário' }}!
        </h2>
        <p>Email: {{ userProfile.value?.email ?? 'N/A' }}</p>
        <p>Roles: {{ roles.value.join(', ') || 'nenhuma' }}</p>
        <p>É admin? {{ hasRealmRole('admin') ? 'Sim' : 'Não' }}</p>

        <button class="btn-logout" @click="logout()">Sair</button>

        <!-- Conteúdo protegido por role -->
        <div v-if="hasRealmRole('admin')" class="admin-panel">
          <h3>Painel Admin</h3>
          <p>Este conteúdo só é visível para administradores.</p>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.container {
  padding: 2rem;
  font-family: system-ui, -apple-system, sans-serif;
  max-width: 600px;
  margin: 0 auto;
}

.actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

button {
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
}

.btn-login { background: #3b82f6; color: white; }
.btn-register { background: #22c55e; color: white; }
.btn-logout { background: #ef4444; color: white; }

.admin-panel {
  margin-top: 1.5rem;
  padding: 1rem;
  background: #f0fdf4;
  border: 1px solid #86efac;
  border-radius: 6px;
}
</style>
