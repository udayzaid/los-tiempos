const BASE_URL = 'https://lostiemposapi20260817104248-avbkfhcfcucgf9e0.centralus-01.azurewebsites.net';

export const EXCHANGE_ENDPOINT = `${BASE_URL}/api/auth/exchange`;
export const REFRESH_ENDPOINT = `${BASE_URL}/api/auth/refresh`;
export const LOGOUT_ENDPOINT = `${BASE_URL}/api/auth/logout`;

// src/auth/authService.ts
// src/components/auth/authService.ts

// src/components/auth/authService.ts
export function getRedirectUri(): string {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/auth/callback`;
  }
  return 'http://localhost:8081/auth/callback.tsx';
}


export async function exchangeCodeForTokens(code: string, codeVerifier: string): Promise<void> {
  const response = await fetch(EXCHANGE_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // Imprescindible para guardar cookies HttpOnly
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
