import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { apiFetch } from '../components/auth/apiClient';
import { getRedirectUri, logout } from '../components/auth/authService';
import { generateCodeChallenge, generateCodeVerifier, generateState } from '../components/auth/pkce';

const BASE_URL = 'https://lostiemposapi20260817104248-avbkfhcfcucgf9e0.centralus-01.azurewebsites.net';
const AUTHORIZE_URL = `${BASE_URL}/connect/authorize`;
const CLIENT_ID = 'react-client';
const SCOPES = 'openid profile email offline_access';

export default function AuthTestScreen() {
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 1. Iniciar Flujo OAuth mediante /connect/authorize (GET)
  const handleConnectAuthorize = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const codeVerifier = generateCodeVerifier();
      const codeChallenge = await generateCodeChallenge(codeVerifier);
      const state = generateState();

      if (typeof window !== 'undefined') {
        sessionStorage.setItem('pkce_code_verifier', codeVerifier);
        sessionStorage.setItem('oauth_state', state);

        const params = new URLSearchParams({
          client_id: CLIENT_ID,
          redirect_uri: getRedirectUri(),
          response_type: 'code',
          scope: SCOPES,
          code_challenge: codeChallenge,
          code_challenge_method: 'S256',
          state,
        });

        // Redirige al servidor para procesar /connect/authorize
        window.location.href = `${AUTHORIZE_URL}?${params.toString()}`;
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al iniciar la autorización PKCE.');
      setLoading(false);
    }
  };

  // 2. Consultar /api/Profile para verificar la sesión y el rol
  const handleVerifyProfile = async () => {
    setChecking(true);
    setErrorMsg(null);
    try {
      const response = await apiFetch(`${BASE_URL}/api/Profile`);

      if (response.ok) {
        const data = await response.json();
        setUserInfo(data);
      } else {
        setUserInfo(null);
        setErrorMsg(`Sesión no válida o expirable (Status: ${response.status})`);
      }
    } catch (err: any) {
      setUserInfo(null);
      setErrorMsg(err.message || 'Error de conexión con /api/Profile');
    } finally {
      setChecking(false);
    }
  };

  // 3. Logout
  const handleLogout = async () => {
    await logout();
    setUserInfo(null);
    setErrorMsg(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧪 Banco de Pruebas de Autenticación</Text>
      <Text style={styles.subtitle}>Flujo /connect/authorize + Verificación de Perfil</Text>

      {/* Respuesta de Perfil Exitoso */}
      {userInfo && (
        <View style={styles.successCard}>
          <Text style={styles.successTitle}>✅ SESIÓN AUTENTICADA</Text>
          <Text style={styles.welcomeText}>
            Rol: {userInfo.role || userInfo.roles || userInfo.type || 'Verificado'}
          </Text>
          <Text style={styles.jsonText}>{JSON.stringify(userInfo, null, 2)}</Text>
        </View>
      )}

      {/* Mensajes de Error */}
      {errorMsg && (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>❌ {errorMsg}</Text>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <Pressable style={styles.btnPrimary} onPress={handleConnectAuthorize} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>1. Autorizar (/connect/authorize)</Text>}
        </Pressable>

        <Pressable style={styles.btnSecondary} onPress={handleVerifyProfile} disabled={checking}>
          {checking ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>2. Verificar Perfil (/api/Profile)</Text>}
        </Pressable>

        {userInfo && (
          <Pressable style={styles.btnDanger} onPress={handleLogout}>
            <Text style={styles.btnText}>Cerrar Sesión</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 25, justifyContent: 'center' },
  title: { fontSize: 22, color: '#fff', fontWeight: 'bold', textAlign: 'center', marginBottom: 6 },
  subtitle: { fontSize: 13, color: '#aaa', textAlign: 'center', marginBottom: 25 },
  successCard: { backgroundColor: '#1b4d2e', padding: 18, borderRadius: 10, borderColor: '#2ecc71', borderWidth: 1, marginBottom: 15 },
  successTitle: { color: '#2ecc71', fontWeight: 'bold', fontSize: 13, letterSpacing: 1 },
  welcomeText: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginTop: 4 },
  jsonText: { color: '#ddd', fontSize: 12, marginTop: 10, fontFamily: 'monospace' },
  errorCard: { backgroundColor: '#4a1515', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#e74c3c', marginBottom: 15 },
  errorText: { color: '#ff6b6b', textAlign: 'center', fontWeight: 'bold', fontSize: 13 },
  buttonContainer: { gap: 12 },
  btnPrimary: { backgroundColor: '#e50914', padding: 14, borderRadius: 8, alignItems: 'center' },
  btnSecondary: { backgroundColor: '#2980b9', padding: 14, borderRadius: 8, alignItems: 'center' },
  btnDanger: { backgroundColor: '#7f8c8d', padding: 14, borderRadius: 8, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
});