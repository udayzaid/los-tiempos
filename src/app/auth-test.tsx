import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { apiFetch } from '../components/auth/apiClient';
import {
  getProfile,
  getRedirectUri,
  logout,
  refreshSession,
} from '../components/auth/authService';
import { generateCodeChallenge, generateCodeVerifier, generateState } from '../components/auth/pkce';

const BASE_URL = 'https://lostiemposapi20260817104248-avbkfhcfcucgf9e0.centralus-01.azurewebsites.net';
const AUTHORIZE_URL = `${BASE_URL}/connect/authorize`;
const CLIENT_ID = 'react-client';
const SCOPES = 'openid profile email offline_access users:read users:write';
const REFRESH_INTERVAL_MS = 5 * 60 * 1000;

export default function AuthTestScreen() {
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [sessionStatus, setSessionStatus] = useState('Sin verificar');

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
        setSessionStatus('Sesión válida');
      } else {
        setUserInfo(null);
        setSessionStatus(`Sesión no válida (${response.status})`);
        setErrorMsg(`Sesión no válida o expirada (Status: ${response.status})`);
      }
    } catch (err: any) {
      setUserInfo(null);
      setSessionStatus('Error de conexión');
      setErrorMsg(err.message || 'Error de conexión con /api/Profile');
    } finally {
      setChecking(false);
    }
  };

  // 3. Renovar la sesión y volver a verificar el perfil.
  const handleRefresh = async (silent = false) => {
    if (!silent) {
      setRefreshing(true);
      setErrorMsg(null);
    }

    try {
      const refreshed = await refreshSession();

      if (!refreshed) {
        setUserInfo(null);
        setSessionStatus('Sesión expirada');
        if (!silent) {
          setErrorMsg('No se pudo renovar la sesión.');
        }
        return;
      }

      const response = await getProfile();

      if (response.ok) {
        const data = await response.json();
        setUserInfo(data);
        setSessionStatus(`Sesión renovada · ${new Date().toLocaleTimeString()}`);
        return;
      }

      setUserInfo(null);
      setSessionStatus(`Perfil no válido (${response.status})`);
      if (!silent) {
        setErrorMsg(`La renovación terminó, pero /api/Profile respondió ${response.status}.`);
      }
    } catch (err: any) {
      setUserInfo(null);
      setSessionStatus('Error al renovar');
      if (!silent) {
        setErrorMsg(err.message || 'Error al renovar la sesión.');
      }
    } finally {
      if (!silent) {
        setRefreshing(false);
      }
    }
  };

  // Renovación periódica: cada 5 minutos mientras esta pantalla de prueba esté abierta.
  useEffect(() => {
    if (!userInfo) return;

    const interval = window.setInterval(() => {
      handleRefresh(true);
    }, REFRESH_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [userInfo]);

  // 4. Logout
  const handleLogout = async () => {
    await logout();
    setUserInfo(null);
    setSessionStatus('Sesión cerrada');
    setErrorMsg(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧪 Banco de Pruebas de Autenticación</Text>
      <Text style={styles.subtitle}>OAuth + Perfil + Refresh + Logout</Text>
      <Text style={styles.sessionStatus}>Estado: {sessionStatus}</Text>

      {userInfo && (
        <View style={styles.successCard}>
          <Text style={styles.successTitle}>✅ SESIÓN AUTENTICADA</Text>
          <Text style={styles.welcomeText}>
            Rol: {userInfo.role || userInfo.roles || userInfo.type || 'Verificado'}
          </Text>
          <Text style={styles.jsonText}>{JSON.stringify(userInfo, null, 2)}</Text>
        </View>
      )}

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
          <>
            <Pressable style={styles.btnRefresh} onPress={() => handleRefresh(false)} disabled={refreshing}>
              {refreshing ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>3. Renovar Sesión (/api/auth/refresh)</Text>}
            </Pressable>

            <Pressable style={styles.btnDanger} onPress={handleLogout}>
              <Text style={styles.btnText}>4. Cerrar Sesión (/api/auth/logout)</Text>
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 25, justifyContent: 'center' },
  title: { fontSize: 22, color: '#fff', fontWeight: 'bold', textAlign: 'center', marginBottom: 6 },
  subtitle: { fontSize: 13, color: '#aaa', textAlign: 'center', marginBottom: 10 },
  sessionStatus: { color: '#ddd', textAlign: 'center', marginBottom: 20, fontSize: 13 },
  successCard: { backgroundColor: '#1b4d2e', padding: 18, borderRadius: 10, borderColor: '#2ecc71', borderWidth: 1, marginBottom: 15 },
  successTitle: { color: '#2ecc71', fontWeight: 'bold', fontSize: 13, letterSpacing: 1 },
  welcomeText: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginTop: 4 },
  jsonText: { color: '#ddd', fontSize: 12, marginTop: 10, fontFamily: 'monospace' },
  errorCard: { backgroundColor: '#4a1515', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#e74c3c', marginBottom: 15 },
  errorText: { color: '#ff6b6b', textAlign: 'center', fontWeight: 'bold', fontSize: 13 },
  buttonContainer: { gap: 12 },
  btnPrimary: { backgroundColor: '#e50914', padding: 14, borderRadius: 8, alignItems: 'center' },
  btnSecondary: { backgroundColor: '#2980b9', padding: 14, borderRadius: 8, alignItems: 'center' },
  btnRefresh: { backgroundColor: '#8e44ad', padding: 14, borderRadius: 8, alignItems: 'center' },
  btnDanger: { backgroundColor: '#7f8c8d', padding: 14, borderRadius: 8, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
});