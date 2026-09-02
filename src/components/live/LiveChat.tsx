import { LiveTheme } from '@/constants/live-theme';
import { api, ChatHistoryMessage } from '@/services/api';
import { useEffect, useState } from 'react';
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

function mapChatMessage(message: ChatHistoryMessage, index: number): ChatMessageData {
  const username =
    message.userName ||
    message.username ||
    'Usuario';

  const text =
    message.message ||
    message.text ||
    '';

  return {
    id: String(message.id ?? `${message.createdAt ?? 'message'}-${index}`),
    username,
    text,
    avatarColor: message.avatarColor,
  };
}

export function LiveChat() {
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [historyError, setHistoryError] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadHistory = async () => {
      try {
        setLoading(true);
        setHistoryError(false);

        const data = await api.getChatHistory(50);

        if (!mounted) return;

        setMessages(data.map(mapChatMessage));
      } catch (error) {
        console.error('Error cargando historial del chat:', error);

        if (!mounted) return;

        setHistoryError(true);
        setMessages([]);
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

  function handleSend() {
    if (!draft.trim()) return;

    // Temporal: el envío real se conectará a SignalR en el siguiente paso.
    setMessages((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        username: 'Tú',
        text: draft.trim(),
      },
    ]);

    setDraft('');
  }

  return (
    <View style={styles.container}>
      {/* CABECERA */}
      <View style={styles.header}>
        <Text style={styles.headerText}>CHAT EN VIVO</Text>
      </View>

      {/* MENSAJES */}
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ChatMessage {...item} />}
        style={styles.list}
        ListEmptyComponent={
          loading ? (
            <View style={styles.statusContainer}>
              <ActivityIndicator size="small" color={LiveTheme.black} />
              <Text style={styles.statusText}>Cargando mensajes...</Text>
            </View>
          ) : historyError ? (
            <View style={styles.statusContainer}>
              <Text style={styles.statusText}>
                No se pudo cargar el historial.
              </Text>
            </View>
          ) : (
            <View style={styles.statusContainer}>
              <Text style={styles.statusText}>
                Aún no hay mensajes.
              </Text>
            </View>
          )
        }
      />

      {/* ESCRIBIR MENSAJE */}
      <View style={styles.inputRow}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Escribe un mensaje..."
          placeholderTextColor={LiveTheme.textMuted}
          style={styles.input}
          onSubmitEditing={handleSend}
        />

        <Pressable
          onPress={handleSend}
          style={styles.sendButton}
        >
          <Text style={styles.sendButtonText}>➤</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  /* =========================
     CONTENEDOR DEL CHAT
  ========================= */

  container: {
    flex: 1,

    borderWidth: 1,
    borderColor: '#C8C8C8',

    backgroundColor: LiveTheme.chatBg,

    minHeight: 300,
  },

  /* =========================
     CABECERA
  ========================= */

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

  /* =========================
     LISTA DE MENSAJES
  ========================= */

  list: {
    flex: 1,
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

  /* =========================
     BARRA INFERIOR
  ========================= */

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',

    backgroundColor: LiveTheme.gold,

    paddingHorizontal: 10,
    paddingVertical: 8,
  },

  /* =========================
     CAJA PARA ESCRIBIR
  ========================= */

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

  /* =========================
     BOTÓN ENVIAR
  ========================= */

  sendButton: {
    paddingHorizontal: 8,
  },

  sendButtonText: {
    fontSize: 16,
    color: LiveTheme.black,
  },
});