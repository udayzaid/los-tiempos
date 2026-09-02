import { LiveTheme } from '@/constants/live-theme';
import { StyleSheet, Text, View } from 'react-native';

export type ChatMessageData = {
  id: string;
  username: string;
  text: string;
  avatarColor?: string;
};

/*
 * Fallback estable para mensajes antiguos o datos que no traigan avatarColor.
 */
const AVATAR_COLORS = [
  '#4285F4',
  '#34A853',
  '#FBBC05',
  '#EA4335',
  '#9C27B0',
  '#00ACC1',
  '#FF7043',
  '#5C6BC0',
];

function getAvatarColor(username: string) {
  let hash = 0;

  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }

  const index = Math.abs(hash) % AVATAR_COLORS.length;

  return AVATAR_COLORS[index];
}

function getInitial(username: string) {
  const cleanUsername = username.trim().replace(/^@/, '');

  if (!cleanUsername) {
    return '?';
  }

  return cleanUsername.charAt(0).toUpperCase();
}

export function ChatMessage({
  username,
  text,
  avatarColor,
}: ChatMessageData) {
  const finalAvatarColor = avatarColor || getAvatarColor(username);
  const initial = getInitial(username);

  return (
    <View style={styles.row}>

      {/* AVATAR */}
      <View
        style={[
          styles.avatar,
          {
            backgroundColor: finalAvatarColor,
          },
        ]}
      >
        <Text style={styles.avatarText}>
          {initial}
        </Text>
      </View>

      {/* MENSAJE */}
      <View style={styles.textCol}>
        <Text style={styles.username}>
          {username}
        </Text>

        <Text style={styles.messageText}>
          {text}
        </Text>
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

  /* =========================
     AVATAR
  ========================= */

  avatar: {
    width: 22,
    height: 22,

    borderRadius: 11,

    alignItems: 'center',
    justifyContent: 'center',

    marginTop: 2,
  },

  avatarText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },

  /* =========================
     TEXTO
  ========================= */

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