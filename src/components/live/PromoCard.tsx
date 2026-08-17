import { LiveTheme } from '@/constants/live-theme';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

export type PromoCardData = {
  id: string;
  category: string;
  title: string;
  description: string;
  imageUrl?: string; // cuando haya anuncio/imagen real, se pasa acá
  href?: string; // link de destino cuando el usuario haga click (opcional)
};

type Props = PromoCardData & {
  onPress?: (id: string) => void;
};

export function PromoCard({ id, category, title, description, imageUrl, onPress }: Props) {
  return (
    <Pressable style={styles.card} onPress={() => onPress?.(id)}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.image} />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Text style={styles.imagePlaceholderText}>ESPACIO PUBLICITARIO</Text>
        </View>
      )}
      <Text style={styles.category}>{category}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description} numberOfLines={3}>
        {description}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 220,
  },
  image: {
    width: '100%',
    aspectRatio: 16 / 10,
    borderRadius: 4,
    marginBottom: 8,
    backgroundColor: LiveTheme.chatBorder,
  },
  imagePlaceholder: {
    width: '100%',
    aspectRatio: 16 / 10,
    borderRadius: 4,
    marginBottom: 8,
    backgroundColor: '#EFEAE0',
    borderWidth: 1,
    borderColor: LiveTheme.chatBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderText: {
    fontSize: 10,
    color: LiveTheme.textMuted,
    fontWeight: '600',
  },
  category: {
    fontSize: 12,
    fontWeight: '700',
    color: LiveTheme.gold,
    textTransform: 'capitalize',
    marginBottom: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: LiveTheme.black,
    marginBottom: 4,
    lineHeight: 20,
  },
  description: {
    fontSize: 12,
    color: LiveTheme.textMuted,
    lineHeight: 17,
  },
});
