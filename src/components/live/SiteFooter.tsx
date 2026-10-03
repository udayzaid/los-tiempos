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
type FooterLink = {
  label: string;
  url: string;
};

type LinkColumn = {
  heading: string;
  links: FooterLink[];
};

// =========================================================
// CONTENIDO DEL FOOTER
// =========================================================

const COLUMNS: LinkColumn[] = [
  {
    heading: 'Los Tiempos',
    links: [
      { label: 'Staff', url: 'https://www.lostiempos.com/staff' },
      { label: 'Contactos', url: 'https://www.lostiempos.com/contacto' },
    ],
  },
  {
    heading: 'Click - Tu Mirada',
    links: [
      { label: 'Farándula', url: 'https://www.lostiempos.com/doble-click/farandula' },
      { label: 'Servicios', url: 'https://www.lostiempos.com/doble-click/' },
      { label: 'Hemeroteca', url: 'https://www.lostiempos.com/hemeroteca' },
    ],
  },
 {
  heading: 'Deportes',
  links: [
    { label: 'Entretiempo', url: 'https://www.lostiempos.com/deportes/entretiempo' },
    { label: 'Fútbol', url: 'https://www.lostiempos.com/deportes/futbol' },
    { label: 'Fútbol Int.', url: 'https://www.lostiempos.com/deportes/futbol-int' },
  ],
},
  {
    heading: 'Doble Click',
    links: [
      { label: 'Cultura', url: 'https://www.lostiempos.com/doble-click/cultura' },
      { label: 'Cine', url: 'https://www.lostiempos.com/doble-click/cine' },
      { label: 'Conectados', url: 'https://www.lostiempos.com/doble-click/conectados' },
    ],
  },
  {
    heading: 'Oh!',
    links: [
      { label: 'Paparazzi', url: 'https://www.lostiempos.com/oh/paparazzi' },
      { label: 'Tendencias', url: 'https://www.lostiempos.com/oh/tendencias' },
    ],
  },
  {
    heading: 'Décimos Oh!',
    links: [
      { label: 'Tendencias', url: 'https://www.lostiempos.com/oh/tendencias' },
      { label: 'Interesante', url: 'https://www.lostiempos.com/tendencias/interesante' },
      { label: 'Ciencia', url: 'https://www.lostiempos.com/tendencias/ciencia' },
      { label: 'Cocina', url: 'https://www.lostiempos.com/tendencias/cocina' },
    ],
  },
  {
    heading: 'Actualidad',
    links: [
      { label: 'Mundo', url: 'https://www.lostiempos.com/actualidad/mundo' },
      { label: 'Editorial', url: 'https://www.lostiempos.com/actualidad/opinion' },
      { label: 'Puntos de Vista', url: 'https://www.lostiempos.com/actualidad/opinion' },
    ],
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
    url: 'https://www.facebook.com/lostiemposbol1/?locale=es_LA',
  },
  {
    name: 'twitter',
    url: 'https://x.com/LosTiemposBol',
  },
  {
    name: 'instagram',
    url: 'https://www.instagram.com/lostiemposbol/?hl=es',
  },
  {
    name: 'youtube',
    url: 'https://www.youtube.com/@lostiemposbol',
  },
  {
    name: 'tiktok',
    url: 'https://www.tiktok.com/@lostiemposbol?lang=es',
  },
  {
    name: 'linkedin-in',
    url: 'https://bo.linkedin.com/company/lostiemposbol',
  },
];

// =========================================================
// COMPONENTE
// =========================================================

export function SiteFooter() {
  const { width } = useWindowDimensions();

  const isWide = width >= 768;

  return (
    <View style={styles.footer} role="contentinfo">

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
        <Pressable
          key={link.label}
          onPress={() => Linking.openURL(link.url)}
        >
          <Text style={styles.columnLink}>
            {link.label}
          </Text>
        </Pressable>
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
                key={String(social.name)}
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
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    gap: 20,
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
    minWidth: 120,
    marginBottom: 12, 

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
 minHeight: 36,
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

    alignItems: 'center',

    gap: 6,
  },

  // =======================================================
  // COPYRIGHT
copyright: {
  fontSize: 11,
  color: '#FFFFFF',
  textAlign: 'center',
},
  // =======================================================
  // CONDICIONES
 terms: {
  fontSize: 11,
  color: '#FFFFFF',
  textDecorationLine: 'underline',
  textAlign: 'center',
},

});