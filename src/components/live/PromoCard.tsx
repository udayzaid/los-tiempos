import React from 'react';
import {
  Image,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LiveTheme } from '@/constants/live-theme';

// Aceptamos las propiedades individuales o un objeto noticia
export interface PromoCardProps {
  id?: string | number;
  category?: string;
  categoria?: string;
  title?: string;
  titulo?: string;
  description?: string;
  descripcion?: string;
  imageUrl?: string;
  urlImagen?: string;
  url?: string;
  onPress?: (urlOrId: string) => void;
  onCategoryPress?: (categoria: string) => void;
  noticia?: {
    id?: number | string;
    titulo?: string;
    categoria?: string;
    urlImagen?: string;
    descripcion?: string;
    fecha?: string;
    url?: string;
  };
}

export function PromoCard(props: PromoCardProps) {
  // Normalizamos las propiedades por si vienen dentro de 'noticia' o sueltas
  const cat = props.noticia?.categoria || props.category || props.categoria || '';
  const tit = props.noticia?.titulo || props.title || props.titulo || '';
  const desc = props.noticia?.descripcion || props.description || props.descripcion || '';
  const img = props.noticia?.urlImagen || props.imageUrl || props.urlImagen || '';
  const targetUrl = props.noticia?.url || props.url || '';
  const cardId = String(props.noticia?.id || props.id || '');

  const handlePress = () => {
    if (props.onPress) {
      props.onPress(targetUrl || cardId);
    } else if (targetUrl) {
      Linking.openURL(targetUrl).catch((err) =>
        console.error('Error al abrir la URL:', err)
      );
    }
  };

  const handleVerMas = () => {
    if (props.onCategoryPress && cat) {
      props.onCategoryPress(cat);
    } else {
      handlePress();
    }
  };

  return (
    <View style={styles.card}>
      {/* =================================================
          HEADER: CATEGORÍA + "VER MÁS"
      ================================================= */}
      <View style={styles.header}>
        <Text style={styles.category} numberOfLines={1}>
          {cat}
        </Text>
        <Pressable
          onPress={handleVerMas}
          hitSlop={8}
          style={({ pressed }) => pressed && styles.verMasPressed}
        >
          <Text style={styles.verMas}>Ver más →</Text>
        </Pressable>
      </View>

      {/* =================================================
          CUERPO: IMAGEN + TEXTO
      ================================================= */}
      <Pressable
        style={({ pressed }) => [styles.body, pressed && styles.bodyPressed]}
        onPress={handlePress}
      >
        {img ? (
          <Image source={{ uri: img }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderText}>
              ESPACIO{'\n'}PUBLICITARIO
            </Text>
          </View>
        )}

        <View style={styles.textContent}>
          <Text style={styles.title} numberOfLines={3}>
            {tit}
          </Text>
          <Text style={styles.description} numberOfLines={3}>
            {desc}
          </Text>
        </View>
      </Pressable>
    </View>
  );
}

// =========================================================
// ESTILOS
// =========================================================
const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 220,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E2E2',
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: LiveTheme.gold,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  category: {
    fontSize: 13,
    fontWeight: '800',
    color: LiveTheme.black,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    flexShrink: 1,
    marginRight: 8,
  },
  verMas: {
    fontSize: 11,
    fontWeight: '700',
    color: LiveTheme.black,
  },
  verMasPressed: {
    opacity: 0.6,
  },
  body: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 10,
  },
  bodyPressed: {
    opacity: 0.85,
  },
  image: {
    width: '42%',
    aspectRatio: 1,
    borderRadius: 4,
    backgroundColor: LiveTheme.chatBorder,
  },
  imagePlaceholder: {
    width: '42%',
    aspectRatio: 1,
    borderRadius: 4,
    backgroundColor: '#EFEAE0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderText: {
    fontSize: 9,
    color: LiveTheme.textMuted,
    fontWeight: '600',
    textAlign: 'center',
  },
  textContent: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: LiveTheme.black,
    marginBottom: 6,
    lineHeight: 18,
  },
  description: {
    fontSize: 12,
    color: LiveTheme.textMuted,
    lineHeight: 16,
  },
});