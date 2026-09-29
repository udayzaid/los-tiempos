import { LiveTheme } from '@/constants/live-theme';
import { api, ChatHistoryMessage } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useRef, useState } from 'react';
import { useLiveHub, type SignalRChatMessage } from '@/context/LiveHubContext';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { ChatMessage, ChatMessageData } from './ChatMessage';

type AuthenticatedProfile = {
  email?: string;
  name?: string;
  userName?: string;
  avatarColor?: string;
  [key: string]: any;
};

const MAX_CHAT_MESSAGES = 100;

function mapChatMessage(
  message: ChatHistoryMessage,
  index: number
): ChatMessageData {
  const username =
    message.userName || message.username || 'Usuario';

  const text =
    message.message || message.text || '';

  return {
    id: String(
      message.id ??
        `${message.createdAt ?? 'message'}-${index}`
    ),
    username,
    text,
    avatarColor: message.avatarColor,
  };
}

function mapSignalRMessage(
  message: SignalRChatMessage,
  profile: AuthenticatedProfile | null,
  index: number
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

export function LiveChat() {
  const { isAuthenticated, profile } = useAuth();
  const {
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
  const profileRef = useRef(profile);
  profileRef.current = profile;

  useEffect(() => {
    let mounted = true;

    const loadHistory = async () => {
      try {
        setLoading(true);
        setHistoryError(false);

        const data = await api.getChatHistory(50);

        if (!mounted) return;

        const historyMessages = data.map(mapChatMessage);
        setMessages((currentMessages) => {
          const currentIds = new Set(currentMessages.map((message) => message.id));
          const unseenHistory = historyMessages.filter((message) => !currentIds.has(message.id));
          return [...unseenHistory, ...currentMessages].slice(-MAX_CHAT_MESSAGES);
        });
      } catch (error) {
        if (!mounted) return;

        console.error('[Chat] No se pudo cargar el historial:', error);
        setHistoryError(true);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadHistory();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const unsubscribeMessages = subscribeToChatMessages((message) => {
      setMessages((prev) =>
        [
          ...prev,
          mapSignalRMessage(message, profileRef.current, prev.length),
        ].slice(-MAX_CHAT_MESSAGES)
      );
    });
    const unsubscribeNotices = subscribeToNotices(setChatNotice);

    return () => {
      unsubscribeMessages();
      unsubscribeNotices();
    };
  }, [subscribeToChatMessages, subscribeToNotices]);

  async function handleSend() {
    const text = draft.trim();

    if (!text) return;

    if (!isAuthenticated || !connection || !connected) {
      console.warn(
        '[Chat] No hay una sesión/conexión activa para enviar mensajes.'
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
    !isAuthenticated ||
    connecting ||
    !connected;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>CHAT EN VIVO</Text>
      </View>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ChatMessage {...item} />}
        style={styles.list}
        initialNumToRender={20}
        maxToRenderPerBatch={20}
        windowSize={7}
        removeClippedSubviews
        ListEmptyComponent={
          loading ? (
            <View style={styles.statusContainer}>
              <ActivityIndicator size="small" color={LiveTheme.black} />
              <Text style={styles.statusText}>Cargando mensajes...</Text>
            </View>
          ) : historyError ? (
            <View style={styles.statusContainer}>
              <Text style={styles.statusText}>
                Live no iniciado.
              </Text>
            </View>
          ) : (
            <View style={styles.statusContainer}>
              <Text style={styles.statusText}>Aún no hay mensajes.</Text>
            </View>
          )
        }
      />

      {chatNotice ? (
        <Text style={styles.noticeText} numberOfLines={2}>{chatNotice}</Text>
      ) : null}

      <View style={styles.inputRow}>
        {isAuthenticated ? (
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder={
              connecting
                ? 'Conectando al chat...'
                : connected
                  ? 'Escribe un mensaje...'
                  : 'Chat no disponible'
            }
            placeholderTextColor={LiveTheme.textMuted}
            style={[styles.input, inputDisabled && styles.inputDisabled]}
            onSubmitEditing={handleSend}
            editable={!inputDisabled}
          />
        ) : (
          <View style={styles.loginMessage}>
            <Text style={styles.loginMessageText}>
              Inicia sesión para comentar.
            </Text>
          </View>
        )}

        {isAuthenticated && (
          <Pressable
            onPress={handleSend}
            style={[
              styles.sendButton,
              inputDisabled && styles.sendButtonDisabled,
            ]}
            disabled={inputDisabled}
          >
            <Text style={styles.sendButtonText}>➤</Text>
          </Pressable>
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

  backgroundColor: LiveTheme.chatBg,
},
  header: {
    backgroundColor: LiveTheme.offWhite,
    borderBottomWidth: 1,
    borderBottomColor: '#C8C8C8',
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  headerText: {
    fontSize: 12,
    fontWeight: '700',
    color: LiveTheme.black,
  },
  list: {
    flex: 1,
   minHeight: 0,
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
    color: LiveTheme.textMuted,
    textAlign: 'center',
  },
  noticeText: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: LiveTheme.surfaceSoft,
    color: LiveTheme.textSecondary,
    fontSize: 11,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: LiveTheme.gold,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    height: 36,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D0D0D0',
    borderRadius: 6,
    paddingHorizontal: 10,
    fontSize: 12,
    color: '#000000',
  },
  inputDisabled: {
    opacity: 0.6,
  },
  loginMessage: {
    flex: 1,
    height: 36,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D0D0D0',
    borderRadius: 6,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  loginMessageText: {
    fontSize: 12,
    color: LiveTheme.textMuted,
  },
  sendButton: {
    paddingHorizontal: 8,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    fontSize: 16,
    color: LiveTheme.black,
  },
});
