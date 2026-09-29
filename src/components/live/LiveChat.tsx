import { LiveTheme } from '@/constants/live-theme';
import { api, ChatHistoryMessage } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { useLiveHub, type SignalRChatMessage } from '@/context/LiveHubContext';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { ChatMessageData } from './ChatMessage';

type AuthenticatedProfile = {
  email?: string;
  name?: string;
  userName?: string;
  avatarColor?: string;
  [key: string]: any;
};

const MAX_CHAT_MESSAGES = 100;

const EMOJIS = [
  '😀',
  '😂',
  '😍',
  '🥰',
  '😎',
  '😢',
  '😮',
  '😡',
  '👍',
  '👏',
  '❤️',
  '🔥',
  '👋',
  '🙏',
  '🎉',
  '💪',
];

const AVATAR_COLORS = [
  '#E53935',
  '#1E88E5',
  '#43A047',
  '#FB8C00',
  '#8E24AA',
  '#00897B',
];

function mapChatMessage(
  message: ChatHistoryMessage,
  index: number,
): ChatMessageData {
  const username =
    message.userName ||
    message.username ||
    'Usuario';

  const text =
    message.message ||
    message.text ||
    '';

  return {
    id: String(
      message.id ??
        `${message.createdAt ?? 'message'}-${index}`,
    ),
    username,
    text,
    avatarColor: message.avatarColor,
  };
}

function mapSignalRMessage(
  message: SignalRChatMessage,
  profile: AuthenticatedProfile | null,
  index: number,
): ChatMessageData {
  if (typeof message === 'string') {
    const username =
      profile?.userName ||
      profile?.name ||
      profile?.email ||
      'Usuario';

    return {
      id: `signalr-${Date.now()}-${index}`,
      username,
      text: message,
      avatarColor: profile?.avatarColor,
    };
  }

  return mapChatMessage(message, index);
}

function getInitial(username: string) {
  const cleanName = username.trim();

  if (!cleanName) {
    return 'U';
  }

  return cleanName.charAt(0).toUpperCase();
}

function getAvatarColor(
  username: string,
  avatarColor?: string,
) {
  if (avatarColor) {
    return avatarColor;
  }

  let total = 0;

  for (let index = 0; index < username.length; index += 1) {
    total += username.charCodeAt(index);
  }

  return AVATAR_COLORS[total % AVATAR_COLORS.length];
}

function ChatRow({ item }: { item: ChatMessageData }) {
  const avatarColor = getAvatarColor(
    item.username,
    item.avatarColor,
  );

  return (
    <View style={styles.messageRow}>
      <View
        style={[
          styles.avatar,
          {
            backgroundColor: avatarColor,
          },
        ]}
      >
        <Text style={styles.avatarText}>
          {getInitial(item.username)}
        </Text>
      </View>

      <View style={styles.messageContent}>
        <Text style={styles.username} numberOfLines={1}>
          {item.username}
        </Text>

        <Text style={styles.messageText}>
          {item.text}
        </Text>
      </View>
    </View>
  );
}

