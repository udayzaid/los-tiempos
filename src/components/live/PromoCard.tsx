import { LiveTheme } from '@/constants/live-theme';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export type PromoCardData = {
  id: string;
  category: string;
  title: string;
  description: string;
  imageUrl?: string;
  href?: string;
};

type Props = PromoCardData & {
  onPress?: (id: string) => void;
};

export function PromoCard({
  id,
  category,
  title,
  description,
  imageUrl,
  onPress,
}: Props) {
  return (
    <Pressable
      style={styles.card}
      onPress={() => onPress?.(id)}
    >

      {/* =================================================
          IMAGEN
      ================================================= */}

      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
        />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Text style={styles.imagePlaceholderText}>
            ESPACIO PUBLICITARIO
          </Text>
        </View>
      )}

      {/* =================================================
          CONTENIDO DEL ANUNCIO
      ================================================= */}

      <View style={styles.textContent}>

        {/* CATEGORÍA */}

        <Text style={styles.category}>
          {category}
        </Text>

        {/* TÍTULO */}

        <Text
          style={styles.title}
          numberOfLines={3}
        >
          {title}
        </Text>

        {/* DESCRIPCIÓN */}

        <Text
          style={styles.description}
          numberOfLines={3}
        >
          {description}
        </Text>

      </View>

    </Pressable>
  );
}

// =========================================================
// ESTILOS
// =========================================================

const styles = StyleSheet.create({

  // =======================================================
  // FRAME EXTERIOR DEL ANUNCIO
  // =======================================================

  card: {
    flex: 1,

    minWidth: 220,

    height: 179,

    flexDirection: 'row',

    gap: 18,

    overflow: 'hidden',

    borderWidth: 1,

    borderColor: '#E2E2E2',

    borderRadius: 4,

    backgroundColor: '#FFFFFF',
  },

  // =======================================================
  // IMAGEN
  // =======================================================

  image: {
    width: 206,

    height: 179,

    borderRadius: 0,

    backgroundColor: LiveTheme.chatBorder,
  },

  // =======================================================
  // PLACEHOLDER DE IMAGEN
  // =======================================================

  imagePlaceholder: {
    width: 206,

    height: 179,

    backgroundColor: '#EFEAE0',

    alignItems: 'center',

    justifyContent: 'center',
  },

  imagePlaceholderText: {
    fontSize: 10,

    color: LiveTheme.textMuted,

    fontWeight: '600',

    textAlign: 'center',
  },

  // =======================================================
  // CONTENIDO DE TEXTO
  // =======================================================

  textContent: {
    width: 156,

    height: 125,

    marginTop: 10,

    flexShrink: 1,

    justifyContent: 'flex-start',
  },

  // =======================================================
  // CATEGORÍA
  // =======================================================

  category: {
    fontSize: 12,

    fontWeight: '700',

    color: LiveTheme.gold,

    textTransform: 'capitalize',

    marginBottom: 5,
  },

  // =======================================================
  // TÍTULO
  // =======================================================

  title: {
    fontSize: 15,

    fontWeight: '700',

    color: LiveTheme.black,

    marginBottom: 5,

    lineHeight: 19,
  },

  // =======================================================
  // DESCRIPCIÓN
  // =======================================================

  description: {
    fontSize: 12,

    color: LiveTheme.textMuted,

    lineHeight: 16,
  },
});