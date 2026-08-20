import { LiveTheme } from '@/constants/live-theme';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// 1. Cambiamos la interfaz Props para eliminar 'date' y pedir las dos funciones
type Props = {
  headline: string;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
};
 
export function LiveHeader({ headline, onOpenLogin, onOpenRegister }: Props) {
  return (
    <View>
      <View style={styles.topRow}>
        <View style={styles.logoPlaceholder}>
          <Text style={styles.logoPlaceholderText}>LOGO</Text>
        </View>
        <Text style={styles.brand}>Los Tiempos</Text>
      </View>

      <View style={styles.headlineBar}>
        <Text style={styles.headlineText} numberOfLines={1}>
          {headline}
        </Text>

        {/* 2. Reemplazamos la fecha por los dos botones */}
        <View style={styles.authButtonsContainer}>
          <TouchableOpacity style={styles.loginBtn} onPress={onOpenLogin}>
            <Text style={styles.loginBtnText}>Iniciar Sesión</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.registerBtn} onPress={onOpenRegister}>
            <Text style={styles.registerBtnText}>Registrarse</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: LiveTheme.offWhite,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  logoPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: LiveTheme.chatBorder,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFEAE0',
  },
  logoPlaceholderText: {
    fontSize: 10,
    color: LiveTheme.textMuted,
    fontWeight: '600',
  },
  brand: {
    fontSize: 26,
    fontFamily: 'serif',
    color: LiveTheme.black,
  },
  headlineBar: {
    backgroundColor: LiveTheme.gold,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  headlineText: {
    color: LiveTheme.black,
    fontWeight: '700',
    fontSize: 13,
    flexShrink: 1,
    marginRight: 12,
  },
  authButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loginBtn: {
    backgroundColor: LiveTheme.black,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  loginBtnText: {
    color: LiveTheme.offWhite,
    fontSize: 12,
    fontWeight: '700',
  },
  registerBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: LiveTheme.black,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 4,
  },
  registerBtnText: {
    color: LiveTheme.black,
    fontSize: 12,
    fontWeight: '700',
  },
});