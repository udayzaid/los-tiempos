import { StyleSheet, Text, View } from 'react-native';
import { LiveTheme } from '@/constants/live-theme';

type Props = {
  text: string;
  date?: string;
};

export function NewsTicker({ text, date }: Props) {
  return (
    <View style={styles.bar}>
      <Text style={styles.label}>ÚLTIMA HORA</Text>
      <Text style={styles.text} numberOfLines={1}>
        {text}
      </Text>
      {date ? <Text style={styles.date}>{date}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    minHeight: 34,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: LiveTheme.gold,
  },
  label: {
    color: LiveTheme.black,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  text: {
    flex: 1,
    color: LiveTheme.black,
    fontSize: 11,
    fontWeight: '700',
  },
  date: {
    color: LiveTheme.black,
    fontSize: 10,
    fontWeight: '700',
  },
});