export function LiveChat() {
  const { isAuthenticated, profile } = useAuth();
const {
  liveInfo,
  connection,
  connecting,
  connected,
  subscribeToChatMessages,
  subscribeToNotices,
} = useLiveHub();

  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [historyError, setHistoryError] = useState(false);
  const [chatNotice, setChatNotice] = useState('');
  const [emojiVisible, setEmojiVisible] = useState(false);

  const profileRef = useRef(profile);

  profileRef.current = profile;

 useEffect(() => {
  let mounted = true;

  const loadHistory = async () => {
    try {
      setLoading(true);
      setHistoryError(false);

      // Solo consultamos el historial cuando realmente hay una
      // transmisión en vivo activa.
      if (!liveInfo?.isLive) {
        if (mounted) {
          setMessages([]);
          setHistoryError(false);
          setLoading(false);
        }
        return;
      }

      const data = await api.getChatHistory(50);

      if (!mounted) return;

      const historyMessages = data.map(mapChatMessage);

      setMessages((currentMessages) => {
        const currentIds = new Set(
          currentMessages.map((message) => message.id)
        );

        const unseenHistory = historyMessages.filter(
          (message) => !currentIds.has(message.id)
        );

        return [...unseenHistory, ...currentMessages].slice(
          -MAX_CHAT_MESSAGES
        );
      });
    } catch (error) {
      if (!mounted) return;

      console.error('[Chat] No se pudo cargar el historial:', error);
      setHistoryError(true);
      setMessages([]);
    } finally {
      if (mounted) {
        setLoading(false);
      }
    }
  };

  // Mientras todavía no conocemos el estado del Live,
  // esperamos a que LiveHubContext lo determine.
  if (liveInfo === null) {
    setLoading(true);
    return () => {
      mounted = false;
    };
  }

  loadHistory();

  return () => {
    mounted = false;
  };
}, [liveInfo?.isLive]);

  useEffect(() => {
    const unsubscribeMessages =
      subscribeToChatMessages((message) => {
        setMessages((prev) =>
          [
            ...prev,
            mapSignalRMessage(
              message,
              profileRef.current,
              prev.length,
            ),
          ].slice(-MAX_CHAT_MESSAGES),
        );
      });

    const unsubscribeNotices =
      subscribeToNotices(setChatNotice);

    return () => {
      unsubscribeMessages();
      unsubscribeNotices();
    };
  }, [
    subscribeToChatMessages,
    subscribeToNotices,
  ]);

  const addEmoji = (emoji: string) => {
    setDraft((current) => `${current}${emoji}`);
  };

  async function handleSend() {
  const text = draft.trim();

  if (!text) return;

  if (
    !liveInfo?.isLive ||
    !isAuthenticated ||
    !connection ||
    !connected
  ) {
    console.warn(
      '[Chat] No hay un Live activo o no existe una sesión/conexión activa.'
    );
    return;
  }

  try {
    await connection.invoke('SendMessage', text);
    setDraft('');
  } catch (error) {
    console.error('[Chat] Error enviando mensaje:', error);
  }
}

 const inputDisabled =
  loading ||
  !liveInfo?.isLive ||
  !isAuthenticated ||
  connecting ||
  !connected;

  return (
    <View style={styles.container}>
      {/* ENCABEZADO DEL CHAT */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerLiveDot} />

          <Text style={styles.headerText}>
            CHAT EN VIVO
          </Text>
        </View>

        <View style={styles.headerRight}>
          <Text style={styles.connectedText}>
           
          </Text>

          <Pressable
            style={styles.menuButton}
            accessibilityRole="button"
            accessibilityLabel="Opciones del chat"
          >
            <Text style={styles.menuText}>
              ⋮
            </Text>
          </Pressable>
        </View>
      </View>

      {/* MENSAJE DE AVISO */}
      {chatNotice ? (
        <Text
          style={styles.noticeText}
          numberOfLines={2}
        >
          {chatNotice}
        </Text>
      ) : null}

      {/* LISTA DEL CHAT */}
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ChatRow item={item} />
        )}
        style={styles.list}
        contentContainerStyle={
          messages.length === 0
            ? styles.emptyList
            : styles.listContent
        }
        initialNumToRender={20}
        maxToRenderPerBatch={20}
        windowSize={7}
        removeClippedSubviews
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          loading ? (
            <View style={styles.statusContainer}>
              <ActivityIndicator
                size="small"
                color={LiveTheme.black}
              />

              <Text style={styles.statusText}>
                Cargando mensajes...
              </Text>
            </View>
          ) : historyError ? (
            <View style={styles.statusContainer}>
              <Text style={styles.statusText}>
                Live no iniciado.
              </Text>
            </View>
          ) : (
            <View style={styles.statusContainer}>
              <Text style={styles.statusText}>
                Live no inciado 
              </Text>
            </View>
          )
        }
      />

      {/* SELECTOR DE EMOJIS */}
      {emojiVisible && isAuthenticated ? (
        <View style={styles.emojiPanel}>
          {EMOJIS.map((emoji) => (
            <Pressable
              key={emoji}
              onPress={() => addEmoji(emoji)}
              style={styles.emojiButton}
              accessibilityRole="button"
              accessibilityLabel={`Agregar emoji ${emoji}`}
            >
              <Text style={styles.emojiText}>
                {emoji}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      {/* ZONA PARA ESCRIBIR */}
      <View style={styles.inputRow}>
        {isAuthenticated ? (
          <>
            <Pressable
              onPress={() =>
                setEmojiVisible(
                  (visible) => !visible,
                )
              }
              style={styles.emojiToggle}
              accessibilityRole="button"
              accessibilityLabel="Abrir emojis"
            >
              <Text style={styles.emojiToggleText}>
                ☺
              </Text>
            </Pressable>

            <TextInput
              value={draft}
              onChangeText={setDraft}
            placeholder={
  !liveInfo?.isLive
    ? 'Chat no disponible'
    : connecting
      ? 'Conectando al chat...'
      : connected
        ? 'Escribe un mensaje...'
        : 'Chat no disponible'
}
              placeholderTextColor="#888888"
              style={[
                styles.input,
                inputDisabled &&
                  styles.inputDisabled,
              ]}
              onSubmitEditing={handleSend}
              editable={!inputDisabled}
              returnKeyType="send"
            />

            <Pressable
              onPress={handleSend}
              style={[
                styles.sendButton,
                inputDisabled &&
                  styles.sendButtonDisabled,
              ]}
              disabled={inputDisabled}
              accessibilityRole="button"
              accessibilityLabel="Enviar mensaje"
            >
              <Text style={styles.sendButtonText}>
                ➤
              </Text>
            </Pressable>
          </>
        ) : (
          <View style={styles.loginMessage}>
            <Text style={styles.loginMessageText}>
              Inicia sesión para comentar.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    minHeight: 0,

    borderWidth: 1,
    borderColor: '#C8C8C8',

    backgroundColor: '#FFFFFF',

    overflow: 'hidden',
  },

  header: {
    height: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    backgroundColor: '#FFFFFF',

    borderBottomWidth: 1,
    borderBottomColor: '#D5D5D5',

    paddingHorizontal: 10,
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
  },

  headerLiveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,

    backgroundColor: '#F5B400',

    marginRight: 7,
  },

  headerText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#222222',
  },

  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  connectedText: {
    fontSize: 11,
    color: '#555555',
  },

  menuButton: {
    width: 24,
    height: 30,

    alignItems: 'center',
    justifyContent: 'center',

    marginLeft: 3,
  },

  menuText: {
    fontSize: 22,
    lineHeight: 24,
    fontWeight: '700',
    color: '#333333',
  },

  list: {
    flex: 1,
    minHeight: 0,
    backgroundColor: '#FFFFFF',
  },

  listContent: {
    paddingVertical: 5,
  },

  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
  },

  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',

    paddingHorizontal: 10,
    paddingVertical: 5,

    minHeight: 39,
  },

  avatar: {
    width: 25,
    height: 25,
    borderRadius: 13,

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 8,
    marginTop: 1,
  },

  avatarText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },

  messageContent: {
    flex: 1,
    minWidth: 0,

    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
  },

  username: {
    fontSize: 11,
    fontWeight: '800',
    color: '#333333',

    marginRight: 7,

    maxWidth: '35%',
  },

  messageText: {
    flexShrink: 1,

    fontSize: 11,
    lineHeight: 16,
    color: '#444444',
  },

  statusContainer: {
    alignItems: 'center',
    justifyContent: 'center',

    paddingVertical: 20,
    paddingHorizontal: 10,

    gap: 8,
  },

  statusText: {
    fontSize: 12,
    color: '#888888',
    textAlign: 'center',
  },

  noticeText: {
    paddingHorizontal: 10,
    paddingVertical: 6,

    backgroundColor: '#F5F5F5',

    color: '#555555',

    fontSize: 11,
  },

  emojiPanel: {
    flexDirection: 'row',
    flexWrap: 'wrap',

    paddingHorizontal: 7,
    paddingVertical: 6,

    backgroundColor: '#FFFFFF',

    borderTopWidth: 1,
    borderTopColor: '#DDDDDD',

    borderBottomWidth: 1,
    borderBottomColor: '#DDDDDD',
  },

  emojiButton: {
    width: 34,
    height: 32,

    alignItems: 'center',
    justifyContent: 'center',
  },

  emojiText: {
    fontSize: 19,
  },

 inputRow: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#FFFFFF',
  paddingHorizontal: 10,
  paddingVertical: 8,
  borderTopWidth: 1,
  borderTopColor: '#D0D0D0',
},

  emojiToggle: {
    width: 34,
    height: 34,

    alignItems: 'center',
    justifyContent: 'center',
  },

  emojiToggleText: {
    fontSize: 22,
    color: '#555555',
  },

  input: {
    flex: 1,

    height: 34,

    backgroundColor: '#FFFFFF',

    borderWidth: 1,
    borderColor: '#D5D5D5',
    borderRadius: 2,

    paddingHorizontal: 9,

    fontSize: 11,
    color: '#222222',
  },

  inputDisabled: {
    opacity: 0.6,
  },

  loginMessage: {
    flex: 1,

    height: 34,

    backgroundColor: '#FFFFFF',

    borderWidth: 1,
    borderColor: '#D5D5D5',
    borderRadius: 2,

    justifyContent: 'center',

    paddingHorizontal: 10,
  },

  loginMessageText: {
    fontSize: 11,
    color: '#888888',
  },
sendButton: {
  width: 42,
  height: 36,
  marginLeft: 6,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: LiveTheme.gold,
  borderRadius: 4,
},

  sendButtonDisabled: {
    opacity: 0.5,
  },

  sendButtonText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#222222',
  },
});