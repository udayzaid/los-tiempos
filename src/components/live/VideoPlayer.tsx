import { LiveTheme } from '@/constants/live-theme';
import { StyleSheet, Text, View } from 'react-native';

// TODO: cuando tengan el servicio de streaming (AWS IVS, Cloudflare Stream, etc.),
// esto se reemplaza por el componente de video real (ej. expo-video) apuntando
// a la URL .m3u8 (HLS) que entrega ese servicio.

export function VideoPlayer() {
  return (
    <View style={styles.container}>
      <View style={styles.liveBadge}>
        <Text style={styles.liveBadgeText}>● LIVE</Text>
      </View>
      <Text style={styles.placeholderText}>Video en vivo (HLS) — pendiente de conectar</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LiveTheme.black,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 260,
  },
  liveBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: LiveTheme.liveRed,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  liveBadgeText: {
    color: LiveTheme.white,
    fontWeight: '700',
    fontSize: 12,
  },
  placeholderText: {
    color: LiveTheme.white,
    opacity: 0.6,
    fontSize: 13,
  },
});