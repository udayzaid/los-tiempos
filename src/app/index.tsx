import { LiveChat } from '@/components/live/LiveChat';
import { LiveDescription } from '@/components/live/LiveDescription';
import { LiveHeader } from '@/components/live/LiveHeader';
import { PromoCardsRow } from '@/components/live/PromoCardsRow';
import { SiteFooter } from '@/components/live/SiteFooter';
import { VideoPlayer } from '@/components/live/VideoPlayer';
import { ScrollView, StyleSheet, View } from 'react-native';

export default function LiveScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.scrollContent}>
      <LiveHeader
        headline="Los Tiempos, señal en vivo - Artemis II retorna, Trump y los convenios, Liga boliviana y las ultimas posiciones en las tablas"
        date="Martes 30 de Noviembre de 2026"
      />

      <View style={styles.content}>
        <View style={styles.videoArea}>
          <VideoPlayer />
        </View>
        <View style={styles.chatArea}>
          <LiveChat />
        </View>
      </View>

      <LiveDescription
        title="Transmisión en vivo 13/04/2026"
        body="sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat. Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis."
      />

      {/* Espacio reservado para anuncios/noticias destacadas. */}
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
  },
  videoArea: {
    flex: 3,
    minWidth: 320,
  },
  chatArea: {
    flex: 1,
    minWidth: 300,
  },
});