import { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

import { AuthModal } from '@/components/auth/AuthModal';
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

    // Obtener transmisión activa
    if (typeof api?.getStream === 'function') {
      api
        .getStream()
        .then((res) => {
          if (res && res.hasActiveStream && res.url) {
            setStreamUrl(res.url);
          } else {
            setStreamUrl('');
          }
        })
        .catch((err) =>
          console.error('Error cargando Stream:', err)
        );
    }
  }, []);

  // Abrir Login
  const handleOpenLogin = () => {
    setInitialRegisterMode(false);
    setAuthVisible(true);
  };

  // Abrir Registro
  const handleOpenRegister = () => {
    setInitialRegisterMode(true);
    setAuthVisible(true);
  };

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
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />

              <Text style={styles.liveBadgeText}>
                EN VIVO
              </Text>
            </View>

            {/* Reproductor */}
            <VideoPlayer
              videoUrl={
                streamUrl || 'https://youtu.be/2FrvoWyV9o8'
              }
            />
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
          LOGIN / REGISTRO
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
    maxWidth: 1240,
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
    flex: 2.35,

    minWidth: 0,

    position: 'relative',
  },

  videoAreaMobile: {
    width: '100%',
  },

  /* =========================
     CHAT
  ========================= */

  chatArea: {
    flex: 1,

    minWidth: 285,

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