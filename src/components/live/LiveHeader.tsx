import { LiveTheme } from '@/constants/live-theme';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { useLiveHub } from '@/context/LiveHubContext';
import { api } from '@/services/api';
import { router, usePathname } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';

type Props = {
  headline: string;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  onGoInicio?: () => void;
  onGoNoticias?: () => void;
  onGoVideos?: () => void;
  onGoEnlaces?: () => void;
};

export function LiveHeader({
  headline,
  onOpenLogin,
  onOpenRegister,
  onGoInicio,
  onGoNoticias,
  onGoVideos,
  onGoEnlaces,
}: Props) {
  const { width } = useWindowDimensions();
  const pathname = usePathname();
  const { liveInfo } = useLiveHub();
  const { isAuthenticated, profile, role, logout } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [profileVisible, setProfileVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState<{ kind: 'success' | 'error'; message: string } | null>(null);

  // ---------- BREAKPOINTS ----------
  const isMobile = width < 700;
  const showBuildingLogo = width >= 1180; // primero desaparece el logo del edificio
  const showBrandLogo = width >= 560;     // luego desaparece el logo de marca
  const isLive = Boolean(liveInfo?.isLive);
  const isSmallNav = width < 900;
  const isMediumNav = width >= 900 && width < 1200;
  // Los botones conservan tamaño y texto. Bajo 900px pasan debajo del logo.
  const buttonsOnOwnRow = width < 900;

  useEffect(() => {
    const updateDate = () => setCurrentDate(new Date());
    updateDate();
    const intervalId = setInterval(updateDate, 60 * 1000);
    return () => clearInterval(intervalId);
  }, []);

  const formattedDate = new Intl.DateTimeFormat('es-BO', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  }).format(currentDate);
  const displayDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

  const isAdmin = role?.trim().toLowerCase() === 'admin';
  const userName = profile?.name || profile?.userName || profile?.email || 'Usuario';
  const profileEmail = String(profile?.email ?? profile?.Email ?? '');
  const profileUserName = String(profile?.userName ?? profile?.username ?? profile?.NombreUsuario ?? profile?.nombreUsuario ?? profile?.name ?? '');

  const closeProfile = () => {
    setProfileVisible(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordFeedback(null);
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordFeedback({ kind: 'error', message: 'Completa los tres campos.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordFeedback({ kind: 'error', message: 'La nueva contraseña y su confirmación no coinciden.' });
      return;
    }

    setPasswordLoading(true);
    setPasswordFeedback(null);
    try {
      const result = await api.changeProfilePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordFeedback({ kind: 'success', message: result?.message || 'La contraseña se actualizó correctamente.' });
    } catch (error) {
      setPasswordFeedback({
        kind: 'error',
        message: error instanceof Error ? error.message : 'No se pudo cambiar la contraseña.',
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleAdminPress = () => {
    if (pathname.startsWith('/admin')) { router.replace('/'); return; }
    router.push('/admin');
  };

  const navigationItems = [
    { label: 'INICIO', action: onGoInicio },
    { label: 'NOTICIAS', action: onGoNoticias },
    { label: 'COCHABAMBA', action: onGoNoticias },
    { label: 'BOLIVIA', action: onGoNoticias },
    { label: 'DEPORTES', action: onGoNoticias },
    { label: 'MUNDO', action: onGoNoticias },
    { label: 'VIDEOS CORTOS', action: onGoVideos },
    { label: 'ENLACES', action: onGoEnlaces },
    { label: 'OPINIÓN', action: onGoNoticias },
    { label: 'ECONOMÍA', action: onGoNoticias },
    { label: 'CULTURA', action: onGoNoticias },
    { label: 'SOCIEDAD', action: onGoNoticias },
    { label: 'MULTIMEDIA', action: onGoVideos },
  ];

  return (
    <View style={styles.wrapper} role="banner">
      {/* FILA SUPERIOR: [izquierda] [centro] [derecha] sin posiciones absolutas */}
      <View style={[styles.topRow, buttonsOnOwnRow && styles.topRowStacked, !showBrandLogo && styles.topRowNoLogos]}>
        {/* Columna izquierda: logo del edificio (solo pantallas grandes) */}
        {showBuildingLogo && (
          <View style={styles.sideColumn} pointerEvents="none">
            <Image source={require('../../../imagenes/logo 2.1.png')} style={styles.buildingLogo} resizeMode="contain" />
          </View>
        )}

        {/* Columna central: conserva su tamaño y luego desaparece */}
        {showBrandLogo && (
          <View
            style={[styles.brandFrame, !showBuildingLogo && styles.brandFrameLeft]}
            pointerEvents="none"
          >
            <Image source={require('../../../imagenes/logo 1 (1).png')} style={styles.brandLogo} resizeMode="contain" />
          </View>
        )}

        {/* Columna derecha: botones a tamaño normal */}
        <View
          style={[
            styles.authButtonsContainer,
            showBuildingLogo && styles.sideColumn,
            showBuildingLogo && styles.authButtonsInSide,
            !showBuildingLogo && showBrandLogo && styles.authButtonsBesideLogo,
            buttonsOnOwnRow && styles.authButtonsOwnRow,
          ]}
        >
          {!isAuthenticated ? (
            <>
              <TouchableOpacity style={styles.registerBtn} onPress={onOpenRegister} activeOpacity={0.8} accessibilityRole="button" accessibilityLabel="Registrarse">
                <Ionicons name="person-add-outline" size={17} color={LiveTheme.black} />
                <Text style={styles.registerBtnText}>Registrarse</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.loginBtn} onPress={onOpenLogin} activeOpacity={0.8} accessibilityRole="button" accessibilityLabel="Iniciar sesión">
                <Ionicons name="person-circle-outline" size={23} color={LiveTheme.black} />
                <Text style={styles.loginBtnText}>Iniciar sesión</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              {isAdmin && (
                <TouchableOpacity style={styles.adminBtn} onPress={handleAdminPress} activeOpacity={0.8} accessibilityRole="button" accessibilityLabel="Administrar">
                  <Ionicons name="settings-outline" size={19} color={LiveTheme.black} />
                  <Text style={styles.adminBtnText}>{pathname.startsWith('/admin') ? 'Inicio' : 'Administrar'}</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.userInfo} onPress={() => setProfileVisible(true)} activeOpacity={0.8} accessibilityRole="button" accessibilityLabel="Ver perfil de usuario">
                <Ionicons name="person-circle-outline" size={23} color={LiveTheme.black} />
                <Text style={styles.userText} numberOfLines={1}>{profileEmail || userName}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.8} accessibilityRole="button" accessibilityLabel="Cerrar sesión">
                <Ionicons name="log-out-outline" size={20} color={LiveTheme.black} />
                <Text style={styles.logoutBtnText}>Cerrar sesión</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      <Modal visible={profileVisible} transparent animationType="fade" onRequestClose={closeProfile}>
        <View style={styles.profileBackdrop}>
          <View style={styles.profileModal}>
            <View style={styles.profileHeader}>
              <View style={styles.profileHeaderIcon}><Ionicons name="person-outline" size={19} color={LiveTheme.goldDark} /></View>
              <View style={styles.profileHeaderCopy}><Text style={styles.profileTitle}>Mi perfil</Text><Text style={styles.profileSubtitle}>Información de tu cuenta</Text></View>
              <TouchableOpacity style={styles.profileClose} onPress={closeProfile} accessibilityRole="button" accessibilityLabel="Cerrar perfil"><Ionicons name="close" size={20} color={LiveTheme.textSecondary} /></TouchableOpacity>
            </View>
            <ScrollView style={styles.profileFieldsScroller} contentContainerStyle={styles.profileFields} keyboardShouldPersistTaps="handled">
              <View style={styles.profileField}><Text style={styles.profileLabel}>Correo electrónico</Text><Text style={styles.profileValue} selectable>{profileEmail || 'No disponible'}</Text></View>
              <View style={styles.profileField}><Text style={styles.profileLabel}>Nombre de usuario</Text><Text style={styles.profileValue} selectable>{profileUserName || 'No disponible'}</Text></View>
              <View style={styles.passwordSection}>
                <View style={styles.passwordHeading}>
                  <Ionicons name="key-outline" size={16} color={LiveTheme.textSecondary} />
                  <View style={styles.profileHeaderCopy}>
                    <Text style={styles.passwordTitle}>Cambiar contraseña</Text>
                    <Text style={styles.passwordHint}>Actualiza la contraseña de tu cuenta.</Text>
                  </View>
                </View>
                <TextInput
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  placeholder="Contraseña actual"
                  placeholderTextColor={LiveTheme.textMuted}
                  secureTextEntry
                  style={styles.passwordInput}
                  accessibilityLabel="Contraseña actual"
                />
                <TextInput
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Nueva contraseña"
                  placeholderTextColor={LiveTheme.textMuted}
                  secureTextEntry
                  style={styles.passwordInput}
                  accessibilityLabel="Nueva contraseña"
                />
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirmar nueva contraseña"
                  placeholderTextColor={LiveTheme.textMuted}
                  secureTextEntry
                  style={styles.passwordInput}
                  accessibilityLabel="Confirmar nueva contraseña"
                  onSubmitEditing={() => void handleChangePassword()}
                />
                {passwordFeedback && (
                  <View style={[styles.passwordFeedback, passwordFeedback.kind === 'success' ? styles.passwordSuccess : styles.passwordError]}>
                    <Ionicons
                      name={passwordFeedback.kind === 'success' ? 'checkmark-circle-outline' : 'alert-circle-outline'}
                      size={15}
                      color={passwordFeedback.kind === 'success' ? LiveTheme.success : LiveTheme.error}
                    />
                    <Text style={[styles.passwordFeedbackText, passwordFeedback.kind === 'success' ? styles.passwordSuccessText : styles.passwordErrorText]}>
                      {passwordFeedback.message}
                    </Text>
                  </View>
                )}
                <TouchableOpacity
                  style={[styles.passwordButton, passwordLoading && styles.passwordButtonDisabled]}
                  onPress={() => void handleChangePassword()}
                  disabled={passwordLoading}
                  accessibilityRole="button"
                >
                  {passwordLoading ? <ActivityIndicator size="small" color={LiveTheme.black} /> : <Ionicons name="save-outline" size={15} color={LiveTheme.black} />}
                  <Text style={styles.passwordButtonText}>{passwordLoading ? 'Actualizando...' : 'Actualizar contraseña'}</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
{/* NAVEGACIÓN PRINCIPAL */}
<View style={styles.navigationBar}>
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.navigationContent}
    keyboardShouldPersistTaps="handled"
  >
    {navigationItems.map((item) => (
      <TouchableOpacity
        key={item.label}
        style={[
          styles.navigationItem,
          width < 1100 && styles.navigationItemCompact,
          width < 700 && styles.navigationItemMobile,
        ]}
        onPress={item.action}
        activeOpacity={0.75}
        accessibilityRole="button"
        accessibilityLabel={item.label}
        disabled={!item.action}
      >
        <Text
          style={[
            styles.navigationText,
            width < 1100 && styles.navigationTextCompact,
            width < 700 && styles.navigationTextMobile,
          ]}
          numberOfLines={1}
        >
          {item.label}
        </Text>
      </TouchableOpacity>
    ))}

    <TouchableOpacity
      style={styles.menuButton}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel="Menú"
    >
      <Ionicons
        name="menu"
        size={22}
        color={LiveTheme.black}
      />
    </TouchableOpacity>
  </ScrollView>
</View>

      {/* ESPACIO ENTRE ENCABEZADOS */}
      <View style={styles.headerSpacing} />

      {/* TITULAR / BARRA DE INFORMACIÓN */}
      <View style={styles.headlineBar}>
        <View
          style={[styles.liveStateDot, isLive && styles.liveStateDotActive]}
          accessibilityLabel={isLive ? 'Transmisión en vivo activa' : 'Sin transmisión en vivo'}
        />

        <Text style={styles.headlineText} numberOfLines={1}>
          {headline}
        </Text>

        {!isMobile && (
          <Text style={styles.dateText} numberOfLines={1}>
            {displayDate}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { width: '100%', backgroundColor: LiveTheme.offWhite },

  // ---------- NAVEGACIÓN ----------
  navigationBar: {
  width: '100%',
  height: 38,
  backgroundColor: LiveTheme.gold,
  borderBottomWidth: 1,
  borderBottomColor: 'rgba(0,0,0,0.12)',
},

navigationContent: {
  flexGrow: 1,
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'stretch',
  paddingHorizontal: 0,
},

navigationItem: {
  minHeight: 38,
  flexShrink: 0,
  paddingHorizontal: 13,
  justifyContent: 'center',
  alignItems: 'center',
  borderRightWidth: 1,
  borderRightColor: 'rgba(0,0,0,0.14)',
},

navigationItemCompact: {
  paddingHorizontal: 9,
},

navigationItemMobile: {
  paddingHorizontal: 8,
},

navigationText: {
  color: LiveTheme.black,
  fontSize: 10,
  fontWeight: '800',
  letterSpacing: 0.1,
},

navigationTextCompact: {
  fontSize: 9,
},

navigationTextMobile: {
  fontSize: 9,
},

menuButton: {
  minHeight: 38,
  minWidth: 44,
  paddingHorizontal: 8,
  justifyContent: 'center',
  alignItems: 'center',
},

  // ---------- FILA SUPERIOR (flujo normal, sin absolute) ----------
  topRow: {
    width: '100%',
    minHeight: 115,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: LiveTheme.border,
  },
  // Cuando el logo principal comparte poco espacio con las acciones,
  // mantiene su tamaño arriba y los botones bajan a una fila propia.
  topRowStacked: { minHeight: 180, flexDirection: 'column', alignItems: 'stretch', justifyContent: 'space-between', gap: 8 },
  topRowNoLogos: { minHeight: 72, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'flex-end', paddingBottom: 4 },

  // Columnas laterales (≥ 1180px): izquierda y derecha con el mismo ancho
  // para que el logo de marca quede centrado de verdad
  sideColumn: {
  width: 350,
  flexShrink: 0,
  minWidth: 0,
},
  buildingLogo: { width: 350, height: 115 },

  brandFrame: { flexShrink: 0, justifyContent: 'center', alignItems: 'center' },
  brandFrameLeft: { alignItems: 'flex-start' },
  brandLogo: { width: 350, height: 115 },

  // ---------- BOTONES ----------
  authButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
    gap: 8,
  },
  authButtonsInSide: {
  justifyContent: 'flex-end',
  alignItems: 'center',
  paddingTop: 80,
},
  authButtonsBesideLogo: { flex: 1, minWidth: 0 },
  authButtonsOwnRow: { width: '100%', justifyContent: 'flex-end' },

  registerBtn: { height: 35, paddingHorizontal: 10, backgroundColor: LiveTheme.gold, borderRadius: 10, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 5 },
  registerBtnText: { color: LiveTheme.black, fontSize: 12, fontWeight: '700' },
  loginBtn: { height: 35, paddingHorizontal: 10, backgroundColor: LiveTheme.white, borderWidth: 1, borderColor: '#D9D9D9', borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  loginBtnText: { color: LiveTheme.black, fontSize: 12, fontWeight: '500' },
  adminBtn: { height: 35, paddingHorizontal: 10, backgroundColor: LiveTheme.white, borderWidth: 1, borderColor: '#D9D9D9', borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  adminBtnText: { color: LiveTheme.black, fontSize: 12, fontWeight: '600' },
  userInfo: { height: 35, paddingHorizontal: 10, backgroundColor: LiveTheme.white, borderWidth: 1, borderColor: '#D9D9D9', borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, maxWidth: 220 },
  userText: { color: LiveTheme.black, fontSize: 12, fontWeight: '600', maxWidth: 160 },
  logoutBtn: { height: 35, paddingHorizontal: 10, backgroundColor: LiveTheme.gold, borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  logoutBtnText: { color: LiveTheme.black, fontSize: 12, fontWeight: '700' },

  // ---------- TITULAR ----------
  headlineBar: { width: '100%', height: 34, backgroundColor: LiveTheme.gold, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 12 },
  headlineText: { flex: 1, color: LiveTheme.black, fontSize: 10, fontWeight: '800' },
  dateText: { flexShrink: 1, color: LiveTheme.black, fontSize: 9, fontWeight: '700' },
  liveStateDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: LiveTheme.textMuted },
  liveStateDotActive: { backgroundColor: LiveTheme.liveRed },
  headerSpacing: { height: 8, width: '100%' },

  // ---------- MODAL DE PERFIL ----------
  profileBackdrop: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, backgroundColor: 'rgba(0,0,0,0.42)' },
  profileModal: { width: '100%', maxWidth: 380, maxHeight: '90%', borderRadius: LiveTheme.radius.lg, borderWidth: 1, borderColor: LiveTheme.border, backgroundColor: LiveTheme.surface, overflow: 'hidden' },
  profileHeader: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: LiveTheme.border },
  profileHeaderIcon: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 19, backgroundColor: LiveTheme.surfaceSoft, marginRight: 11 },
  profileHeaderCopy: { flex: 1 },
  profileTitle: { color: LiveTheme.text, fontSize: 15, fontWeight: '700' },
  profileSubtitle: { color: LiveTheme.textMuted, fontSize: 11, marginTop: 3 },
  profileClose: { padding: 5, marginLeft: 8 },
  profileFieldsScroller: { flexShrink: 1 },
  profileFields: { padding: 16, gap: 12 },
  profileField: { padding: 12, borderRadius: LiveTheme.radius.md, borderWidth: 1, borderColor: LiveTheme.border, backgroundColor: LiveTheme.offWhite },
  profileLabel: { color: LiveTheme.textMuted, fontSize: 10, fontWeight: '600', marginBottom: 5 },
  profileValue: { color: LiveTheme.text, fontSize: 13, fontWeight: '600' },
  passwordSection: { padding: 12, borderWidth: 1, borderColor: LiveTheme.border, borderRadius: LiveTheme.radius.md, backgroundColor: LiveTheme.surface },
  passwordHeading: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  passwordTitle: { color: LiveTheme.text, fontSize: 12, fontWeight: '700' },
  passwordHint: { color: LiveTheme.textMuted, fontSize: 10, marginTop: 2 },
  passwordInput: { height: 38, paddingHorizontal: 10, marginBottom: 8, borderWidth: 1, borderColor: LiveTheme.borderStrong, borderRadius: LiveTheme.radius.sm, backgroundColor: LiveTheme.offWhite, color: LiveTheme.text, fontSize: 11 },
  passwordButton: { minHeight: 37, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 2, paddingHorizontal: 12, borderRadius: LiveTheme.radius.sm, backgroundColor: LiveTheme.gold },
  passwordButtonDisabled: { opacity: 0.55 },
  passwordButtonText: { color: LiveTheme.black, fontSize: 10, fontWeight: '700' },
  passwordFeedback: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginBottom: 8, padding: 8, borderRadius: LiveTheme.radius.sm },
  passwordSuccess: { backgroundColor: '#EAF4EC' },
  passwordError: { backgroundColor: '#FDECEC' },
  passwordFeedbackText: { flex: 1, fontSize: 10, lineHeight: 14 },
  passwordSuccessText: { color: LiveTheme.success },
  passwordErrorText: { color: LiveTheme.error },
});
