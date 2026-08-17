import { LiveTheme } from '@/constants/live-theme';
import { StyleSheet, Text, View } from 'react-native';

export type ChatMessageData = {
  id: string;
  username: string;
  text: string;
};

export function ChatMessage({ username, text }: ChatMessageData) {
  return (
    <View style={styles.row}>
      <View style={styles.avatarPlaceholder} />
      <View style={styles.textCol}>
        <Text style={styles.username}>{username}</Text>
        <Text style={styles.messageText}>{text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 10,
    gap: 8,
  },
  avatarPlaceholder: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: LiveTheme.chatBorder,
    marginTop: 2,
  },
  textCol: {
    flex: 1,
  },
  username: {
    fontSize: 12,
    fontWeight: '700',
    color: LiveTheme.black,
  },
  messageText: {
    fontSize: 12,
    color: LiveTheme.textMuted,
  },
});