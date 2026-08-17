import { ThemedText } from '@/components/themed-text';
import { LiveTheme } from '@/constants/live-theme';
import { StyleSheet, View } from 'react-native';

type Props = {
  title: string;
  body: string;
};

export function LiveDescription({ title, body }: Props) {
  return (
    <View style={styles.container}>
      <ThemedText type="subtitle" style={styles.title}>
        {title}
      </ThemedText>
      <ThemedText style={styles.body}>{body}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  title: {
    fontSize: 20,
    marginBottom: 8,
    color: LiveTheme.black,
  },
  body: {
    fontSize: 13,
    lineHeight: 20,
    color: LiveTheme.textMuted,
  },
});
