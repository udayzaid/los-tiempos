import { StyleSheet, Text, View } from 'react-native';

type AdSlotProps = {
  placement: 'left' | 'right';
};

export function AdSlot({ placement }: AdSlotProps) {
  return (
    <View
      accessibilityLabel={`Espacio publicitario ${placement}`}
      style={styles.slot}
    >
      <Text style={styles.label}>PUBLICIDAD</Text>
      <Text style={styles.hint}>160 × 600</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  slot: {
    width: 160,
    minHeight: 600,
    backgroundColor: '#F7F7F7',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 10,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: '#777777',
    letterSpacing: 0.5,
  },
  hint: {
    marginTop: 4,
    fontSize: 9,
    color: '#999999',
  },
});
