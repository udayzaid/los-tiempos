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

export function AuthModal({ visible, onClose, initialRegister = false }: AuthModalProps) {
  const [isRegister, setIsRegister] = useState(initialRegister);

  // Campos de formulario
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfir, setPasswordConfir] = useState('');

  // Estados de carga y error
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 🔹 SOLUCIÓN: Sincroniza el estado 'isRegister' cada vez que el modal abre o cambia la prop
  useEffect(() => {
    if (visible) {
      setIsRegister(initialRegister);
    }
  }, [visible, initialRegister]);

  const resetForm = () => {
    setNombre('');
    setApellido('');
    setEmail('');
    setPassword('');
    setPasswordConfir('');
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const toggleMode = () => {
    setIsRegister(!isRegister);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleSubmit = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (isRegister) {
      if (!nombre || !email || !password || !passwordConfir) {
        setErrorMessage('Por favor, completa todos los campos requeridos.');
        return;
      }
      if (password !== passwordConfir) {
        setErrorMessage('Las contraseñas no coinciden.');
        return;
      }
    } else {
      if (!email || !password) {
        setErrorMessage('Por favor, ingresa tu correo y contraseña.');
        return;
      }
    }

    setLoading(true);

    try {
      if (isRegister) {
        await api.singIn({
          nombre,
          apellido: apellido || nombre,
          email,
          password,
          passwordConfir,
        });
        setSuccessMessage('¡Cuenta creada con éxito!');
        setTimeout(() => {
          setIsRegister(false);
        }, 1200);
      } else {
        await api.singIn({
          nombre: '',
          apellido: '',
          email,
          password,
          passwordConfir: '',
        });
        setSuccessMessage('¡Inicio de sesión exitoso!');
        setTimeout(() => {
          handleClose();
        }, 1200);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalCard}>
              <Text style={styles.title}>
                {isRegister ? 'Crear una Cuenta' : 'Iniciar Sesión'}
              </Text>
              <Text style={styles.subtitle}>
                {isRegister
                  ? 'Únete para participar en la transmisión en vivo'
                  : 'Ingresa a tu cuenta para comentar'}
              </Text>

              {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
              {successMessage && <Text style={styles.successText}>{successMessage}</Text>}

              {/* Formulario de Registro */}
              {isRegister && (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Nombre</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Tu nombre"
                      value={nombre}
                      onChangeText={setNombre}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Apellido (Opcional)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Tu apellido"
                      value={apellido}
                      onChangeText={setApellido}
                    />
                  </View>
                </>
              )}

              {/* Correo */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Correo electrónico</Text>
                <TextInput
                  style={styles.input}
                  placeholder="ejemplo@correo.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              {/* Contraseña */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Contraseña</Text>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>

              {/* Confirmar Contraseña (Solo en registro) */}
              {isRegister && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Confirmar Contraseña</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    value={passwordConfir}
                    onChangeText={setPasswordConfir}
                    secureTextEntry
                  />
                </View>
              )}

              {/* Botón Principal */}
              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.submitBtnText}>
                    {isRegister ? 'Registrarme' : 'Entrar'}
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity onPress={toggleMode} style={styles.switchContainer}>
                <Text style={styles.switchText}>
                  {isRegister ? '¿Ya tienes cuenta? ' : '¿Aún no tienes cuenta? '}
                  <Text style={styles.switchLink}>
                    {isRegister ? 'Inicia Sesión' : 'Regístrate aquí'}
                  </Text>
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
                <Text style={styles.closeBtnText}>Cancelar</Text>
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
    zIndex: 999,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: LiveTheme.offWhite,
    borderRadius: 12,
    padding: 24,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
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
  successText: {
    color: '#2E7D32',
    backgroundColor: '#E8F5E9',
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
  submitBtn: {
    backgroundColor: LiveTheme.black,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  submitBtnText: {
    color: LiveTheme.offWhite,
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
    color: LiveTheme.black,
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