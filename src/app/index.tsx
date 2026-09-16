import { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

import { AuthModal } from '@/components/auth/AuthModal';
import { startLogin } from '@/components/auth/authService';
import { LiveChat } from '@/components/live/LiveChat';
import { LiveDescription } from '@/components/live/LiveDescription';
import { LiveHeader } from '@/components/live/LiveHeader';
import { PromoCardsRow } from '@/components/live/PromoCardsRow';
import { SiteFooter } from '@/components/live/SiteFooter';
import { VideoPlayer } from '@/components/live/VideoPlayer';
import { api } from '@/services/api';

export default function LiveScreen() {
  const { width } = useWindowDimensions();
  const isMobile = width < 760;

  const [mensajeApi, setMensajeApi] = useState<string>('');
  const [authVisible, setAuthVisible] = useState<boolean>(false);
  const [initialRegisterMode, setInitialRegisterMode] =
    useState<boolean>(false);
  const [streamUrl, setStreamUrl] = useState<string>('');

  useEffect(() => {
    // Verificar conexión con el backend
    if (typeof api?.getPrimer === 'function') {
      api
        .getPrimer()
        .then((data) => setMensajeApi(data))
        .catch(() => setMensajeApi('Servidor conectado'));
    }

    // Obtener y vigilar la transmisión activa.
    // La página puede permanecer abierta mientras el administrador inicia
    // o termina el Live, por eso volvemos a consultar periódicamente.
    if (typeof api?.getStream === 'function') {
      const loadStream = async () => {
        try {
          const res = await api.getStream();

          if (res && res.hasActiveStream && res.url) {
            setStreamUrl(res.url);
          } else {
            setStreamUrl('');
          }
        } catch (err) {
          console.error('Error cargando Stream:', err);
          setStreamUrl('');
        }
      };

      loadStream();

      const intervalId = setInterval(loadStream, 10000);

      return () => clearInterval(intervalId);
    }
  }, []);

  // INICIAR SESIÓN: ir directamente al login seguro del backend.
  const handleOpenLogin = async () => {
    try {
      await startLogin();
    } catch (err: any) {
      console.error('Error iniciando sesión:', err);
    }
  };

  // REGISTRO: mantiene el formulario de registro del frontend.
  const handleOpenRegister = () => {
    setInitialRegisterMode(true);
    setAuthVisible(true);
  };

  const hasActiveStream = Boolean(streamUrl);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.scrollContent}
    >
      {/* =========================
          HEADER
      ========================= */}
      <LiveHeader
        headline="Los Tiempos, señal en vivo - Artemis retorna, Trump y los convenios, Liga boliviana y las ultimas posiciones en las tablas"
        onOpenLogin={handleOpenLogin}
        onOpenRegister={handleOpenRegister}
      />

      {/* =========================
          CONTENIDO PRINCIPAL
      ========================= */}
      <View style={styles.page}>
        <View
          style={[
            styles.content,
            isMobile && styles.contentMobile,
          ]}
        >
          {/* =========================
              VIDEO
          ========================= */}
          <View
            style={[
              styles.videoArea,
              isMobile && styles.videoAreaMobile,
            ]}
          >
            {/* Indicador EN VIVO */}
            {hasActiveStream && (
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />

                <Text style={styles.liveBadgeText}>
                  EN VIVO
                </Text>
              </View>
            )}

            {/* Reproductor */}
            {hasActiveStream ? (
              <VideoPlayer videoUrl={streamUrl} />
            ) : (
              <View style={styles.noLiveContainer}>
                <Text style={styles.noLiveTitle}>Sin transmisión en vivo</Text>
                <Text style={styles.noLiveText}>
                  La transmisión aparecerá aquí cuando el administrador inicie el Live.
                </Text>
              </View>
            )}
          </View>

          {/* =========================
              CHAT
          ========================= */}
          <View
            style={[
              styles.chatArea,
              isMobile && styles.chatAreaMobile,
            ]}
          >
            <LiveChat />
          </View>
        </View>

        {/* =========================
            DESCRIPCIÓN
        ========================= */}
        <LiveDescription
          title="Transmisión en vivo 13/04/2026"
          body="Sigue nuestras transmisiones en directo y mantente informado. Disfruta de la señal en vivo, noticias y contenido de actualidad de Los Tiempos."
        />

        {/* =========================
            PROMOCIONES
        ========================= */}
        <PromoCardsRow />
      </View>

      {/* =========================
          FOOTER
      ========================= */}
      <SiteFooter />

      {/* =========================
          REGISTRO
      ========================= */}
      <AuthModal
        visible={authVisible}
        onClose={() => setAuthVisible(false)}
        initialRegister={initialRegisterMode}
      />
    </ScrollView>
  );
}

/* =========================================================
   ESTILOS
========================================================= */

const styles = StyleSheet.create({
  /* =========================
     PANTALLA
  ========================= */

  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  scrollContent: {
    flexGrow: 1,
  },

  /* =========================
     CONTENEDOR PRINCIPAL
  ========================= */

  page: {
    width: '100%',
    maxWidth: 1366,
    alignSelf: 'center',

    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 8,
  },

  /* =========================
     VIDEO + CHAT
  ========================= */

  content: {
    width: '100%',

    flexDirection: 'row',

    alignItems: 'stretch',

    gap: 14,
  },

  contentMobile: {
    flexDirection: 'column',
  },

  /* =========================
     ÁREA DEL VIDEO
  ========================= */

  videoArea: {
    flex: 1,
    minWidth: 0,
    position: 'relative',
  },
  videoAreaMobile: {
    width: '100%',
  },

  noLiveContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#F2F2F2',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },

  noLiveTitle: {
    color: '#333333',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },

  noLiveText: {
    color: '#777777',
    fontSize: 14,
    textAlign: 'center',
  },

  /* =========================
     CHAT
  ========================= */
  chatArea: {
    flex: 0,
    width: 360,
    minWidth: 360,
    maxWidth: 360,
  },

  chatAreaMobile: {
    width: '100%',

    maxWidth: undefined,
  },

  /* =========================
     INDICADOR EN VIVO
  ========================= */

  liveBadge: {
    position: 'absolute',

    zIndex: 2,

    left: 10,
    top: 10,

    flexDirection: 'row',

    alignItems: 'center',

    gap: 5,

    backgroundColor: '#E51C2A',

    paddingHorizontal: 9,
    paddingVertical: 5,

    borderRadius: 3,
  },

  liveDot: {
    width: 6,
    height: 6,

    borderRadius: 3,

    backgroundColor: '#FFFFFF',
  },

  liveBadgeText: {
    color: '#FFFFFF',

    fontSize: 10,

    fontWeight: '800',
  },
});