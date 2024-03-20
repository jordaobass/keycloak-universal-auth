/**
 * Exemplo React — keycloak-universal-auth
 *
 * Instalação:
 *   npm install keycloak-universal-auth keycloak-js react react-dom
 *
 * Uso:
 *   Substitua url, realm e clientId pelas configurações do seu Keycloak.
 */
import { KeycloakProvider, useKeycloak } from 'keycloak-universal-auth/react';

const keycloakConfig = {
  url: 'http://localhost:8080',
  realm: 'meu-realm',
  clientId: 'meu-app',
};

function UserInfo() {
  const { authenticated, userProfile, roles, login, logout, hasRealmRole } =
    useKeycloak();

  if (!authenticated) {
    return (
      <div>
        <p>Você não está autenticado.</p>
        <button onClick={() => login()}>Entrar</button>
        <button onClick={() => login({ action: 'register' })}>Registrar</button>
      </div>
    );
  }

  return (
    <div>
      <h2>Bem-vindo, {userProfile?.firstName ?? 'Usuário'}!</h2>
      <p>Email: {userProfile?.email ?? 'N/A'}</p>
      <p>Roles: {roles.join(', ') || 'nenhuma'}</p>
      <p>É admin? {hasRealmRole('admin') ? 'Sim' : 'Não'}</p>
      <button onClick={() => logout()}>Sair</button>
    </div>
  );
}

function ProtectedContent() {
  const { authenticated, hasRealmRole } = useKeycloak();

  if (!authenticated || !hasRealmRole('admin')) {
    return <p>Conteúdo restrito a administradores.</p>;
  }

  return (
    <div>
      <h3>Painel Admin</h3>
      <p>Este conteúdo só é visível para admins.</p>
    </div>
  );
}

export default function App() {
  return (
    <KeycloakProvider
      config={keycloakConfig}
      loadingComponent={<p>Carregando autenticação...</p>}
      onAuthSuccess={() => console.log('Autenticado com sucesso!')}
      onAuthError={(err) => console.error('Erro na autenticação:', err)}
    >
      <div style={{ padding: '2rem', fontFamily: 'system-ui' }}>
        <h1>Exemplo React — Keycloak Universal Auth</h1>
        <UserInfo />
        <hr style={{ margin: '1rem 0' }} />
        <ProtectedContent />
      </div>
    </KeycloakProvider>
  );
}
