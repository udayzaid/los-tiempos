import { useRef, useState } from 'react';
import Head from 'expo-router/head';
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { AdSlot } from '@/components/ads/AdSlot';
import { AuthModal } from '@/components/auth/AuthModal';
import { startLogin } from '@/components/auth/authService';
import { LiveChat } from '@/components/live/LiveChat';
import { LiveDescription } from '@/components/live/LiveDescription';
import { LiveHeader } from '@/components/live/LiveHeader';
import { useLiveHub } from '@/context/LiveHubContext';
import { PromoCardsRow } from '@/components/live/PromoCardsRow';
import { ReelSection } from '@/components/live/ReelSection';
import { SiteFooter } from '@/components/live/SiteFooter';
import { VideoPlayer } from '@/components/live/VideoPlayer';

export default function LiveScreen() {
  const { width } = useWindowDimensions();
  const { liveInfo } = useLiveHub();
  const scrollRef = useRef<ScrollView>(null);
  const [pageY, setPageY] = useState(0);
  const [sectionY, setSectionY] = useState({
    inicio: 0,
    noticias: 0,
    videos: 0,
    enlaces: 0,
  });

  const isMobile = width < 1050;
  const showSideAds = width >= 1180;
  const [authVisible, setAuthVisible] = useState<boolean>(false);
  const [initialRegisterMode, setInitialRegisterMode] = useState<boolean>(false);
  const hasActiveStream = Boolean(liveInfo?.isLive);
  const streamUrl = liveInfo?.isLive ? liveInfo.urlVideo : '';

  const scrollToSection = (section: keyof typeof sectionY) => {
    scrollRef.current?.scrollTo({
      y: Math.max(0, sectionY[section] - 8),
      animated: true,
    });
  };

  const handleOpenLogin = async () => {
    try {
      await startLogin();
    } catch (err: any) {
      console.error('Error iniciando sesión:', err?.message || err);
    }
  };

  const handleOpenRegister = () => {
    setInitialRegisterMode(true);
    setAuthVisible(true);
  };

  const formattedDate = new Date().toLocaleDateString('es-BO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <>
      <Head>
        <title>Los Tiempos | Señal en vivo</title>
        <meta name="description" content="Sigue la señal en vivo de Los Tiempos y mantente informado con noticias y contenido de actualidad de Bolivia." />
        <meta name="robots" content="index, follow" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Los Tiempos | Señal en vivo" />
        <meta property="og:description" content="Sigue la señal en vivo de Los Tiempos y mantente informado con noticias y contenido de actualidad de Bolivia." />
        <meta property="og:site_name" content="Los Tiempos" />
        <meta property="og:locale" content="es_BO" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Los Tiempos | Señal en vivo" />
        <meta name="twitter:description" content="Sigue nuestras transmisiones en directo y mantente informado." />
      </Head>

      <ScrollView ref={scrollRef} style={styles.screen} contentContainerStyle={styles.scrollContent}>
        <View onLayout={(event) => setSectionY((prev) => ({ ...prev, inicio: event.nativeEvent.layout.y }))}>
          <View style={styles.headerViewport}>
            <LiveHeader
              headline="Los Tiempos, señal en vivo - Artemis retorna, Trump y los convenios, Liga boliviana y las ultimas posiciones en las tablas"
              onOpenLogin={handleOpenLogin}
              onOpenRegister={handleOpenRegister}
              onGoInicio={() => scrollToSection('inicio')}
              onGoNoticias={() => scrollToSection('noticias')}
              onGoVideos={() => scrollToSection('videos')}
              onGoEnlaces={() => scrollToSection('enlaces')}
            />
          </View>
        </View>

        <View
          style={styles.page}
          role="main"
          onLayout={(event) => setPageY(event.nativeEvent.layout.y)}
        >
          <View style={[styles.layoutRow, isMobile && styles.layoutRowMobile]}>
            {showSideAds && (
              <View style={styles.adColumn}>
                <AdSlot placement="left" />
              </View>
            )}

            <View style={[styles.contentColumn, isMobile && styles.contentColumnMobile]}>
              <View style={[styles.content, isMobile && styles.contentMobile]}>
                <View style={[styles.videoArea, isMobile && styles.videoAreaMobile]}>
                  {hasActiveStream && (
                    <View style={styles.liveBadge}>
                      <View style={styles.liveDot} />
                      <Text style={styles.liveBadgeText}>EN VIVO</Text>
                    </View>
                  )}
                  <VideoPlayer videoUrl={streamUrl} />
                </View>

                <View style={[styles.chatArea, isMobile && styles.chatAreaMobile]}>
                  <LiveChat />
                </View>
              </View>
              <LiveDescription
                title={`Transmisión en vivo ${formattedDate}`}
                body="Sigue nuestras transmisiones en directo y mantente informado. Disfruta de la señal en vivo, noticias y contenido de actualidad de Los Tiempos."
              />

              <View
                onLayout={(event) =>
                  setSectionY((prev) => ({
                    ...prev,
                    videos: pageY + event.nativeEvent.layout.y,
                  }))
                }
              >
                <ReelSection />
                  </View>
              <View
                onLayout={(event) =>
                  setSectionY((prev) => ({
                    ...prev,
                    noticias: pageY + event.nativeEvent.layout.y,
                  }))
                }
              >
                <PromoCardsRow />
              </View>
            </View>
            {showSideAds && (
              <View style={styles.adColumn}>
                <AdSlot placement="right" />
              </View>
            )}
          </View>
        </View>
        <View onLayout={(event) => setSectionY((prev) => ({ ...prev, enlaces: event.nativeEvent.layout.y }))}>
          <SiteFooter />
        </View>

        <AuthModal
          visible={authVisible}
          onClose={() => setAuthVisible(false)}
          initialRegister={initialRegisterMode}
        />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { flexGrow: 1 },
  headerViewport: {
    width: '100%',
    minWidth: 0,
    backgroundColor: '#FFFFFF',
  },
  page: {
    width: '100%',
    maxWidth: 1680,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 8,
  },
  layoutRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'stretch',
    gap: 35,
    boxSizing: 'border-box',
  },
  layoutRowMobile: { flexDirection: 'column', gap: 14 },
  adColumn: { width: 160, flexShrink: 0, alignSelf: 'stretch' },
  contentColumn: {
    flex: 1,
    maxWidth: 1280,
    minWidth: 0,
    alignSelf: 'stretch',
    boxSizing: 'border-box',
  },
  contentColumnMobile: { width: '100%', maxWidth: undefined, alignSelf: 'stretch' },
  content: {
    width: '100%',
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 14,
  },
  contentMobile: { width: '100%', flexDirection: 'column', gap: 14 },
  videoArea: { flex: 1, minWidth: 0, position: 'relative' },
  videoAreaMobile: { width: '100%' },
  chatArea: {
    width: 360,
    minWidth: 280,
    maxWidth: 360,
    flexGrow: 0,
    flexShrink: 1,
    alignSelf: 'stretch',
  },
  chatAreaMobile: {
    width: '100%',
    minWidth: 0,
    maxWidth: '100%',
    alignSelf: 'stretch',
    height: 400,
    flexBasis: 'auto',
    flexGrow: 0,
    flexShrink: 0,
  },
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
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFFFFF' },
  liveBadgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800' },
});
