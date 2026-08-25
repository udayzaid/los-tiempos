import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
// Importamos apuntando a la carpeta components/auth donde están los utilitarios
import { exchangeCodeForTokens } from '../../components/auth/authService';
export default function AuthCallbackScreen() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function processCallback() {
      // Verificamos que se ejecute únicamente en entorno web
      if (typeof window === 'undefined') return;

      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const errorParam = urlParams.get('error');

      // 1. Manejar error retornado por Azure
      if (errorParam) {
        setError(`Error de autenticación: ${errorParam}`);
        return;
      }

      // 2. Validar presencia de parámetros obligatorios
      if (!code || !state) {
        setError('Faltan parámetros de respuesta en la URL (code/state).');
        return;
      }

      // 3. Validación Anti-CSRF (State Mismatch)
      const savedState = sessionStorage.getItem('oauth_state');
      if (state !== savedState) {
        setError('Validación de seguridad fallida (State mismatch).');
        return;
      }

      // 4. Validar el verifiador PKCE
      const codeVerifier = sessionStorage.getItem('pkce_code_verifier');
      if (!codeVerifier) {
        setError('La sesión de inicio expiró. Intenta iniciar sesión nuevamente.');
        return;
      }

      try {
        // 5. Intercambio del código por cookies HttpOnly en Backend
        await exchangeCodeForTokens(code, codeVerifier);

        // 6. Limpieza de claves temporales de sesión
        sessionStorage.removeItem('pkce_code_verifier');
        sessionStorage.removeItem('oauth_state');

        // 👈 REDIRECCIÓN DE PRUEBA: Mandamos a /auth-test para verificar las cookies en la tarjeta
        // (Cuando confirmes que todo funciona, cambia esto por: router.replace('/admin'))
        router.replace('/auth-test');
      } catch (err: any) {
        setError(err?.message || 'Error al completar el intercambio de sesión.');
      }
    }

    processCallback();
  }, [router]);

  // Si ocurre algún fallo en el proceso de autenticación
  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorCard}>
          <Text style={styles.errorTitle}>❌ Error de Autenticación</Text>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.retryButton} onPress={() => router.replace('/auth-test')}>
            <Text style={styles.retryText}>Volver a intentar</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // Pantalla de carga mientras se realiza la validación invisible de tokens
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#e50914" />
      <Text style={styles.loadingText}>Procesando credenciales de sesión...</Text>
      <Text style={styles.subText}>Guardando cookies seguras en el navegador</Text>
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