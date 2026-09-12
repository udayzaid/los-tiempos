import { LiveTheme } from '@/constants/live-theme';
import { api, ChatHistoryMessage } from '@/services/api';
import * as signalR from '@microsoft/signalr';
import { useAuth } from '@/context/AuthContext';
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

const CHAT_HUB_URL =
  'https://lostiemposapi20260817104248-avbkfhcfcucgf9e0.centralus-01.azurewebsites.net/chatHub';

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

export function LiveChat() {
  const { isAuthenticated } = useAuth();

  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [historyError, setHistoryError] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);

  const connectionRef =
    useRef<signalR.HubConnection | null>(null);

  /*
   * =========================================================
   * HISTORIAL PÚBLICO
   * =========================================================
   */

  useEffect(() => {
    let mounted = true;

    const loadHistory = async () => {
      try {
        setLoading(true);
        setHistoryError(false);

        const data = await api.getChatHistory(50);

        if (!mounted) return;

        setMessages(
          data.map(mapChatMessage)
        );
      } catch (error) {
        console.error(
          '[Chat] Error cargando historial:',
          error
        );

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

  /*
   * =========================================================
   * SIGNALR
   * =========================================================
   *
   * Se conecta solamente cuando el usuario está autenticado.
   *
   * Si pasa:
   *
   * false → true
   *
   * se ejecuta nuevamente este efecto y se conecta.
   *
   * Si pasa:
   *
   * true → false
   *
   * se detiene la conexión.
   */

  useEffect(() => {
    let mounted = true;

    const connectSignalR = async () => {
      /*
       * Si no hay usuario autenticado,
       * aseguramos que SignalR esté desconectado.
       */

      if (!isAuthenticated) {
        const existingConnection =
          connectionRef.current;

        connectionRef.current = null;

        setConnecting(false);
        setConnected(false);

        if (existingConnection) {
          try {
            await existingConnection.stop();
          } catch (error) {
            console.error(
              '[Chat] Error cerrando SignalR:',
              error
            );
          }
        }

        return;
      }

      /*
       * Evitar crear una segunda conexión.
       */

      const existingConnection =
        connectionRef.current;

      if (
        existingConnection &&
        existingConnection.state !==
          signalR.HubConnectionState.Disconnected
      ) {
        return;
      }

      setConnecting(true);

      const connection =
        new signalR.HubConnectionBuilder()
          .withUrl(CHAT_HUB_URL, {
            /*
             * El backend autentica SignalR
             * utilizando las cookies HttpOnly.
             */
            withCredentials: true,
          })
          .withAutomaticReconnect()
          .build();

      connectionRef.current = connection;

      /*
       * =====================================================
       * RECIBIR MENSAJES
       * =====================================================
       */

      connection.on(
        'RecibeMessage',
        (message: ChatHistoryMessage) => {
          if (!mounted) return;

          setMessages((prev) => [
            ...prev,
            mapChatMessage(
              message,
              prev.length
            ),
          ]);
        }
      );

      /*
       * =====================================================
       * RECONEXIÓN
       * =====================================================
       */

      connection.onreconnecting(() => {
        if (!mounted) return;

        setConnected(false);
        setConnecting(true);

        console.info(
          '[Chat] Reconectando SignalR...'
        );
      });

      connection.onreconnected(() => {
        if (!mounted) return;

        setConnecting(false);
        setConnected(true);

        console.info(
          '[Chat] SignalR reconectado.'
        );
      });

      connection.onclose(() => {
        if (!mounted) return;

        setConnecting(false);
        setConnected(false);

        console.info(
          '[Chat] Conexión SignalR cerrada.'
        );
      });

      /*
       * =====================================================
       * INICIAR CONEXIÓN
       * =====================================================
       */

      try {
        await connection.start();

        if (!mounted) {
          await connection.stop();
          return;
        }

        setConnecting(false);
        setConnected(true);

        console.info(
          '[Chat] Conectado a SignalR mediante cookies.'
        );
      } catch (error) {
        console.error(
          '[Chat] No se pudo conectar SignalR:',
          error
        );

        if (!mounted) return;

        setConnecting(false);
        setConnected(false);

        connectionRef.current = null;

        try {
          await connection.stop();
        } catch {
          // No hacemos nada si ya estaba detenida.
        }
      }
    };

    connectSignalR();

    /*
     * =======================================================
     * LIMPIEZA
     * =======================================================
     */

    return () => {
      mounted = false;
    };
  }, [isAuthenticated]);

  /*
   * =========================================================
   * ENVIAR MENSAJE
   * =========================================================
   */

  async function handleSend() {
    const text = draft.trim();

    if (!text) return;

    const connection =
      connectionRef.current;

    if (
      !isAuthenticated ||
      !connection ||
      connection.state !==
        signalR.HubConnectionState.Connected
    ) {
      console.warn(
        '[Chat] No hay una sesión/conexión activa para enviar mensajes.'
      );

      return;
    }

    try {
      await connection.invoke(
        'SendMessage',
        text
      );

      setDraft('');
    } catch (error) {
      console.error(
        '[Chat] Error enviando mensaje:',
        error
      );
    }
  }

  /*
   * =========================================================
   * ESTADO DEL INPUT
   * =========================================================
   */

  const inputDisabled =
    loading ||
    !isAuthenticated ||
    connecting ||
    !connected;

  /*
   * =========================================================
   * INTERFAZ
   * =========================================================
   */

  return (
    <View style={styles.container}>

      {/* CABECERA */}

      <View style={styles.header}>
        <Text style={styles.headerText}>
          CHAT EN VIVO
        </Text>
      </View>

      {/* MENSAJES */}

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ChatMessage {...item} />
        )}
        style={styles.list}
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
            placeholderTextColor={
              LiveTheme.textMuted
            }
            style={[
              styles.input,
              inputDisabled &&
                styles.inputDisabled,
            ]}
            onSubmitEditing={handleSend}
            editable={!inputDisabled}
          />
        ) : (
          <View style={styles.loginMessage}>
            <Text
              style={styles.loginMessageText}
            >
              Inicia sesión para comentar.
            </Text>
          </View>
        )}

        {isAuthenticated && (
          <Pressable
            onPress={handleSend}
            style={[
              styles.sendButton,
              inputDisabled &&
                styles.sendButtonDisabled,
            ]}
            disabled={inputDisabled}
          >
            <Text style={styles.sendButtonText}>
              ➤
            </Text>
          </Pressable>
        )}

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#C8C8C8',
    backgroundColor: LiveTheme.chatBg,
    minHeight: 300,
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