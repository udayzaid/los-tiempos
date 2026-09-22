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

  return (
    <Pressable style={styles.card} onPress={handlePress}>
      {/* =================================================
          IMAGEN
      ================================================= */}
      {img ? (
        <Image source={{ uri: img }} style={styles.image} />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Text style={styles.imagePlaceholderText}>
            ESPACIO PUBLICITARIO
          </Text>
        </View>
      )}

      {/* =================================================
          CONTENIDO DEL ANUNCIO / NOTICIA
      ================================================= */}
      <View style={styles.textContent}>
        {/* CATEGORÍA */}
        <Text style={styles.category}>{cat}</Text>

        {/* TÍTULO */}
        <Text style={styles.title} numberOfLines={3}>
          {tit}
        </Text>

        {/* DESCRIPCIÓN */}
        <Text style={styles.description} numberOfLines={3}>
          {desc}
        </Text>
      </View>
    </Pressable>
  );
}

// =========================================================
// ESTILOS (Tus estilos originales)
// =========================================================
const styles = StyleSheet.create({
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
  image: {
    width: 206,
    height: 179,
    borderRadius: 0,
    backgroundColor: LiveTheme.chatBorder,
  },
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
  textContent: {
    width: 156,
    height: 125,
    marginTop: 10,
    flexShrink: 1,
    justifyContent: 'flex-start',
  },
  category: {
    fontSize: 12,
    fontWeight: '700',
    color: LiveTheme.gold,
    textTransform: 'capitalize',
    marginBottom: 5,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: LiveTheme.black,
    marginBottom: 5,
    lineHeight: 19,
  },
  description: {
    fontSize: 12,
    color: LiveTheme.textMuted,
    lineHeight: 16,
  },
});