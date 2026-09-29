import { LiveTheme } from '@/constants/live-theme';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { useLiveHub } from '@/context/LiveHubContext';
import { router, usePathname } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, Modal, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';

type Props = { headline: string; onOpenLogin: () => void; onOpenRegister: () => void };

export function LiveHeader({ headline, onOpenLogin, onOpenRegister }: Props) {
  const { width } = useWindowDimensions();
  const pathname = usePathname();
  const { liveInfo } = useLiveHub();
  const { isAuthenticated, profile, role, logout } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [profileVisible, setProfileVisible] = useState(false);

  const isNarrow = width < 560;
  const isMobile = width < 700;
  const isCompact = width < 900;
  const isLive = Boolean(liveInfo?.isLive);

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

  const handleAdminPress = () => {
    if (pathname.startsWith('/admin')) { router.replace('/'); return; }
    router.push('/admin');
  };

  return (
    <View style={styles.wrapper} role="banner">
      <View style={[styles.topRow, isCompact && styles.topRowCompact, isMobile && styles.topRowMobile, isNarrow && styles.topRowNarrow]}>
        <View style={[styles.buildingFrame, isCompact && styles.buildingFrameCompact, isMobile && styles.buildingFrameMobile, isNarrow && styles.buildingFrameNarrow]} pointerEvents="none">
          <Image source={require('../../../imagenes/logo 2.1.png')} style={[styles.buildingLogo, isCompact && styles.buildingLogoCompact, isMobile && styles.buildingLogoMobile, isNarrow && styles.buildingLogoNarrow]} resizeMode="contain" />
        </View>

        <View style={[styles.brandFrame, isCompact && styles.brandFrameCompact, isMobile && styles.brandFrameMobile, isNarrow && styles.brandFrameNarrow]} pointerEvents="none">
          <Image source={require('../../../imagenes/logo 1 (1).png')} style={[styles.logo, isCompact && styles.logoCompact, isMobile && styles.logoMobile, isNarrow && styles.logoNarrow]} resizeMode="contain" />
        </View>

        <View style={[styles.authButtonsContainer, isCompact && styles.authButtonsCompact, isMobile && styles.authButtonsMobile, isNarrow && styles.authButtonsNarrow]}>
          {!isAuthenticated ? (
            <>
              <TouchableOpacity style={[styles.registerBtn, isNarrow && styles.compactButton]} onPress={onOpenRegister} activeOpacity={0.8} accessibilityRole="button" accessibilityLabel="Registrarse">
                <Ionicons name="person-add-outline" size={isNarrow ? 18 : 17} color={LiveTheme.black} />
                {!isNarrow && <Text style={styles.registerBtnText}>Registrarse</Text>}
              </TouchableOpacity>
              <TouchableOpacity style={[styles.loginBtn, isNarrow && styles.compactButton]} onPress={onOpenLogin} activeOpacity={0.8} accessibilityRole="button" accessibilityLabel="Iniciar sesión">
                <Ionicons name="person-circle-outline" size={isNarrow ? 20 : 23} color={LiveTheme.black} />
                {!isNarrow && <Text style={styles.loginBtnText}>Iniciar sesión</Text>}
              </TouchableOpacity>
            </>
          ) : (
            <>
              {isAdmin && (
                <TouchableOpacity style={[styles.adminBtn, isNarrow && styles.compactButton]} onPress={handleAdminPress} activeOpacity={0.8} accessibilityRole="button" accessibilityLabel="Administrar">
                  <Ionicons name="settings-outline" size={isNarrow ? 18 : 19} color={LiveTheme.black} />
                  {!isNarrow && <Text style={styles.adminBtnText}>{pathname.startsWith('/admin') ? 'Inicio' : 'Administrar'}</Text>}
                </TouchableOpacity>
              )}
              <TouchableOpacity style={[styles.userInfo, isNarrow && styles.compactButton]} onPress={() => setProfileVisible(true)} activeOpacity={0.8} accessibilityRole="button" accessibilityLabel="Ver perfil de usuario">
                <Ionicons name="person-circle-outline" size={isNarrow ? 20 : 23} color={LiveTheme.black} />
                {!isNarrow && <Text style={styles.userText} numberOfLines={1}>{profileEmail || userName}</Text>}
              </TouchableOpacity>
              <TouchableOpacity style={[styles.logoutBtn, isNarrow && styles.compactButton]} onPress={logout} activeOpacity={0.8} accessibilityRole="button" accessibilityLabel="Cerrar sesión">
                <Ionicons name="log-out-outline" size={isNarrow ? 19 : 20} color={LiveTheme.black} />
                {!isNarrow && <Text style={styles.logoutBtnText}>Cerrar sesión</Text>}
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      <Modal visible={profileVisible} transparent animationType="fade" onRequestClose={() => setProfileVisible(false)}>
        <View style={styles.profileBackdrop}>
          <View style={styles.profileModal}>
            <View style={styles.profileHeader}>
              <View style={styles.profileHeaderIcon}><Ionicons name="person-outline" size={19} color={LiveTheme.goldDark} /></View>
              <View style={styles.profileHeaderCopy}><Text style={styles.profileTitle}>Mi perfil</Text><Text style={styles.profileSubtitle}>Información de tu cuenta</Text></View>
              <TouchableOpacity style={styles.profileClose} onPress={() => setProfileVisible(false)} accessibilityRole="button" accessibilityLabel="Cerrar perfil"><Ionicons name="close" size={20} color={LiveTheme.textSecondary} /></TouchableOpacity>
            </View>
            <View style={styles.profileFields}>
              <View style={styles.profileField}><Text style={styles.profileLabel}>Correo electrónico</Text><Text style={styles.profileValue} selectable>{profileEmail || 'No disponible'}</Text></View>
              <View style={styles.profileField}><Text style={styles.profileLabel}>Nombre de usuario</Text><Text style={styles.profileValue} selectable>{profileUserName || 'No disponible'}</Text></View>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.headlineBar}>
        <View style={[styles.liveStateDot, isLive && styles.liveStateDotActive]} accessibilityLabel={isLive ? 'Transmisión en vivo activa' : 'Sin transmisión en vivo'} />
        <Text style={styles.headlineText} numberOfLines={1}>{headline}</Text>
        {!isMobile && <Text style={styles.dateText}>{displayDate}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { width: '100%', backgroundColor: LiveTheme.offWhite },
  topRow: { width: '100%', minHeight: 115, position: 'relative', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: LiveTheme.border },
  topRowCompact: { minHeight: 105, paddingHorizontal: 12 },
  topRowMobile: { minHeight: 112, paddingHorizontal: 10, paddingBottom: 42 },
  topRowNarrow: { minHeight: 125, paddingBottom: 46 },
  buildingFrame: { position: 'absolute', left: 0, top: 0, width: 350, height: 115, justifyContent: 'center', alignItems: 'flex-start', overflow: 'hidden' },
  buildingFrameCompact: { width: 245, height: 105 },
  buildingFrameMobile: { width: 150, height: 78 },
  buildingFrameNarrow: { width: 105, height: 66 },
  buildingLogo: { width: 350, height: 120 },
  buildingLogoCompact: { width: 245, height: 105 },
  buildingLogoMobile: { width: 150, height: 78 },
  buildingLogoNarrow: { width: 105, height: 66 },
  brandFrame: { width: 350, height: 115, justifyContent: 'center', alignItems: 'center' },
  brandFrameCompact: { width: 285, height: 100 },
  brandFrameMobile: { width: 220, height: 75 },
  brandFrameNarrow: { width: 175, height: 62 },
  logo: { width: 350, height: 115 },
  logoCompact: { width: 285, height: 100 },
  logoMobile: { width: 220, height: 75 },
  logoNarrow: { width: 175, height: 62 },
  authButtonsContainer: { position: 'absolute', right: 20, bottom: 8, flexDirection: 'row', alignItems: 'center', gap: 8, zIndex: 5 },
  authButtonsCompact: { right: 12, bottom: 7, gap: 6 },
  authButtonsMobile: { left: 10, right: 10, bottom: 7, justifyContent: 'flex-end', gap: 6 },
  authButtonsNarrow: { left: 10, right: 10, bottom: 8, justifyContent: 'center', gap: 8 },
  registerBtn: { height: 35, paddingHorizontal: 10, backgroundColor: LiveTheme.gold, borderRadius: 10, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 5 },
  compactButton: { width: 42, height: 36, paddingHorizontal: 0, borderRadius: 9 },
  registerBtnText: { color: LiveTheme.black, fontSize: 12, fontWeight: '700' },
  loginBtn: { height: 35, paddingHorizontal: 10, backgroundColor: LiveTheme.white, borderWidth: 1, borderColor: '#D9D9D9', borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  loginBtnText: { color: LiveTheme.black, fontSize: 12, fontWeight: '500' },
  adminBtn: { height: 35, paddingHorizontal: 10, backgroundColor: LiveTheme.white, borderWidth: 1, borderColor: '#D9D9D9', borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  adminBtnText: { color: LiveTheme.black, fontSize: 12, fontWeight: '600' },
  userInfo: { height: 35, paddingHorizontal: 10, backgroundColor: LiveTheme.white, borderWidth: 1, borderColor: '#D9D9D9', borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, maxWidth: 220 },
  userText: { color: LiveTheme.black, fontSize: 12, fontWeight: '600', maxWidth: 160 },
  logoutBtn: { height: 35, paddingHorizontal: 10, backgroundColor: LiveTheme.gold, borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  logoutBtnText: { color: LiveTheme.black, fontSize: 12, fontWeight: '700' },
  headlineBar: { width: '100%', height: 34, backgroundColor: LiveTheme.gold, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 12 },
  headlineText: { flex: 1, color: LiveTheme.black, fontSize: 10, fontWeight: '800' },
  dateText: { color: LiveTheme.black, fontSize: 9, fontWeight: '700' },
  liveStateDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: LiveTheme.textMuted },
  liveStateDotActive: { backgroundColor: LiveTheme.liveRed },
  profileBackdrop: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, backgroundColor: 'rgba(0,0,0,0.42)' },
  profileModal: { width: '100%', maxWidth: 380, borderRadius: LiveTheme.radius.lg, borderWidth: 1, borderColor: LiveTheme.border, backgroundColor: LiveTheme.surface, overflow: 'hidden' },
  profileHeader: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: LiveTheme.border },
  profileHeaderIcon: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 19, backgroundColor: LiveTheme.surfaceSoft, marginRight: 11 },
  profileHeaderCopy: { flex: 1 },
  profileTitle: { color: LiveTheme.text, fontSize: 15, fontWeight: '700' },
  profileSubtitle: { color: LiveTheme.textMuted, fontSize: 11, marginTop: 3 },
  profileClose: { padding: 5, marginLeft: 8 },
  profileFields: { padding: 16, gap: 12 },
  profileField: { padding: 12, borderRadius: LiveTheme.radius.md, borderWidth: 1, borderColor: LiveTheme.border, backgroundColor: LiveTheme.offWhite },
  profileLabel: { color: LiveTheme.textMuted, fontSize: 10, fontWeight: '600', marginBottom: 5 },
  profileValue: { color: LiveTheme.text, fontSize: 13, fontWeight: '600' },
});