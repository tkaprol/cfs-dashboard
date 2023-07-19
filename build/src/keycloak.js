import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  realm: window.__RUNTIME_CONFIG__.REACT_APP_REALM_NAME,
  url: window.__RUNTIME_CONFIG__.REACT_APP_KEYCLOAK_URL,
  clientId: window.__RUNTIME_CONFIG__.REACT_APP_CLIENT_ID
});

export default keycloak;