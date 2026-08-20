import { LiveTheme } from '@/constants/live-theme';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  title: string;
  body: string;
};

export function LiveDescription({ title, body }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: LiveTheme.offWhite,
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: LiveTheme.chatBorder,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: LiveTheme.black,
    marginBottom: 8,
  },
  body: {
    fontSize: 13,
    lineHeight: 20,
    color: LiveTheme.textMuted,
  },
});