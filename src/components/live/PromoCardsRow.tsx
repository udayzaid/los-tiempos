import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { PromoCard, PromoCardData } from './PromoCard';

// TODO: por ahora son datos de ejemplo (placeholder).
// A futuro esto se reemplaza por los anuncios reales que asigne el admin,
// probablemente viniendo de la misma API/backend que maneja los ads.json actuales.
const MOCK_CARDS: PromoCardData[] = [
  {
    id: '1',
    category: 'Deportes',
    title: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit',
    description:
      'sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat voluepat.',
  },
  {
    id: '2',
    category: 'Política',
    title: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit',
    description:
      'sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat voluepat.',
  },
  {
    id: '3',
    category: 'Mundo',
    title: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit',
    description:
      'sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat voluepat.',
  },
];

type Props = {
  cards?: PromoCardData[];
};

export function PromoCardsRow({ cards = MOCK_CARDS }: Props) {
  const { width } = useWindowDimensions();
  const isWide = width >= 768;

  return (
    <View style={[styles.row, !isWide && styles.rowNarrow]}>
      {cards.map((card) => (
        <PromoCard key={card.id} {...card} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexWrap: 'wrap',
  },
  rowNarrow: {
    flexDirection: 'column',
  },
});
