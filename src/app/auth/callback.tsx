import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

import {
  exchangeCodeForTokens,
} from '../../components/auth/authService';
import { useAuth } from '../../context/AuthContext';
import { SiteFooter } from '../../components/live/SiteFooter';
import { LiveTheme } from '../../constants/live-theme';

function extractRole(profile: any): string {
  const directRole =
    profile?.rol ??
    profile?.role ??
    profile?.Rol ??
    profile?.Role;

  if (typeof directRole === 'string') {
    return directRole.trim();
  }

  if (Array.isArray(directRole)) {
    const stringRole = directRole.find(
      (value) => typeof value === 'string'
    );

    if (typeof stringRole === 'string') {
      return stringRole.trim();
    }

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
  const { width } = useWindowDimensions();
  const { refreshProfile } = useAuth();

  const [error, setError] = useState<string | null>(null);

  const isMobile = width < 700;

  useEffect(() => {
    async function processCallback() {
      if (typeof window === 'undefined') {
        return;
      }

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

      if (!savedState || state !== savedState) {
        setError('Validación de seguridad fallida (State mismatch).');
        return;
      }

      const codeVerifier = sessionStorage.getItem('pkce_code_verifier');

      if (!codeVerifier) {
        setError('La sesión de inicio expiró. Intenta iniciar sesión nuevamente.');
        return;
      }

      const processingKey = 'oauth_processing_code';
      const processingCode = sessionStorage.getItem(processingKey);

      if (processingCode === code) {
        console.info('[OAuth] Callback duplicado ignorado para el mismo code.');
        return;
      }

      sessionStorage.setItem(processingKey, code);

      try {
        await exchangeCodeForTokens(code, codeVerifier);

        console.info('[OAuth] Exchange completado correctamente.');

        sessionStorage.removeItem('pkce_code_verifier');
        sessionStorage.removeItem('oauth_state');
        sessionStorage.removeItem(processingKey);

        const profile = await refreshProfile();

        if (!profile) {
          throw new Error('No se pudo verificar el perfil autenticado.');
        }

        const role = extractRole(profile);

        console.info('[OAuth] Rol detectado:', role);

        // Después de autenticarse, todos vuelven a la página pública.
        // El botón Administrar del header llevará al dashboard cuando corresponda.
        console.info('[OAuth] Autenticación completada → página principal');
        router.replace('/');
      } catch (err: any) {
        console.error('[OAuth] Error al completar autenticación:', err);
        setError(
          err?.message ||
            'Error al completar el inicio de sesión.'
        );
      }
    }

    processCallback();
  }, [router, refreshProfile]);

  return (
    <View style={styles.screen}>
      {/* =========================
          HEADER DE AUTENTICACIÓN
      ========================= */}
      <View style={styles.header}>
        <View
          style={[
            styles.headerInner,
            isMobile && styles.headerInnerMobile,
          ]}
        >
          <View
            style={[
              styles.buildingFrame,
              isMobile && styles.buildingFrameMobile,
            ]}
            pointerEvents="none"
          >
            <Image
              source={require('../../../imagenes/logo 2.1.png')}
              style={[
                styles.buildingLogo,
                isMobile && styles.buildingLogoMobile,
              ]}
              resizeMode="contain"
            />
          </View>

          <View
            style={[
              styles.brandFrame,
              isMobile && styles.brandFrameMobile,
            ]}
            pointerEvents="none"
          >
            <Image
              source={require('../../../imagenes/logo 1 (1).png')}
              style={[
                styles.logo,
                isMobile && styles.logoMobile,
              ]}
              resizeMode="contain"
            />
          </View>
        </View>

        <View style={styles.goldBar}>
          <Text style={styles.goldBarText}>
            LOS TIEMPOS · AUTENTICACIÓN
          </Text>
        </View>
      </View>

      {/* =========================
          CONTENIDO
      ========================= */}
      <View style={styles.content}>
        <View
          style={[
            styles.authCard,
            isMobile && styles.authCardMobile,
          ]}
        >
          <View style={styles.cardAccent} />

          <Image
            source={require('../../../imagenes/logo 1 (1).png')}
            style={styles.cardLogo}
            resizeMode="contain"
          />

          {error ? (
            <>
              <View style={styles.statusIconError}>
                <Text style={styles.statusIconText}>!</Text>
              </View>

              <Text style={styles.title}>
                No se pudo iniciar sesión
              </Text>

              <Text style={styles.description}>
                {error}
              </Text>

              <Pressable
                style={styles.retryButton}
                onPress={() => router.replace('/')}
              >
                <Text style={styles.retryText}>
                  Volver al inicio
                </Text>
              </Pressable>
            </>
          ) : (
            <>
              <View style={styles.statusIcon}>
                <ActivityIndicator
                  size="small"
                  color={LiveTheme.gold}
                />
              </View>

              <Text style={styles.title}>
                Iniciar sesión
              </Text>

              <Text style={styles.description}>
                Estamos verificando tu sesión y preparando tu cuenta.
              </Text>

              <Text style={styles.subDescription}>
                Un momento, por favor...
              </Text>
            </>
          )}
        </View>
      </View>

      {/* =========================
          FOOTER
      ========================= */}
      <SiteFooter />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: LiveTheme.offWhite,
  },

  header: {
    width: '100%',
    backgroundColor: LiveTheme.offWhite,
  },

  headerInner: {
    width: '100%',
    height: 115,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: LiveTheme.border,
  },

  headerInnerMobile: {
    height: 110,
    paddingHorizontal: 10,
  },

  buildingFrame: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 350,
    height: 115,
    justifyContent: 'center',
    alignItems: 'flex-start',
    overflow: 'hidden',
  },

  buildingFrameMobile: {
    width: 180,
    height: 90,
  },

  buildingLogo: {
    width: 350,
    height: 120,
  },

  buildingLogoMobile: {
    width: 180,
    height: 90,
  },

  brandFrame: {
    width: 350,
    height: 115,
    justifyContent: 'center',
    alignItems: 'center',
  },

  brandFrameMobile: {
    width: 210,
    height: 75,
  },

  logo: {
    width: 350,
    height: 115,
  },

  logoMobile: {
    width: 210,
    height: 75,
  },

  goldBar: {
    width: '100%',
    height: 34,
    backgroundColor: LiveTheme.gold,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  goldBarText: {
    color: LiveTheme.black,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  content: {
    flex: 1,
    width: '100%',
    minHeight: 420,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 50,
  },

  authCard: {
    width: '100%',
    maxWidth: 440,
    minHeight: 330,
    backgroundColor: LiveTheme.white,
    borderWidth: 1,
    borderColor: '#D9D9D9',
    borderRadius: 12,
    paddingHorizontal: 42,
    paddingVertical: 34,
    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },

  authCardMobile: {
    maxWidth: 380,
    paddingHorizontal: 24,
    paddingVertical: 30,
  },

  cardAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 5,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    backgroundColor: LiveTheme.gold,
  },

  cardLogo: {
    width: 180,
    height: 70,
    marginBottom: 18,
  },

  statusIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: LiveTheme.black,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },

  statusIconError: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: LiveTheme.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },

  statusIconText: {
    color: LiveTheme.black,
    fontSize: 24,
    fontWeight: '800',
  },

  title: {
    color: LiveTheme.black,
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 10,
  },

  description: {
    color: '#555555',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    maxWidth: 340,
  },

  subDescription: {
    color: '#888888',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },

  retryButton: {
    marginTop: 22,
    height: 38,
    paddingHorizontal: 18,
    backgroundColor: LiveTheme.gold,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  retryText: {
    color: LiveTheme.black,
    fontSize: 12,
    fontWeight: '700',
  },
});