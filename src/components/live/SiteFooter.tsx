import { LiveTheme } from '@/constants/live-theme';
import { FontAwesome5 } from '@expo/vector-icons';
import {
  Linking,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

type LinkColumn = {
  heading: string;
  links: string[];
};

// =========================================================
// CONTENIDO DEL FOOTER
// =========================================================

const COLUMNS: LinkColumn[] = [
  {
    heading: 'Los Tiempos',
    links: ['Staff', 'Contactos'],
  },
  {
    heading: 'Click - Tu Mirada',
    links: ['Farándula', 'Servicios', 'Hemeroteca'],
  },
  {
    heading: 'Deportes',
    links: ['Entretiempo', 'Fútbol', 'Fútbol Int.'],
  },
  {
    heading: 'Doble Click',
    links: ['Cultura', 'Cine', 'Conectados'],
  },
  {
    heading: 'Oh!',
    links: ['Paparazzi', 'Tendencias'],
  },
  {
    heading: 'Décimos Oh!',
    links: ['Tendencias', 'Interesante', 'Ciencia', 'Cocina'],
  },
  {
    heading: 'Actualidad',
    links: ['Mundo', 'Editorial', 'Puntos de Vista'],
  },
];

// =========================================================
// REDES SOCIALES
// =========================================================

const SOCIAL_LINKS: {
  name: keyof typeof FontAwesome5.glyphMap;
  url: string;
}[] = [
  {
    name: 'facebook-f',
    url: 'https://facebook.com',
  },
  {
    name: 'twitter',
    url: 'https://twitter.com',
  },
  {
    name: 'instagram',
    url: 'https://instagram.com',
  },
  {
    name: 'youtube',
    url: 'https://youtube.com',
  },
  {
    name: 'tiktok',
    url: 'https://tiktok.com',
  },
  {
    name: 'linkedin-in',
    url: 'https://linkedin.com',
  },
];

// =========================================================
// COMPONENTE
// =========================================================

export function SiteFooter() {
  const { width } = useWindowDimensions();

  const isWide = width >= 768;

  return (
    <View style={styles.footer}>

      {/* =================================================
          COLUMNAS PRINCIPALES
      ================================================= */}

      <View
        style={[
          styles.columnsRow,
          !isWide && styles.columnsRowNarrow,
        ]}
      >

        {/* COLUMNAS DE ENLACES */}

        <View style={styles.linksColumns}>
          {COLUMNS.map((col) => (
            <View
              key={col.heading}
              style={styles.column}
            >

              <Text style={styles.columnHeading}>
                {col.heading}
              </Text>

              {col.links.map((link) => (
                <Text
                  key={link}
                  style={styles.columnLink}
                >
                  {link}
                </Text>
              ))}

            </View>
          ))}
        </View>

        {/* =================================================
            REDES SOCIALES
        ================================================= */}

        <View style={styles.socialColumn}>
          <View style={styles.socialRow}>

            {SOCIAL_LINKS.map((social) => (
              <Pressable
                key={social.name}
                onPress={() => Linking.openURL(social.url)}
                style={styles.socialIcon}
              >
                <FontAwesome5
                  name={social.name}
                  size={14}
                  color="#FFFFFF"
                />
              </Pressable>
            ))}

          </View>
        </View>

      </View>

      {/* =================================================
          PARTE INFERIOR
      ================================================= */}

      <View
        style={[
          styles.bottomRow,
          !isWide && styles.bottomRowNarrow,
        ]}
      >

        <Text style={styles.copyright}>
          Copyright © 2026 Editorial Canelas
        </Text>

        <Text style={styles.terms}>
          Condiciones de uso
        </Text>

      </View>

    </View>
  );
}

// =========================================================
// ESTILOS
// =========================================================

const styles = StyleSheet.create({

  // =======================================================
  // FOOTER PRINCIPAL
  // =======================================================

footer: {
  width: '100%',

  backgroundColor: LiveTheme.gold,

  paddingTop: 10,
  paddingBottom: 0,

  paddingHorizontal: 0,
},
  // =======================================================
  // CONTENEDOR DE COLUMNAS + REDES
  // =======================================================

  columnsRow: {
  width: '100%',
  maxWidth: 1360,
  alignSelf: 'center',

  paddingHorizontal: 40,

  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',

  marginBottom: 12,
},

  // =======================================================
  // COLUMNAS DE ENLACES
  // =======================================================

  linksColumns: {
    flex: 1,

    flexDirection: 'row',

    justifyContent: 'space-between',

    alignItems: 'flex-start',
  },

  // =======================================================
  // MODO MÓVIL
  // =======================================================

  columnsRowNarrow: {
    flexDirection: 'column',

    gap: 12,
  },

  // =======================================================
  // COLUMNA INDIVIDUAL
  // =======================================================

  column: {
    minWidth: 110,

    flex: 1,
  },

  // =======================================================
  // TÍTULO
  // =======================================================

  columnHeading: {
    fontSize: 14,

    fontWeight: '700',

    color: LiveTheme.black,

    marginBottom: 6,
  },

  // =======================================================
  // ENLACES
  // =======================================================

  columnLink: {
    fontSize: 12,

    color: LiveTheme.black,

    opacity: 0.8,

    marginBottom: 4,
  },

  // =======================================================
  // COLUMNA DE REDES
  // =======================================================

  socialColumn: {
    width: 150,

    alignItems: 'center',

    justifyContent: 'center',
  },

  // =======================================================
  // REDES
  // =======================================================

  socialRow: {
    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'center',

    gap: 8,
  },

  // =======================================================
  // BOTÓN DE RED SOCIAL
  // =======================================================

  socialIcon: {
    width: 28,

    height: 28,

    borderRadius: 14,

    backgroundColor: LiveTheme.black,

    alignItems: 'center',

    justifyContent: 'center',
  },

  // =======================================================
  // PARTE INFERIOR
  // =======================================================
bottomRow: {
  width: '100%',

  height: 24,

  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',

  backgroundColor: '#000000',
},
  // =======================================================
  // PARTE INFERIOR EN MÓVIL
  // =======================================================

  bottomRowNarrow: {
    flexDirection: 'column',

    alignItems: 'flex-start',

    gap: 6,
  },

  // =======================================================
  // COPYRIGHT
copyright: {
  fontSize: 11,
  color: '#FFFFFF',
},
  // =======================================================
  // CONDICIONES
 terms: {
  fontSize: 11,
  color: '#FFFFFF',
  textDecorationLine: 'underline',
},

});