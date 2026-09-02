import { LiveTheme } from '@/constants/live-theme';
import { getProfile } from '@/components/auth/authService';
import { api, ChatHistoryMessage } from '@/services/api';
import * as signalR from '@microsoft/signalr';
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
  const [authenticated, setAuthenticated] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);

  const connectionRef = useRef<signalR.HubConnection | null>(null);

  useEffect(() => {
    let mounted = true;

    const initializeChat = async () => {
      // --------------------------------
      // 1. Cargar historial público
      // --------------------------------
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

      if (!mounted) return;

      // --------------------------------
      // 2. Comprobar sesión existente
      // --------------------------------
      try {
        const profileResponse = await getProfile();

        if (!mounted) return;

        if (!profileResponse.ok) {
          // Visitante: puede ver el historial, pero no se conecta al Hub.
          setAuthenticated(false);
          return;
        }

        setAuthenticated(true);
        setConnecting(true);

        // --------------------------------
        // 3. Crear conexión SignalR
        // --------------------------------
        const connection = new signalR.HubConnectionBuilder()
          .withUrl(
            'https://lostiemposapi20260817104248-avbkfhcfcucgf9e0.centralus-01.azurewebsites.net/chatHub',
            {
              // La autenticación existente usa cookies HttpOnly.
              // No enviamos userId, userName ni avatarColor manualmente.
              withCredentials: true,
            }
          )
          .withAutomaticReconnect()
          .build();

        connectionRef.current = connection;

        // --------------------------------
        // 4. Recibir mensajes nuevos
        // --------------------------------
        connection.on('RecibeMessage', (message: ChatHistoryMessage) => {
          if (!mounted) return;

          setMessages((prev) => [
            ...prev,
            mapChatMessage(message, prev.length),
          ]);
        });

        connection.onreconnecting(() => {
          if (!mounted) return;
          setConnected(false);
          setConnecting(true);
        });

        connection.onreconnected(() => {
          if (!mounted) return;
          setConnecting(false);
          setConnected(true);
        });

        connection.onclose(() => {
          if (!mounted) return;
          setConnecting(false);
          setConnected(false);
        });

        // --------------------------------
        // 5. Conectar al Hub
        // --------------------------------
        try {
          await connection.start();

          if (!mounted) return;

          setConnecting(false);
          setConnected(true);
          console.info('[Chat] Conectado a SignalR');
        } catch (error) {
          console.error('[Chat] Error conectando a SignalR:', error);

          if (!mounted) return;

          setConnecting(false);
          setConnected(false);
        }
      } catch (error) {
        // Si no existe sesión válida, el usuario sigue pudiendo
        // consultar el historial como visitante.
        console.info('[Chat] Usuario no autenticado o sesión no disponible.');

        if (!mounted) return;

        setAuthenticated(false);
        setConnecting(false);
        setConnected(false);
      }
    };

    initializeChat();

    return () => {
      mounted = false;

      const connection = connectionRef.current;
      connectionRef.current = null;

      if (connection) {
        connection.stop().catch((error) => {
          console.error('[Chat] Error cerrando SignalR:', error);
        });
      }
    };
  }, []);

  async function handleSend() {
    const text = draft.trim();

    if (!text) return;

    const connection = connectionRef.current;

    if (!authenticated || !connection || connection.state !== signalR.HubConnectionState.Connected) {
      console.warn('[Chat] No hay una conexión activa para enviar mensajes.');
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
    !authenticated ||
    connecting ||
    !connected;

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
        {authenticated ? (
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
            style={[
              styles.input,
              inputDisabled && styles.inputDisabled,
            ]}
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

        {authenticated && (
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

  /* =========================
     BOTÓN ENVIAR
  ========================= */

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