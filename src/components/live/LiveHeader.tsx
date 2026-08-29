import { Image, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { LiveTheme } from '@/constants/live-theme';

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
      <View style={[styles.topRow, isMobile && styles.topRowMobile]}>
        <View style={[styles.brandFrame, isMobile && styles.brandFrameMobile]} pointerEvents="none">
          <View style={styles.cornerTopLeft} />
          <Image
            source={require('../../../imagenes/logo 1 (1).png')}
            style={[styles.logo, isMobile && styles.logoMobile]}
            resizeMode="contain"
          />
          <View style={styles.cornerBottomRight} />
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
        {!isMobile && <Text style={styles.dateText}>Martes, 30 de Noviembre de 2026</Text>}
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
    minHeight: 116,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E7E0D2',
  },
  topRowMobile: {
    minHeight: 104,
    paddingHorizontal: 12,
    paddingBottom: 42,
  },
  brandFrame: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 280,
    minHeight: 82,
    paddingHorizontal: 26,
  },
  brandFrameMobile: {
    minWidth: 210,
    minHeight: 68,
    paddingHorizontal: 18,
  },
  logo: {
    width: 245,
    height: 70,
  },
  logoMobile: {
    width: 190,
    height: 56,
  },
  cornerTopLeft: {
    position: 'absolute',
    width: 18,
    height: 18,
    left: 0,
    top: 1,
    borderLeftWidth: 3,
    borderTopWidth: 3,
    borderColor: LiveTheme.gold,
  },
  cornerBottomRight: {
    position: 'absolute',
    width: 18,
    height: 18,
    right: 0,
    bottom: 1,
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
    right: 12,
    left: 12,
    bottom: 9,
    justifyContent: 'flex-end',
  },
  loginBtn: {
    backgroundColor: LiveTheme.black,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 3,
  },
  loginBtnText: {
    color: LiveTheme.white,
    fontSize: 11,
    fontWeight: '800',
  },
  registerBtn: {
    backgroundColor: LiveTheme.gold,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 3,
  },
  registerBtnText: {
    color: LiveTheme.black,
    fontSize: 11,
    fontWeight: '800',
  },
  headlineBar: {
    backgroundColor: LiveTheme.gold,
    minHeight: 34,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
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