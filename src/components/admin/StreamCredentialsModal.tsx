import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export type StreamCredentials = {
  nombre: string;
  descripcion: string;
  incio: string;
  broadcastId: string;
  watchUrl: string;
  embeUrl: string;
  rtmpServerUrl: string;
  streamingKey: string;
  estado: string;
};

type Props = {
  visible: boolean;
  credentials: StreamCredentials | null;
  onClose: () => void;
};

const FIELDS: { key: keyof StreamCredentials; label: string; isSecret?: boolean }[] = [
  { key: 'nombre', label: 'Nombre' },
  { key: 'descripcion', label: 'Descripción' },
  { key: 'incio', label: 'Inicio' },
  { key: 'broadcastId', label: 'Broadcast ID' },
  { key: 'watchUrl', label: 'Watch URL' },
  { key: 'embeUrl', label: 'Embed URL' },
  { key: 'rtmpServerUrl', label: 'RTMP Server URL' },
  { key: 'streamingKey', label: 'Streaming Key', isSecret: true },
  { key: 'estado', label: 'Estado' },
];

export function StreamCredentialsModal({ visible, credentials, onClose }: Props) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showSecret, setShowSecret] = useState(false);

  if (!credentials) return null;

  const handleCopy = async (key: string, value: string) => {
    await Clipboard.setStringAsync(value);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const formatValue = (key: keyof StreamCredentials, value: string) => {
    if (key !== 'incio' || !value) return value || '—';

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString('es-BO');
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.modalBox}>
          {/* HEADER */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.headerIcon}>
                <Ionicons name="key-outline" size={16} color="#C99200" />
              </View>
              <View>
                <Text style={styles.headerTitle}>Credenciales del Stream</Text>
                <Text style={styles.headerSubtitle}>
                  Datos de conexión para emitir
                </Text>
              </View>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.8}>
              <Ionicons name="close" size={18} color="#666" />
            </TouchableOpacity>
          </View>

          {/* ESTADO BADGE */}
          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusDot,
                credentials.estado.toLowerCase() === 'activo' && styles.statusDotActive,
              ]}
            />
            <Text style={styles.statusText}>{credentials.estado || 'Desconocido'}</Text>
          </View>

          {/* CAMPOS */}
          <ScrollView style={styles.fieldsContainer} showsVerticalScrollIndicator={false}>
            {FIELDS.map(({ key, label, isSecret }) => {
              const value = credentials[key] || '';
              const isHidden = isSecret && !showSecret;
              const displayValue = isHidden
                ? '•'.repeat(Math.min(value.length, 24))
                : formatValue(key, value);
              const isCopied = copiedKey === key;

              return (
                <View key={key} style={styles.fieldRow}>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={styles.fieldLabel}>{label}</Text>
                    <Text
                      style={styles.fieldValue}
                      numberOfLines={key === 'descripcion' ? 3 : 1}
                      selectable
                    >
                      {displayValue}
                    </Text>
                  </View>

                  {isSecret && (
                    <TouchableOpacity
                      style={styles.iconBtn}
                      onPress={() => setShowSecret((s) => !s)}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={showSecret ? 'eye-off-outline' : 'eye-outline'}
                        size={14}
                        color="#666"
                      />
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={[styles.copyBtn, isCopied && styles.copyBtnSuccess]}
                    onPress={() => handleCopy(key, credentials[key])}
                    activeOpacity={0.85}
                    disabled={!credentials[key]}
                  >
                    <Ionicons
                      name={isCopied ? 'checkmark' : 'copy-outline'}
                      size={12}
                      color={isCopied ? '#2E7D32' : '#FFF'}
                    />
                    <Text style={[styles.copyText, isCopied && styles.copyTextSuccess]}>
                      {isCopied ? 'Copiado' : 'Copiar'}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </ScrollView>

          {/* FOOTER */}
          <View style={styles.footer}>
            <Text style={styles.footerHint}>
              Pega estos datos en OBS / Streamlabs para iniciar el broadcast.
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalBox: {
    width: '100%',
    maxWidth: 520,
    maxHeight: '85%',
    backgroundColor: '#FFF',
    borderRadius: 14,
    overflow: 'hidden',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF8E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 15, fontWeight: '800', color: '#111' },
  headerSubtitle: { fontSize: 11, color: '#888', marginTop: 1 },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#999',
  },
  statusDotActive: { backgroundColor: '#2E7D32' },
  statusText: { fontSize: 11, fontWeight: '700', color: '#333' },

  fieldsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },

  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  fieldLabel: {
    fontSize: 10,
    color: '#888',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  fieldValue: {
    fontSize: 12,
    color: '#111',
    marginTop: 3,
    fontFamily: 'monospace',
  },

  iconBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#111',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 6,
  },
  copyBtnSuccess: { backgroundColor: '#E8F5E9' },
  copyText: { fontSize: 10, fontWeight: '700', color: '#FFF' },
  copyTextSuccess: { color: '#2E7D32' },

  footer: {
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    backgroundColor: '#FAFAFA',
  },
  footerHint: {
    fontSize: 10,
    color: '#888',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
