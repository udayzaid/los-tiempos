import { LiveTheme } from '@/constants/live-theme';
import { api, type AdminProfileUser } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

type Feedback = { kind: 'success' | 'error'; message: string } | null;

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

export function UserModerationPanel() {
  const [username, setUsername] = useState('');
  const [userResult, setUserResult] = useState<AdminProfileUser | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [blockLoading, setBlockLoading] = useState(false);
  const [searchFeedback, setSearchFeedback] = useState<Feedback>(null);

  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);
  const [blockedCount, setBlockedCount] = useState(0);
  const [blockedLoading, setBlockedLoading] = useState(true);
  const [blockedFeedback, setBlockedFeedback] = useState<Feedback>(null);
  const [pendingUnblock, setPendingUnblock] = useState<string | null>(null);
  const [unblockingUser, setUnblockingUser] = useState<string | null>(null);


  const refreshBlockedUsers = useCallback(async () => {
    setBlockedLoading(true);
    setBlockedFeedback(null);
    try {
      const result = await api.getBlockedChatUsers();
      setBlockedUsers(result.blockedUsers);
      setBlockedCount(result.count);
    } catch (error) {
      setBlockedFeedback({ kind: 'error', message: getErrorMessage(error, 'No se pudo cargar la lista de bloqueados.') });
    } finally {
      setBlockedLoading(false);
    }
  }, []);

  useEffect(() => { void refreshBlockedUsers(); }, [refreshBlockedUsers]);

  const handleSearch = async () => {
    const value = username.trim();
    if (!value) {
      setSearchFeedback({ kind: 'error', message: 'Escribe el username que quieres consultar.' });
      setUserResult(null);
      return;
    }

    setSearchLoading(true);
    setSearchFeedback(null);
    setUserResult(null);
    try {
      const result = await api.getProfileUserByUsername(value);
      setUserResult(result);
    } catch (error) {
      setSearchFeedback({ kind: 'error', message: getErrorMessage(error, 'No se pudo encontrar el usuario.') });
    } finally {
      setSearchLoading(false);
    }
  };

  const handleBlockUser = async () => {
    const value = (userResult?.username || username).trim();
    if (!value) {
      setSearchFeedback({ kind: 'error', message: 'Busca un usuario antes de bloquearlo.' });
      return;
    }

    setBlockLoading(true);
    setSearchFeedback(null);
    try {
      const result = await api.blockChatUser(value);
      setSearchFeedback({ kind: 'success', message: result?.message || `@${value} fue bloqueado en el chat.` });
      await refreshBlockedUsers();
    } catch (error) {
      setSearchFeedback({ kind: 'error', message: getErrorMessage(error, 'No se pudo bloquear al usuario.') });
      // Mantener la lista sincronizada también cuando el servidor indique que ya estaba bloqueado.
      await refreshBlockedUsers();
    } finally {
      setBlockLoading(false);
    }
  };

  const handleUnblockUser = async (value: string) => {
    setUnblockingUser(value);
    setBlockedFeedback(null);
    try {
      const result = await api.unblockChatUser(value);
      setPendingUnblock(null);
      await refreshBlockedUsers();
      setBlockedFeedback({ kind: 'success', message: result?.message || `@${value} fue desbloqueado.` });
    } catch (error) {
      await refreshBlockedUsers();
      setBlockedFeedback({ kind: 'error', message: getErrorMessage(error, 'No se pudo desbloquear al usuario.') });
    } finally {
      setUnblockingUser(null);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.heading}>
        <View style={styles.headingIcon}>
          <Ionicons name="people-outline" size={19} color={LiveTheme.goldDark} />
        </View>
        <View style={styles.headingCopy}>
          <Text style={styles.title}>Usuarios</Text>
          <Text style={styles.subtitle}>Consulta perfiles y modera la participación en el chat del live.</Text>
        </View>
      </View>

      <View style={styles.sectionCard}>
        <View style={styles.sectionHeading}>
          <Ionicons name="search-outline" size={17} color={LiveTheme.textSecondary} />
          <View style={styles.sectionHeadingCopy}>
            <Text style={styles.sectionTitle}>Buscar usuario</Text>
            <Text style={styles.sectionSubtitle}>Consulta los datos de una cuenta por su username.</Text>
          </View>
        </View>
        <View style={styles.formRow}>
          <TextInput
            value={username}
            onChangeText={setUsername}
            placeholder="Username"
            placeholderTextColor={LiveTheme.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
            accessibilityLabel="Username del usuario"
            onSubmitEditing={handleSearch}
          />
          <Pressable
            style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed, searchLoading && styles.disabled]}
            onPress={handleSearch}
            disabled={searchLoading}
          >
            {searchLoading ? <ActivityIndicator size="small" color={LiveTheme.black} /> : <Ionicons name="search-outline" size={15} color={LiveTheme.black} />}
            <Text style={styles.primaryButtonText}>{searchLoading ? 'Buscando' : 'Buscar'}</Text>
          </Pressable>
        </View>

        {searchFeedback && <FeedbackMessage feedback={searchFeedback} />}
        {userResult && (
          <View style={styles.userResult}>
            <View style={styles.resultAvatar}><Ionicons name="person-outline" size={19} color={LiveTheme.textSecondary} /></View>
            <View style={styles.resultCopy}>
              <Text style={styles.resultName}>{[userResult.nombre, userResult.apellido].filter(Boolean).join(' ') || userResult.username}</Text>
              <Text style={styles.resultDetail}>@{userResult.username}</Text>
              <Text style={styles.resultDetail}>{userResult.correoElectronico}</Text>
            </View>
            <TouchableOpacity
              style={[styles.blockButton, blockLoading && styles.disabled]}
              onPress={() => void handleBlockUser()}
              disabled={blockLoading}
              accessibilityLabel={`Bloquear a ${userResult.username} en el chat`}
            >
              {blockLoading ? <ActivityIndicator size="small" color={LiveTheme.white} /> : <Ionicons name="ban-outline" size={15} color={LiveTheme.white} />}
              <Text style={styles.blockButtonText}>{blockLoading ? 'Bloqueando' : 'Bloquear chat'}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.sectionCard}>
        <View style={styles.blockedHeader}>
          <View style={styles.sectionHeading}>
            <Ionicons name="ban-outline" size={17} color={LiveTheme.textSecondary} />
            <View style={styles.sectionHeadingCopy}>
              <Text style={styles.sectionTitle}>Usuarios bloqueados</Text>
              <Text style={styles.sectionSubtitle}>{blockedCount} bloqueado{blockedCount === 1 ? '' : 's'} en el live actual</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={() => void refreshBlockedUsers()}
            disabled={blockedLoading}
            accessibilityRole="button"
            accessibilityLabel="Actualizar usuarios bloqueados"
          >
            {blockedLoading ? <ActivityIndicator size="small" color={LiveTheme.textSecondary} /> : <Ionicons name="refresh-outline" size={17} color={LiveTheme.textSecondary} />}
          </TouchableOpacity>
        </View>

        {blockedFeedback && <FeedbackMessage feedback={blockedFeedback} />}
        {blockedLoading ? (
          <View style={styles.listState}><ActivityIndicator color={LiveTheme.goldDark} /><Text style={styles.emptyText}>Actualizando lista...</Text></View>
        ) : blockedUsers.length === 0 ? (
          <View style={styles.listState}><Ionicons name="checkmark-circle-outline" size={20} color={LiveTheme.success} /><Text style={styles.emptyText}>No hay usuarios bloqueados en este live.</Text></View>
        ) : (
          blockedUsers.map((blockedUsername) => (
            <View key={blockedUsername} style={styles.blockedRow}>
              <View style={styles.blockedUserIcon}><Ionicons name="person-outline" size={15} color={LiveTheme.textSecondary} /></View>
              <Text style={styles.blockedUsername} numberOfLines={1}>@{blockedUsername}</Text>
              {pendingUnblock === blockedUsername ? (
                <View style={styles.inlineConfirm}>
                  <Text style={styles.confirmText}>¿Desbloquear?</Text>
                  <TouchableOpacity style={styles.cancelButton} onPress={() => setPendingUnblock(null)} disabled={unblockingUser === blockedUsername}>
                    <Text style={styles.cancelButtonText}>No</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.confirmButton} onPress={() => void handleUnblockUser(blockedUsername)} disabled={unblockingUser === blockedUsername}>
                    {unblockingUser === blockedUsername ? <ActivityIndicator size="small" color={LiveTheme.white} /> : <Text style={styles.confirmButtonText}>Sí</Text>}
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={styles.unblockButton} onPress={() => setPendingUnblock(blockedUsername)} disabled={Boolean(unblockingUser)}>
                  <Text style={styles.unblockButtonText}>Desbloquear</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}
      </View>

    </View>
  );
}

function FeedbackMessage({ feedback }: { feedback: Exclude<Feedback, null> }) {
  return (
    <View style={[styles.feedbackBox, feedback.kind === 'success' ? styles.feedbackSuccess : styles.feedbackError]}>
      <Ionicons
        name={feedback.kind === 'success' ? 'checkmark-circle-outline' : 'alert-circle-outline'}
        size={15}
        color={feedback.kind === 'success' ? LiveTheme.success : LiveTheme.error}
      />
      <Text style={[styles.feedbackText, feedback.kind === 'success' ? styles.feedbackSuccessText : styles.feedbackErrorText]}>{feedback.message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: LiveTheme.spacing.md },
  heading: { flexDirection: 'row', alignItems: 'center', gap: 11, paddingHorizontal: 2, paddingBottom: 2 },
  headingIcon: { width: 38, height: 38, borderRadius: LiveTheme.radius.md, backgroundColor: LiveTheme.surfaceSoft, alignItems: 'center', justifyContent: 'center' },
  headingCopy: { flex: 1, minWidth: 0 },
  title: { color: LiveTheme.text, fontSize: 16, fontWeight: '700' },
  subtitle: { color: LiveTheme.textMuted, fontSize: 11, lineHeight: 16, marginTop: 3 },
  sectionCard: { padding: LiveTheme.spacing.lg, borderWidth: 1, borderColor: LiveTheme.border, borderRadius: LiveTheme.radius.lg, backgroundColor: LiveTheme.surface },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', gap: 9, flex: 1, minWidth: 0, marginBottom: LiveTheme.spacing.md },
  sectionHeadingCopy: { flex: 1, minWidth: 0 },
  sectionTitle: { color: LiveTheme.text, fontSize: 13, fontWeight: '700' },
  sectionSubtitle: { color: LiveTheme.textMuted, fontSize: 10, lineHeight: 15, marginTop: 2 },
  formRow: { flexDirection: 'row', gap: 8 },
  input: { flex: 1, minWidth: 0, height: 40, paddingHorizontal: 11, borderWidth: 1, borderColor: LiveTheme.borderStrong, borderRadius: LiveTheme.radius.sm, backgroundColor: LiveTheme.offWhite, color: LiveTheme.text, fontSize: 12 },
  primaryButton: { minHeight: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: 13, borderRadius: LiveTheme.radius.sm, backgroundColor: LiveTheme.gold },
  primaryButtonText: { color: LiveTheme.black, fontSize: 10, fontWeight: '700' },
  pressed: { opacity: 0.8 },
  disabled: { opacity: 0.5 },
  userResult: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: LiveTheme.spacing.md, padding: 12, borderRadius: LiveTheme.radius.md, borderWidth: 1, borderColor: LiveTheme.border, backgroundColor: LiveTheme.offWhite },
  resultAvatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: LiveTheme.surfaceSoft, alignItems: 'center', justifyContent: 'center' },
  resultCopy: { flex: 1, minWidth: 0 },
  resultName: { color: LiveTheme.text, fontSize: 12, fontWeight: '700' },
  resultDetail: { color: LiveTheme.textMuted, fontSize: 10, marginTop: 2 },
  blockButton: { minHeight: 34, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingHorizontal: 10, borderRadius: LiveTheme.radius.sm, backgroundColor: LiveTheme.error },
  blockButtonText: { color: LiveTheme.white, fontSize: 10, fontWeight: '700' },
  blockedHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  refreshButton: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: LiveTheme.border, borderRadius: LiveTheme.radius.sm },
  listState: { minHeight: 64, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  emptyText: { color: LiveTheme.textMuted, fontSize: 11, textAlign: 'center' },
  blockedRow: { flexDirection: 'row', alignItems: 'center', gap: 9, paddingVertical: 10, borderTopWidth: 1, borderTopColor: LiveTheme.border },
  blockedUserIcon: { width: 28, height: 28, borderRadius: 14, backgroundColor: LiveTheme.surfaceSoft, alignItems: 'center', justifyContent: 'center' },
  blockedUsername: { flex: 1, minWidth: 0, color: LiveTheme.text, fontSize: 11, fontWeight: '600' },
  unblockButton: { paddingHorizontal: 10, paddingVertical: 7, borderWidth: 1, borderColor: LiveTheme.borderStrong, borderRadius: LiveTheme.radius.sm },
  unblockButtonText: { color: LiveTheme.textSecondary, fontSize: 10, fontWeight: '600' },
  inlineConfirm: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  confirmText: { color: LiveTheme.textSecondary, fontSize: 9 },
  cancelButton: { paddingHorizontal: 8, paddingVertical: 6, borderWidth: 1, borderColor: LiveTheme.borderStrong, borderRadius: LiveTheme.radius.sm },
  cancelButtonText: { color: LiveTheme.textSecondary, fontSize: 9, fontWeight: '600' },
  confirmButton: { minWidth: 30, minHeight: 28, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8, borderRadius: LiveTheme.radius.sm, backgroundColor: LiveTheme.error },
  confirmButtonText: { color: LiveTheme.white, fontSize: 9, fontWeight: '700' },
  feedbackBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 7, marginTop: 10, padding: 9, borderRadius: LiveTheme.radius.sm },
  feedbackSuccess: { backgroundColor: '#EAF4EC' },
  feedbackError: { backgroundColor: '#FDECEC' },
  feedbackText: { flex: 1, fontSize: 10, lineHeight: 15 },
  feedbackSuccessText: { color: LiveTheme.success },
  feedbackErrorText: { color: LiveTheme.error },
});
