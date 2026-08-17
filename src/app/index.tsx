import { LiveChat } from '@/components/live/LiveChat';
import { LiveDescription } from '@/components/live/LiveDescription';
import { LiveHeader } from '@/components/live/LiveHeader';
import { PromoCardsRow } from '@/components/live/PromoCardsRow';
import { SiteFooter } from '@/components/live/SiteFooter';
import { VideoPlayer } from '@/components/live/VideoPlayer';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';

export default function LiveScreen() {
  const { width } = useWindowDimensions();
  const isWide = width >= 768; // desktop/tablet ancho -> chat al costado; móvil -> chat debajo

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.scrollContent}>
      <LiveHeader
        headline="Los Tiempos, señal en vivo - Artemis II retorna, Trump y los convenios, Liga boliviana y las ultimas posiciones en las tablas"
        date="Martes 30 de Noviembre de 2026"
      />

      <View style={[styles.content, isWide ? styles.contentRow : styles.contentColumn]}>
        <View style={styles.videoArea}>
          <VideoPlayer />
        </View>
        <View style={isWide ? styles.chatAreaWide : styles.chatAreaNarrow}>
          <LiveChat />
        </View>
      </View>

      <LiveDescription
        title="Transmisión en vivo 13/04/2026"
        body="sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat. Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis."
      />

      {/* Espacio reservado para anuncios/noticias destacadas. A futuro, el admin
          va a poder asignar contenido real acá desde el panel administrativo. */}
      <PromoCardsRow />

      <SiteFooter />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    padding: 12,
    gap: 12,
  },
  contentRow: {
    flexDirection: 'row',
  },
  contentColumn: {
    flexDirection: 'column',
  },
  videoArea: {
    flex: 2,
  },
  chatAreaWide: {
    flex: 1,
    maxWidth: 340,
  },
  chatAreaNarrow: {
    minHeight: 320,
  },
});