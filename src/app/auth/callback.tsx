import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  exchangeCodeForTokens,
  getProfile,
} from '../../components/auth/authService';

/**
 * Obtiene el rol del perfil independientemente
 * de cómo venga serializado desde el backend.
 *
 * Ejemplos soportados:
 * { role: "User" }
 * { rol: "User" }
 * { roles: ["User"] }
 * { rol: ["User"] }
 * { roles: [{ name: "User" }] }
 */
function extractRole(profile: any): string {
  const directRole =
    profile?.rol ??
    profile?.role ??
    profile?.Rol ??
    profile?.Role;

  // Caso:
  // { role: "User" }
  if (typeof directRole === 'string') {
    return directRole.trim();
  }

  // Caso:
  // { rol: ["User"] }
  // { roles: ["User"] }
  if (Array.isArray(directRole)) {
    const stringRole = directRole.find(
      (value) => typeof value === 'string'
    );

    if (typeof stringRole === 'string') {
      return stringRole.trim();
    }

    // Caso:
    // { roles: [{ name: "User" }] }
    // { roles: [{ role: "User" }] }
    const roleObject = directRole.find(
      (value) =>
        value !== null &&
        typeof value === 'object'
    );

    if (roleObject) {
      const objectRole =
        roleObject.role ??
        roleObject.Role ??
        roleObject.name ??
        roleObject.Name;

      if (typeof objectRole === 'string') {
        return objectRole.trim();
      }
    }
  }

  // Soporte adicional para "roles" / "Roles"
  const roles =
    profile?.roles ??
    profile?.Roles;

  if (typeof roles === 'string') {
    return roles.trim();
  }

  if (Array.isArray(roles)) {
    const stringRole = roles.find(
      (value) => typeof value === 'string'
    );

    if (typeof stringRole === 'string') {
      return stringRole.trim();
    }

    const roleObject = roles.find(
      (value) =>
        value !== null &&
        typeof value === 'object'
    );

    if (roleObject) {
      const objectRole =
        roleObject.role ??
        roleObject.Role ??
        roleObject.name ??
        roleObject.Name;

      if (typeof objectRole === 'string') {
        return objectRole.trim();
      }
    }
  }

  return '';
}

export default function AuthCallbackScreen() {
  const router = useRouter();

  const [error, setError] = useState<string | null>(
    null
  );

  useEffect(() => {
    async function processCallback() {
      if (typeof window === 'undefined') {
        return;
      }

      const urlParams = new URLSearchParams(
        window.location.search
      );

      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const errorParam = urlParams.get('error');

      // ==========================================
      // ERROR DEVUELTO POR OAUTH
      // ==========================================

      if (errorParam) {
        setError(
          `Error de autenticación: ${errorParam}`
        );
        return;
      }

      // ==========================================
      // VALIDAR CODE Y STATE
      // ==========================================

      if (!code || !state) {
        setError(
          'Faltan parámetros de respuesta en la URL (code/state).'
        );
        return;
      }

      // ==========================================
      // VALIDAR STATE
      // ==========================================

      const savedState =
        sessionStorage.getItem('oauth_state');

      if (!savedState || state !== savedState) {
        setError(
          'Validación de seguridad fallida (State mismatch).'
        );
        return;
      }

      // ==========================================
      // OBTENER CODE VERIFIER
      // ==========================================

      const codeVerifier =
        sessionStorage.getItem(
          'pkce_code_verifier'
        );

      if (!codeVerifier) {
        setError(
          'La sesión de inicio expiró. Intenta iniciar sesión nuevamente.'
        );
        return;
      }

      try {
        // ========================================
        // 1. INTERCAMBIAR CÓDIGO
        // ========================================

        // El backend establece las cookies
        // HttpOnly de la sesión.
        await exchangeCodeForTokens(
          code,
          codeVerifier
        );

        console.info(
          '[OAuth] Exchange completado correctamente.'
        );

        // ========================================
        // 2. LIMPIAR DATOS TEMPORALES PKCE
        // ========================================

        sessionStorage.removeItem(
          'pkce_code_verifier'
        );

        sessionStorage.removeItem(
          'oauth_state'
        );

        // ========================================
        // 3. OBTENER PROFILE
        // ========================================

        const profileResponse =
          await getProfile();

        if (!profileResponse.ok) {
          throw new Error(
            `No se pudo verificar el perfil (HTTP ${profileResponse.status}).`
          );
        }

        const profile =
          await profileResponse.json();

        // ========================================
        // 4. OBTENER ROL
        // ========================================

        const role =
          extractRole(profile);

        console.info(
          '[OAuth] Perfil recibido:',
          profile
        );

        console.info(
          '[OAuth] Rol detectado:',
          role
        );

        // ========================================
        // 5. ADMIN
        // ========================================

        if (
          role.toLowerCase() === 'admin'
        ) {
          console.info(
            '[OAuth] Usuario Admin → /admin'
          );

          router.replace('/admin');
          return;
        }

        // ========================================
        // 6. USER
        // ========================================

        if (
          role.toLowerCase() === 'user'
        ) {
          console.info(
            '[OAuth] Usuario User → Index principal'
          );

          router.replace('/');
          return;
        }

        // ========================================
        // 7. ROL DESCONOCIDO
        // ========================================

        setError(
          `La cuenta está autenticada, pero el rol recibido no es compatible: ${
            role || 'no informado'
          }`
        );
      } catch (err: any) {
        console.error(
          '[OAuth] Error al completar autenticación:',
          err
        );

        setError(
          err?.message ||
            'Error al completar el inicio de sesión.'
        );
      }
    }

    processCallback();
  }, [router]);

  // ==========================================
  // PANTALLA DE ERROR
  // ==========================================

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorCard}>
          <Text style={styles.errorTitle}>
            ❌ No se pudo iniciar sesión
          </Text>

          <Text style={styles.errorText}>
            {error}
          </Text>

          <Pressable
            style={styles.retryButton}
            onPress={() =>
              router.replace('/')
            }
          >
            <Text style={styles.retryText}>
              Volver al inicio
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // ==========================================
  // PANTALLA DE CARGA
  // ==========================================

  return (
    <View style={styles.container}>
      <ActivityIndicator
        size="large"
        color="#e50914"
      />

      <Text style={styles.loadingText}>
        Verificando tu sesión...
      </Text>

      <Text style={styles.subText}>
        Obteniendo información de tu cuenta
      </Text>
    </View>
  );
}

// ==========================================
// ESTILOS
// ==========================================

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