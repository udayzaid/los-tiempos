import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  exchangeCodeForTokens,
  getProfile,
  logout,
} from '../../components/auth/authService';

function extractRole(profile: any): string {
  // El backend actualmente devuelve { role: "Admin" }.
  // Soportamos también variantes para evitar que un cambio de serialización
  // rompa el acceso del administrador.
 const directRole = profile?.rol ?? profile?.role ?? profile?.Rol ?? profile?.Role;
  if (typeof directRole === 'string') return directRole.trim();

 const roles = profile?.rol ?? profile?.roles ?? profile?.Rol ?? profile?.Roles;
  if (typeof roles === 'string') return roles.trim();
  
  if (Array.isArray(roles)) {
    const firstRole = roles.find((value) => typeof value === 'string');
    if (typeof firstRole === 'string') return firstRole.trim();

    const roleObject = roles.find((value) => value && typeof value === 'object');
    if (roleObject) {
      const objectRole = roleObject.role ?? roleObject.Role ?? roleObject.name ?? roleObject.Name;
      if (typeof objectRole === 'string') return objectRole.trim();
    }
  }

  return '';
}

export default function AuthCallbackScreen() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function processCallback() {
      if (typeof window === 'undefined') return;

      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const errorParam = urlParams.get('error');

      if (errorParam) {
        setError(`Error de autenticación: ${errorParam}`);
        return;
      }

      if (!code || !state) {
        setError('Faltan parámetros de respuesta en la URL (code/state).');
        return;
      }

      const savedState = sessionStorage.getItem('oauth_state');
      if (state !== savedState) {
        setError('Validación de seguridad fallida (State mismatch).');
        return;
      }

      const codeVerifier = sessionStorage.getItem('pkce_code_verifier');
      if (!codeVerifier) {
        setError('La sesión de inicio expiró. Intenta iniciar sesión nuevamente.');
        return;
      }

      try {
        // 1. Intercambiar el código OAuth por las cookies HttpOnly.
        await exchangeCodeForTokens(code, codeVerifier);

        // 2. Las claves PKCE ya no son necesarias después del exchange.
        sessionStorage.removeItem('pkce_code_verifier');
        sessionStorage.removeItem('oauth_state');

        // 3. Verificar la sesión y obtener el rol real desde el backend.
        const profileResponse = await getProfile();

        if (!profileResponse.ok) {
          throw new Error(`No se pudo verificar el perfil (HTTP ${profileResponse.status}).`);
        }

        const profile = await profileResponse.json();
        const role = extractRole(profile);

        console.info('[OAuth] Perfil recibido:', profile);
        console.info('[OAuth] Rol detectado:', role);

        if (role.toLowerCase() !== 'admin') {
          await logout();
          setError(
            `Tu cuenta está autenticada, pero no tiene permisos de administrador. Rol recibido: ${role || 'no informado'}`
          );
          return;
        }

        // 4. Usuario autenticado y con rol Admin: entrar directamente al panel.
        router.replace('/admin');
      } catch (err: any) {
        setError(err?.message || 'Error al completar el inicio de sesión.');
      }
    }

    processCallback();
  }, [router]);

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorCard}>
          <Text style={styles.errorTitle}>❌ No se pudo iniciar sesión</Text>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.retryButton} onPress={() => router.replace('/')}>
            <Text style={styles.retryText}>Volver al inicio</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#e50914" />
      <Text style={styles.loadingText}>Verificando tu sesión...</Text>
      <Text style={styles.subText}>Validando permisos de administrador</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
    padding: 20,
  },
  loadingText: {
    color: '#fff',
    marginTop: 20,
    fontSize: 16,
    fontWeight: 'bold',
  },
  subText: {
    color: '#888',
    marginTop: 5,
    fontSize: 12,
  },
  errorCard: {
    backgroundColor: '#2a1212',
    padding: 25,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e50914',
    maxWidth: 400,
    width: '100%',
    alignItems: 'center',
  },
  errorTitle: {
    color: '#ff4d4d',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  errorText: {
    color: '#ccc',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    textAlignVertical: 'center',
  },
  retryButton: {
    backgroundColor: '#e50914',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  retryText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});