import { LiveTheme } from '@/constants/live-theme';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  headline: string;
  date: string;
};

export function LiveHeader({ headline, date }: Props) {
  return (
    <View>
      <View style={styles.topRow}>
        {/* TODO: reemplazar por el logo real cuando lo tengas.
            Por ahora es un espacio reservado (placeholder). */}
        <View style={styles.logoPlaceholder}>
          <Text style={styles.logoPlaceholderText}>LOGO</Text>
        </View>
        <Text style={styles.brand}>Los Tiempos</Text>
      </View>

      <View style={styles.headlineBar}>
        <Text style={styles.headlineText} numberOfLines={1}>
          {headline}
        </Text>
        <Text style={styles.dateText}>{date}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: LiveTheme.offWhite,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  logoPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: LiveTheme.chatBorder,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFEAE0',
  },
  logoPlaceholderText: {
    fontSize: 10,
    color: LiveTheme.textMuted,
    fontWeight: '600',
  },
  brand: {
    fontSize: 26,
    fontFamily: 'serif',
    color: LiveTheme.black,
  },
  headlineBar: {
    backgroundColor: LiveTheme.gold,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  headlineText: {
    color: LiveTheme.black,
    fontWeight: '700',
    fontSize: 13,
    flexShrink: 1,
    marginRight: 12,
  },
  dateText: {
    color: LiveTheme.black,
    fontSize: 12,
    fontWeight: '500',
  },
});