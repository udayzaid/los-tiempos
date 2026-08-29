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
        <View style={[styles.buildingFrame, isMobile && styles.buildingFrameMobile]} pointerEvents="none">
          <Image
            source={require('../../../imagenes/logo 2.png')}
            style={styles.buildingLogo}
            resizeMode="contain"
          />
        </View>

        <View style={[styles.brandFrame, isMobile && styles.brandFrameMobile]} pointerEvents="none">
          <Image
            source={require('../../../imagenes/logo 1 (1).png')}
            style={[styles.logo, isMobile && styles.logoMobile]}
            resizeMode="contain"
          />
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
    height: 142,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: LiveTheme.border,
  },
  topRowMobile: {
    height: 112,
    paddingHorizontal: 10,
    paddingBottom: 30,
  },
  buildingFrame: {
    position: 'absolute',
    left: 15,
    top: 0,
    width: 446,
    height: 142,
    justifyContent: 'center',
    alignItems: 'flex-start',
    overflow: 'hidden',
  },
  buildingFrameMobile: {
    left: 8,
    width: 180,
    height: 80,
  },
  buildingLogo: {
    width: 180,
    height: 72,
  },
  brandFrame: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 365,
    height: 128,
  },
  brandFrameMobile: {
    width: 250,
    height: 88,
  },
  logo: {
    width: 365,
    height: 128,
  },
  logoMobile: {
    width: 250,
    height: 88,
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
    left: 10,
    bottom: 7,
    justifyContent: 'flex-end',
  },
  loginBtn: {
    backgroundColor: LiveTheme.black,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: LiveTheme.radius.sm,
  },
  loginBtnText: {
    color: LiveTheme.white,
    fontSize: 11,
    fontWeight: '800',
  },
  registerBtn: {
    backgroundColor: LiveTheme.gold,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: LiveTheme.radius.sm,
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
