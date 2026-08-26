import {
  generateCodeChallenge,
  generateCodeVerifier,
  generateState,
} from './pkce';

const BASE_URL = 'https://lostiemposapi20260817104248-avbkfhcfcucgf9e0.centralus-01.azurewebsites.net';

export const AUTHORIZE_ENDPOINT = `${BASE_URL}/connect/authorize`;
export const EXCHANGE_ENDPOINT = `${BASE_URL}/api/auth/exchange`;
export const REFRESH_ENDPOINT = `${BASE_URL}/api/auth/refresh`;
export const LOGOUT_ENDPOINT = `${BASE_URL}/api/auth/logout`;

const CLIENT_ID = 'react-client';
const SCOPES = 'openid profile email offline_access users:read users:write';

export function getRedirectUri(): string {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/auth/callback`;
  }

  return 'http://localhost:8081/auth/callback';
}

export async function startLogin(): Promise<void> {
  if (typeof window === 'undefined') {
    throw new Error('El inicio de sesión solo está disponible en el navegador.');
  }

  // Mismo flujo PKCE utilizado por el harness de pruebas del backend.
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  const state = generateState();

  sessionStorage.setItem('pkce_code_verifier', codeVerifier);
  sessionStorage.setItem('oauth_state', state);

  const redirectUri = getRedirectUri();

  const params = new URLSearchParams();
  params.set('client_id', CLIENT_ID);
  params.set('redirect_uri', redirectUri);
  params.set('response_type', 'code');
  params.set('scope', SCOPES);
  params.set('code_challenge', codeChallenge);
  params.set('code_challenge_method', 'S256');
  params.set('state', state);

  const authorizeUrl = `${AUTHORIZE_ENDPOINT}?${params.toString()}`;

  console.info('[OAuth] Iniciando autorización:', {
    authorizeEndpoint: AUTHORIZE_ENDPOINT,
    clientId: CLIENT_ID,
    redirectUri,
    responseType: 'code',
    scope: SCOPES,
    codeChallengeMethod: 'S256',
    state,
  });
  console.info('[OAuth] URL completa:', authorizeUrl);

  // Igual que el harness del backend: navegación del navegador al endpoint
  // /connect/authorize. No se envía fetch ni se agrega Content-Type manualmente.
  window.location.href = authorizeUrl;
}

export async function exchangeCodeForTokens(code: string, codeVerifier: string): Promise<void> {
  const response = await fetch(EXCHANGE_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      code,
      codeVerifier,
      redirectUri: getRedirectUri(),
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    console.error('Error al intercambiar el código:', errorBody);
    throw new Error('No se pudo completar el inicio de sesión.');
  }
}

export async function refreshSession(): Promise<boolean> {
  try {
    const response = await fetch(REFRESH_ENDPOINT, {
      method: 'POST',
      credentials: 'include',
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function logout(): Promise<void> {
  try {
    await fetch(LOGOUT_ENDPOINT, {
      method: 'POST',
      credentials: 'include',
    });
  } catch (err) {
    console.error('Error en logout:', err);
  }
}
