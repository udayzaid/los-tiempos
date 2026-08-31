import { LiveTheme } from '@/constants/live-theme';
import { Ionicons } from '@expo/vector-icons';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';

type Props = {
  headline: string;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
};

export function LiveHeader({
  headline,
  onOpenLogin,
  onOpenRegister,
}: Props) {
  const { width } = useWindowDimensions();

  const isMobile = width < 700;

  return (
    <View style={styles.wrapper}>

      {/* HEADER PRINCIPAL */}
      <View style={[styles.topRow, isMobile && styles.topRowMobile]}>

        {/* EDIFICIO */}
        <View
          style={[
            styles.buildingFrame,
            isMobile && styles.buildingFrameMobile,
          ]}
          pointerEvents="none"
        >
          <Image
            source={require('../../../imagenes/logo 2.1.png')}
            style={styles.buildingLogo}
            resizeMode="contain"
          />
        </View>

        {/* LOGO LOS TIEMPOS */}
        <View
          style={[
            styles.brandFrame,
            isMobile && styles.brandFrameMobile,
          ]}
          pointerEvents="none"
        >
          <Image
            source={require('../../../imagenes/logo 1 (1).png')}
            style={[
              styles.logo,
              isMobile && styles.logoMobile,
            ]}
            resizeMode="contain"
          />
        </View>

        {/* BOTONES */}
        <View
          style={[
            styles.authButtonsContainer,
            isMobile && styles.authButtonsMobile,
          ]}
        >

          {/* REGISTRARSE */}
          <TouchableOpacity
            style={styles.registerBtn}
            onPress={onOpenRegister}
            activeOpacity={0.8}
          >
            <Text style={styles.registerBtnText}>
              Registrarse
            </Text>
          </TouchableOpacity>

          {/* INICIAR SESIÓN */}
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={onOpenLogin}
            activeOpacity={0.8}
          >
            <Ionicons
              name="person-circle-outline"
              size={23}
              color={LiveTheme.black}
            />

            <Text style={styles.loginBtnText}>
              Iniciar sesión
            </Text>
          </TouchableOpacity>

        </View>

      </View>

      {/* BARRA DE NOTICIAS */}
      <View style={styles.headlineBar}>

        <Text
          style={styles.headlineText}
          numberOfLines={1}
        >
          {headline}
        </Text>

        {!isMobile && (
          <Text style={styles.dateText}>
            Martes, 30 de Noviembre de 2026
          </Text>
        )}

      </View>

    </View>
  );
}

const styles = StyleSheet.create({

  /* =========================
     CONTENEDOR
  ========================= */

  wrapper: {
    width: '100%',
    backgroundColor: LiveTheme.offWhite,
  },

  /* =========================
     HEADER PRINCIPAL
  ========================= */

  topRow: {
    width: '100%',
    height: 115,

    position: 'relative',

    alignItems: 'center',
    justifyContent: 'center',

    paddingHorizontal: 20,

    borderBottomWidth: 1,
    borderBottomColor: LiveTheme.border,
  },

  /* =========================
     EDIFICIO
  ========================= */

  buildingFrame: {
    position: 'absolute',

    left: 0,
    top: 0,

    width: 350,
    height: 115,

    justifyContent: 'center',
    alignItems: 'flex-start',

    overflow: 'hidden',
  },

  buildingLogo: {
    width: 350,
    height: 120,
  },

  /* =========================
     LOGO CENTRAL
  ========================= */

  brandFrame: {
    width: 350,
    height: 115,

    justifyContent: 'center',
    alignItems: 'center',
  },

  logo: {
    width: 350,
    height: 115,
  },

  /* =========================
     BOTONES
  ========================= */

  authButtonsContainer: {
    position: 'absolute',

    right: 20,

    top: 0,
    bottom: 0,

    flexDirection: 'row',

    alignItems: 'center',

    gap: 8,
  },

  /* =========================
     REGISTRARSE
  ========================= */

  registerBtn: {
    height: 48,

    paddingHorizontal: 20,

    backgroundColor: LiveTheme.gold,

    borderRadius: 10,

    justifyContent: 'center',
    alignItems: 'center',
  },

  registerBtnText: {
    color: LiveTheme.black,

    fontSize: 17,
    fontWeight: '700',
  },

  /* =========================
     INICIAR SESIÓN
  ========================= */

  loginBtn: {
    height: 48,

    paddingHorizontal: 20,

    backgroundColor: LiveTheme.white,

    borderWidth: 1,
    borderColor: '#D9D9D9',

    borderRadius: 10,

    flexDirection: 'row',

    alignItems: 'center',
    justifyContent: 'center',

    gap: 10,
  },

  loginBtnText: {
    color: LiveTheme.black,

    fontSize: 17,
    fontWeight: '500',
  },

  /* =========================
     BARRA DE NOTICIAS
  ========================= */

  headlineBar: {
    width: '100%',
    height: 34,

    backgroundColor: LiveTheme.gold,

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

  /* =========================
     MOBILE
  ========================= */

  topRowMobile: {
    height: 110,

    paddingHorizontal: 10,
  },

  buildingFrameMobile: {
    left: 0,
    top: 0,

    width: 180,
    height: 90,
  },

  brandFrameMobile: {
    width: 210,
    height: 75,
  },

  logoMobile: {
    width: 210,
    height: 75,
  },

  authButtonsMobile: {
    right: 10,
    left: 10,

    bottom: 8,
    top: 'auto',

    justifyContent: 'flex-end',
  },

});