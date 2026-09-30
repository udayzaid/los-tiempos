import { startLogin } from '@/components/auth/authService';
import { LiveTheme } from '@/constants/live-theme';
import { api } from '@/services/api';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

type AuthModalProps = {
  visible: boolean;
  onClose: () => void;
  initialRegister?: boolean;
};

export function AuthModal({
  visible,
  onClose,
  initialRegister = false,
}: AuthModalProps) {
  const [isRegister, setIsRegister] = useState(initialRegister);

  // Campos de registro
  const [nombre, setNombre] = useState('');
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfir, setPasswordConfir] = useState('');

  // Estados de carga y error
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setIsRegister(initialRegister);
      setErrorMessage(null);
    }
  }, [visible, initialRegister]);

  const resetForm = () => {
    setNombre('');
    setNombreUsuario('');
    setApellido('');
    setEmail('');
    setPassword('');
    setPasswordConfir('');
    setErrorMessage(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const toggleMode = () => {
    setIsRegister(!isRegister);
    setErrorMessage(null);
  };

  const handleSubmit = async () => {
    setErrorMessage(null);

    // =====================================================
    // LOGIN
    // =====================================================
    if (!isRegister) {
      setLoading(true);

      try {
        await startLogin();
      } catch (err: any) {
        setErrorMessage(
          err?.message ||
            'No se pudo iniciar el proceso de autenticación.'
        );
        setLoading(false);
      }

      return;
    }

    // =====================================================
    // VALIDACIÓN DEL REGISTRO
    // =====================================================
    if (
      !nombre ||
      !nombreUsuario ||
      !apellido ||
      !email ||
      !password ||
      !passwordConfir
    ) {
      setErrorMessage(
        'Por favor, completa todos los campos requeridos.'
      );
      return;
    }

    if (password !== passwordConfir) {
      setErrorMessage('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);

    try {
      // =====================================================
      // REGISTRAR USUARIO EN EL BACKEND
      // =====================================================
      await api.registerUser({
        Nombre: nombre,
        NombreUsuario: nombreUsuario,
        Apellido: apellido,
        Email: email,
        Password: password,
        PasswordConfir: passwordConfir,
      });

      // =====================================================
      // REGISTRO EXITOSO
      //
      // NO mostramos mensaje de "Cuenta creada".
      // Cerramos el modal y enviamos directamente
      // al sistema de autenticación.
      // =====================================================

      resetForm();
      onClose();
      setLoading(false);

      try {
        await startLogin();
      } catch (loginError: any) {
        console.error(
          'Error iniciando sesión después del registro:',
          loginError?.message || loginError
        );
      }

      return;
    } catch (err: any) {
      setErrorMessage(
        err?.message ||
          'Error de conexión con el servidor.'
      );
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalCard}>

              <Text style={styles.title}>
                {isRegister
                  ? 'Crear una Cuenta'
                  : 'Iniciar Sesión'}
              </Text>

              <Text style={styles.subtitle}>
                {isRegister
                  ? 'Únete para participar en la transmisión en vivo'
                  : 'Serás dirigido al sistema seguro de autenticación de Los Tiempos'}
              </Text>

              {errorMessage && (
                <Text style={styles.errorText}>
                  {errorMessage}
                </Text>
              )}

              {isRegister ? (
                <>
                  {/* NOMBRE */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>
                      Nombre
                    </Text>

                    <TextInput
                      style={styles.input}
                      placeholder="Tu nombre"
                      value={nombre}
                      onChangeText={setNombre}
                    />
                  </View>

                  {/* USUARIO */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>
                      Nombre de usuario
                    </Text>

                    <TextInput
                      style={styles.input}
                      value={nombreUsuario}
                      onChangeText={setNombreUsuario}
                      autoCapitalize="none"
                    />
                  </View>

                  {/* APELLIDO */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>
                      Apellido
                    </Text>

                    <TextInput
                      style={styles.input}
                      placeholder="Tu apellido"
                      value={apellido}
                      onChangeText={setApellido}
                    />
                  </View>

                  {/* EMAIL */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>
                      Correo electrónico
                    </Text>

                    <TextInput
                      style={styles.input}
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>

                  {/* CONTRASEÑA */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>
                      Contraseña
                    </Text>

                    <TextInput
                      style={styles.input}
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry
                    />
                  </View>

                  {/* CONFIRMAR CONTRASEÑA */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>
                      Confirmar contraseña
                    </Text>

                    <TextInput
                      style={styles.input}
                      value={passwordConfir}
                      onChangeText={setPasswordConfir}
                      secureTextEntry
                    />
                  </View>
                </>
              ) : (
                <View style={styles.loginInfo}>
                  <Text style={styles.loginInfoText}>
                    Tu correo y contraseña se solicitarán en la
                    pantalla segura de autenticación.
                  </Text>
                </View>
              )}

              {/* BOTÓN PRINCIPAL */}
              <TouchableOpacity
                style={[
                  styles.submitBtn,
                  loading && styles.submitBtnDisabled,
                ]}
                onPress={handleSubmit}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.submitBtnText}>
                    {isRegister
                      ? 'Registrarme'
                      : 'Continuar con el inicio de sesión'}
                  </Text>
                )}
              </TouchableOpacity>

              {/* CAMBIAR ENTRE LOGIN Y REGISTRO */}
              <TouchableOpacity
                onPress={toggleMode}
                style={styles.switchContainer}
              >
                <Text style={styles.switchText}>
                  {isRegister
                    ? '¿Ya tienes cuenta? '
                    : '¿Aún no tienes cuenta? '}

                  <Text style={styles.switchLink}>
                    {isRegister
                      ? 'Inicia Sesión'
                      : 'Regístrate aquí'}
                  </Text>
                </Text>
              </TouchableOpacity>

              {/* CANCELAR */}
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={handleClose}
              >
                <Text style={styles.closeBtnText}>
                  Cancelar
                </Text>
              </TouchableOpacity>

            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  modalCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: LiveTheme.offWhite,
    borderRadius: 12,
    padding: 24,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },

  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: LiveTheme.black,
    marginBottom: 4,
  },

  subtitle: {
    fontSize: 13,
    color: LiveTheme.textMuted,
    marginBottom: 16,
  },

  errorText: {
    color: '#D32F2F',
    backgroundColor: '#FFEBEE',
    padding: 8,
    borderRadius: 4,
    marginBottom: 12,
    fontSize: 12,
  },

  inputGroup: {
    marginBottom: 12,
  },

  label: {
    fontSize: 12,
    fontWeight: '600',
    color: LiveTheme.black,
    marginBottom: 4,
  },

  input: {
    borderWidth: 1,
    borderColor: LiveTheme.chatBorder,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    fontSize: 14,
  },

  loginInfo: {
    backgroundColor: '#F5F5F5',
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
  },

  loginInfoText: {
    color: LiveTheme.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },

  submitBtn: {
    width: '100%',
    backgroundColor: LiveTheme.gold,
    paddingVertical: 11,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },

  submitBtnDisabled: {
    opacity: 0.6,
  },

  submitBtnText: {
    color: LiveTheme.black,
    fontWeight: 'bold',
    fontSize: 14,
  },

  switchContainer: {
    marginTop: 16,
    alignItems: 'center',
  },

  switchText: {
    fontSize: 12,
    color: LiveTheme.textMuted,
  },

  switchLink: {
    fontWeight: 'bold',
  },

  closeBtn: {
    marginTop: 12,
    alignItems: 'center',
  },

  closeBtnText: {
    fontSize: 12,
    color: LiveTheme.textMuted,
  },
});