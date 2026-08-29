import { LiveTheme } from '@/constants/live-theme';
import { StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';

type Props = {
  headline: string;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
};

export function LiveHeader({ headline, onOpenLogin, onOpenRegister }: Props) {
  const { width } = useWindowDimensions();
  const isMobile = width < 700;

  return (
    <View style={styles.wrapper}>
      <View style={styles.topRow}>
        <View style={styles.brandFrame} pointerEvents="none">
          <View style={styles.cornerTopLeft} />
          <View style={styles.cornerBottomRight} />
          <Text style={[styles.brand, isMobile && styles.brandMobile]}>Los Tiempos</Text>
        </View>

        <View style={[styles.authButtonsContainer, isMobile && styles.authButtonsMobile]}>
          <TouchableOpacity style={styles.registerBtn} onPress={onOpenRegister} activeOpacity={0.8}>
            <Text style={styles.registerBtnText}>Registrarse</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginBtn} onPress={onOpenLogin} activeOpacity={0.8}>
            <Text style={styles.loginBtnText}>Iniciar sesión</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.headlineBar}>
        <Text style={styles.headlineText} numberOfLines={1}>
          {headline}
        </Text>
        <Text style={styles.dateText}>Martes, 30 de Noviembre de 2026</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    backgroundColor: LiveTheme.offWhite,
  },
  topRow: {
    minHeight: 106,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E7E0D2',
  },
  brandFrame: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 230,
    minHeight: 76,
  },
  brand: {
    color: LiveTheme.black,
    fontFamily: 'serif',
    fontSize: 38,
    fontWeight: '700',
    letterSpacing: -1.5,
  },
  brandMobile: {
    fontSize: 28,
  },
  cornerTopLeft: {
    position: 'absolute',
    width: 18,
    height: 18,
    left: 0,
    top: 2,
    borderLeftWidth: 3,
    borderTopWidth: 3,
    borderColor: LiveTheme.gold,
  },
  cornerBottomRight: {
    position: 'absolute',
    width: 18,
    height: 18,
    right: 0,
    bottom: 2,
    borderRightWidth: 3,
    borderBottomWidth: 3,
    borderColor: LiveTheme.gold,
  },
  authButtonsContainer: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  authButtonsMobile: {
    right: 10,
    bottom: 8,
  },
  loginBtn: {
    backgroundColor: LiveTheme.black,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 3,
  },
  loginBtnText: {
    color: LiveTheme.white,
    fontSize: 11,
    fontWeight: '700',
  },
  registerBtn: {
    backgroundColor: LiveTheme.gold,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 3,
  },
  registerBtnText: {
    color: LiveTheme.black,
    fontSize: 11,
    fontWeight: '700',
  },
  headlineBar: {
    backgroundColor: LiveTheme.gold,
    minHeight: 31,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  headlineText: {
    flex: 1,
    color: LiveTheme.black,
    fontSize: 10,
    fontWeight: '800',
  },
  dateText: {
    color: LiveTheme.black,
    fontSize: 9,
    fontWeight: '700',
  },
});