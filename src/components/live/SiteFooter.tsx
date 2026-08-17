import { LiveTheme } from '@/constants/live-theme';
import { FontAwesome5 } from '@expo/vector-icons';
import { Linking, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

type LinkColumn = {
  heading: string;
  links: string[];
};

// TODO: reemplazar por los links reales del sitio cuando los tengan definidos.
const COLUMNS: LinkColumn[] = [
  { heading: 'Los Tiempos', links: ['Staff', 'Contactos'] },
  { heading: 'Click - Tu Mirada', links: ['Farándula', 'Servicios', 'Hemeroteca'] },
  { heading: 'Deportes', links: ['Entretiempo', 'Fútbol', 'Fútbol Int.'] },
  { heading: 'Doble Click', links: ['Cultura', 'Cine', 'Conectados'] },
  { heading: 'Oh!', links: ['Paparazzi', 'Tendencias'] },
  { heading: 'Décimos Oh!', links: ['Tendencias', 'Interesante', 'Ciencia', 'Cocina'] },
  { heading: 'Actualidad', links: ['Mundo', 'Editorial', 'Puntos de Vista'] },
];

// TODO: reemplazar por las URLs reales de cada red social.
const SOCIAL_LINKS: { name: keyof typeof FontAwesome5.glyphMap; url: string }[] = [
  { name: 'facebook-f', url: 'https://facebook.com' },
  { name: 'twitter', url: 'https://twitter.com' },
  { name: 'instagram', url: 'https://instagram.com' },
  { name: 'youtube', url: 'https://youtube.com' },
  { name: 'tiktok', url: 'https://tiktok.com' },
  { name: 'linkedin-in', url: 'https://linkedin.com' },
];

export function SiteFooter() {
  const { width } = useWindowDimensions();
  const isWide = width >= 768;

  return (
    <View style={styles.footer}>
      <View style={[styles.columnsRow, !isWide && styles.columnsRowNarrow]}>
        {COLUMNS.map((col) => (
          <View key={col.heading} style={styles.column}>
            <Text style={styles.columnHeading}>{col.heading}</Text>
            {col.links.map((link) => (
              <Text key={link} style={styles.columnLink}>
                {link}
              </Text>
            ))}
          </View>
        ))}
      </View>

      <View style={[styles.bottomRow, !isWide && styles.bottomRowNarrow]}>
        <Text style={styles.copyright}>Copyright © 2026 Editorial Canelas</Text>
        <Text style={styles.terms}>Condiciones de uso</Text>
        <View style={styles.socialRow}>
          {SOCIAL_LINKS.map((social) => (
            <Pressable
              key={social.name}
              onPress={() => Linking.openURL(social.url)}
              style={styles.socialIcon}
              accessibilityLabel={social.name}
            >
              <FontAwesome5 name={social.name} size={16} color={LiveTheme.black} />
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    backgroundColor: LiveTheme.gold,
    paddingTop: 20,
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  columnsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
    marginBottom: 16,
  },
  columnsRowNarrow: {
    flexDirection: 'column',
    gap: 12,
  },
  column: {
    minWidth: 110,
  },
  columnHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: LiveTheme.black,
    marginBottom: 6,
  },
  columnLink: {
    fontSize: 11,
    color: LiveTheme.black,
    opacity: 0.8,
    marginBottom: 4,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.15)',
    paddingTop: 12,
    flexWrap: 'wrap',
    gap: 8,
  },
  bottomRowNarrow: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  copyright: {
    fontSize: 11,
    color: LiveTheme.black,
  },
  terms: {
    fontSize: 11,
    color: LiveTheme.black,
    textDecorationLine: 'underline',
  },
  socialRow: {
    flexDirection: 'row',
    gap: 14,
  },
  socialIcon: {
    padding: 4,
  },
});
