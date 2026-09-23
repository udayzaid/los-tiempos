import { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

import { AdSlot } from '@/components/ads/AdSlot';
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

  const isMobile = width < 900;
  const showSideAds = width >= 1340;

  const [authVisible, setAuthVisible] = useState<boolean>(false);
  const [initialRegisterMode, setInitialRegisterMode] =
    useState<boolean>(false);

  const [streamUrl, setStreamUrl] = useState<string>('');

  useEffect(() => {
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

  // INICIAR SESIÓN:
  // El login se realiza directamente mediante el flujo OAuth del backend.
  const handleOpenLogin = async () => {
    try {
      await startLogin();
    } catch (err: any) {
      console.error(
        'Error iniciando sesión:',
        err?.message || err
      );
    }
  };

  // REGISTRO:
  // Mantiene el formulario de registro del frontend.
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
        {/* =========================
            FILA PRINCIPAL

            PUBLICIDAD | VIDEO + CHAT | PUBLICIDAD
        ========================= */}
        <View
          style={[
            styles.layoutRow,
            isMobile && styles.layoutRowMobile,
          ]}
        >
          {/* =========================
              PUBLICIDAD IZQUIERDA
          ========================= */}
          {showSideAds && (
            <View style={styles.adColumn}>
              <AdSlot placement="left" />
            </View>
          )}

          {/* =========================
              CONTENIDO CENTRAL
              VIDEO + CHAT
          ========================= */}
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
              {/* Si existe un Live del backend,
                  mostramos la etiqueta EN VIVO. */}
              {hasActiveStream && (
                <View style={styles.liveBadge}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveBadgeText}>
                    EN VIVO
                  </Text>
                </View>
              )}

              {/* Si existe una transmisión activa,
                  usa la URL del backend.
                  Si no existe, VideoPlayer utiliza
                  su video de respaldo. */}
              <VideoPlayer videoUrl={streamUrl} />
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
              PUBLICIDAD DERECHA
          ========================= */}
          {showSideAds && (
            <View style={styles.adColumn}>
              <AdSlot placement="right" />
            </View>
          )}
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
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  scrollContent: {
    flexGrow: 1,
  },

  /* =========================================================
     CONTENEDOR GENERAL DE LA PÁGINA
  ========================================================= */
  page: {
    width: '100%',
    maxWidth: 1366,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 8,
  },

  /* =========================================================
     FILA PRINCIPAL

     PUBLICIDAD | VIDEO + CHAT | PUBLICIDAD
  ========================================================= */
  layoutRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 16,
  },

  layoutRowMobile: {
    flexDirection: 'column',
    gap: 14,
  },

  /* =========================================================
     PUBLICIDAD LATERAL
  ========================================================= */
  adColumn: {
    width: 160,
    flexShrink: 0,
  },

  /* =========================================================
     CONTENIDO CENTRAL
     VIDEO + CHAT
  ========================================================= */
  content: {
    flex: 1,
    width: '100%',
    maxWidth: 920,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 14,
  },

  contentMobile: {
    width: '100%',
    flexDirection: 'column',
    gap: 14,
  },

  /* =========================================================
     VIDEO
  ========================================================= */
  videoArea: {
    flex: 1,
    minWidth: 0,
    position: 'relative',
  },

  videoAreaMobile: {
    width: '100%',
  },

  /* =========================================================
     CHAT
  ========================================================= */
  chatArea: {
    flex: 0,
    flexBasis: 320,
    width: 320,
    minWidth: 280,
    maxWidth: 320,
  },

  chatAreaMobile: {
    width: '100%',
    minWidth: 0,
    maxWidth: undefined,
  },

  /* =========================================================
     INDICADOR EN VIVO
  ========================================================= */
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