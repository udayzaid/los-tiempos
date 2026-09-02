import { LiveTheme } from '@/constants/live-theme';
import { StyleSheet, Text, View } from 'react-native';

export type ChatMessageData = {
  id: string;
  username: string;
  text: string;
};

/*
 * Genera un color estable para cada usuario.
 * El mismo usuario conservará el mismo color
 * aunque se actualice la página.
 */
const AVATAR_COLORS = [
  '#4285F4', // Azul
  '#34A853', // Verde
  '#FBBC05', // Amarillo
  '#EA4335', // Rojo
  '#9C27B0', // Morado
  '#00ACC1', // Cian
  '#FF7043', // Naranja
  '#5C6BC0', // Índigo
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
}: ChatMessageData) {
  const avatarColor = getAvatarColor(username);
  const initial = getInitial(username);

  return (
    <View style={styles.row}>

      {/* AVATAR */}
      <View
        style={[
          styles.avatar,
          {
            backgroundColor: avatarColor,
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