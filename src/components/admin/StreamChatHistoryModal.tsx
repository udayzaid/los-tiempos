import { api, type StreamChatHistoryMessage } from '@/services/api';
import { LiveTheme } from '@/constants/live-theme';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type Props = {
  visible: boolean;
  broadcastId: string;
  streamName: string;
  onClose: () => void;
};

const PAGE_SIZE = 50;

export function StreamChatHistoryModal({ visible, broadcastId, streamName, onClose }: Props) {
  const [messages, setMessages] = useState<StreamChatHistoryMessage[]>([]);
  const [pageIndex, setPageIndex] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (!visible || !broadcastId) return;

    let active = true;
    setLoading(true);
    setError('');

    api.getStreamChatHistory(broadcastId, pageIndex, PAGE_SIZE)
      .then((result) => {
        if (!active) return;
        setMessages(result.items ?? []);
        setPageIndex(result.pageIndex ?? pageIndex);
        setTotalPages(result.totalPages ?? 1);
        setTotalCount(result.totalCount ?? 0);
        setHasPreviousPage(result.hasPreviousPage ?? pageIndex > 1);
        setHasNextPage(result.hasNextPage ?? false);
      })
      .catch((requestError: any) => {
        if (!active) return;
        setMessages([]);
        setError(requestError?.message || 'No se pudo cargar el historial del chat.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [visible, broadcastId, pageIndex, retryKey]);

  const changePage = (nextPage: number) => {
    setPageIndex(nextPage);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <View style={styles.heading}>
              <View style={styles.icon}>
                <Ionicons name="chatbubbles-outline" size={17} color={LiveTheme.goldDark} />
              </View>
              <View style={styles.headingCopy}>
                <Text style={styles.title}>Historial del chat</Text>
                <Text style={styles.subtitle} numberOfLines={1}>{streamName}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton} accessibilityLabel="Cerrar historial">
              <Ionicons name="close" size={20} color={LiveTheme.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.body}>
            {loading ? (
              <View style={styles.stateBox}>
                <ActivityIndicator color={LiveTheme.goldDark} />
                <Text style={styles.stateText}>Cargando mensajes...</Text>
              </View>
            ) : error ? (
              <View style={styles.stateBox}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.pageButton} onPress={() => setRetryKey((key) => key + 1)}>
                  <Text style={styles.pageButtonText}>Reintentar</Text>
                </TouchableOpacity>
              </View>
            ) : messages.length === 0 ? (
              <View style={styles.stateBox}>
                <Text style={styles.stateText}>Esta transmisión aún no tiene mensajes.</Text>
              </View>
            ) : (
              <ScrollView contentContainerStyle={styles.messageList} showsVerticalScrollIndicator>
                {messages.map((message, index) => {
                  const date = message.fecha ? new Date(message.fecha) : null;
                  const dateLabel = date && !Number.isNaN(date.getTime())
                    ? date.toLocaleString('es-BO')
                    : message.fecha;

                  return (
                    <View key={`${message.fecha}-${message.userName}-${index}`} style={styles.messageRow}>
                      <View style={[styles.avatar, message.avatarColor ? { backgroundColor: message.avatarColor } : null]}>
                        <Text style={styles.avatarText}>{message.userName?.trim()?.charAt(0)?.toUpperCase() || 'U'}</Text>
                      </View>
                      <View style={styles.messageContent}>
                        <View style={styles.messageMeta}>
                          <Text style={styles.userName} numberOfLines={1}>{message.userName || 'Usuario'}</Text>
                          <Text style={styles.date} numberOfLines={1}>{dateLabel || ''}</Text>
                        </View>
                        <Text style={styles.messageText}>{message.message || ''}</Text>
                      </View>
                    </View>
                  );
                })}
              </ScrollView>
            )}
          </View>

          <View style={styles.footer}>
            <Text style={styles.pageInfo}>
              {totalCount ? `Página ${pageIndex} de ${totalPages} · ${totalCount} mensajes` : '0 mensajes'}
            </Text>
            <View style={styles.pageActions}>
              <TouchableOpacity
                style={[styles.pageButton, !hasPreviousPage && styles.disabledButton]}
                onPress={() => changePage(pageIndex - 1)}
                disabled={!hasPreviousPage || loading}
              >
                <Text style={styles.pageButtonText}>Anterior</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.pageButton, !hasNextPage && styles.disabledButton]}
                onPress={() => changePage(pageIndex + 1)}
                disabled={!hasNextPage || loading}
              >
                <Text style={styles.pageButtonText}>Siguiente</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.48)',
  },
  modal: {
    width: '100%',
    maxWidth: 680,
    maxHeight: '88%',
    backgroundColor: LiveTheme.surface,
    borderRadius: LiveTheme.radius.lg,
    borderWidth: 1,
    borderColor: LiveTheme.border,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: LiveTheme.border,
  },
  heading: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 },
  icon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: LiveTheme.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headingCopy: { flex: 1, minWidth: 0 },
  title: { color: LiveTheme.text, fontWeight: '700', fontSize: 15 },
  subtitle: { color: LiveTheme.textMuted, fontSize: 11, marginTop: 2 },
  closeButton: { padding: 5, marginLeft: 8 },
  body: { minHeight: 220, maxHeight: 520, flexShrink: 1 },
  messageList: { paddingHorizontal: 16, paddingVertical: 8 },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: LiveTheme.border,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: LiveTheme.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 12, fontWeight: '700', color: LiveTheme.textSecondary },
  messageContent: { flex: 1, minWidth: 0 },
  messageMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  userName: { flex: 1, fontSize: 12, fontWeight: '700', color: LiveTheme.text },
  date: { fontSize: 9, color: LiveTheme.textMuted },
  messageText: { fontSize: 12, lineHeight: 18, color: LiveTheme.textSecondary, marginTop: 3 },
  stateBox: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 10 },
  stateText: { color: LiveTheme.textMuted, fontSize: 12, textAlign: 'center' },
  errorText: { color: LiveTheme.error, fontSize: 12, textAlign: 'center' },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: LiveTheme.border,
  },
  pageInfo: { flex: 1, fontSize: 10, color: LiveTheme.textMuted },
  pageActions: { flexDirection: 'row', gap: 8 },
  pageButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: LiveTheme.borderStrong,
    borderRadius: 6,
    backgroundColor: LiveTheme.surface,
  },
  pageButtonText: { fontSize: 10, fontWeight: '600', color: LiveTheme.textSecondary },
  disabledButton: { opacity: 0.4 },
});
