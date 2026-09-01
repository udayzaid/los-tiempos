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

export function AuthModal({ visible, onClose, initialRegister = false }: AuthModalProps) {
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
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setIsRegister(initialRegister);
      setErrorMessage(null);
      setSuccessMessage(null);
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

    // LOGIN: el backend maneja las credenciales mediante OAuth/OpenID Connect.
    // No enviamos email/password directamente desde React.
    if (!isRegister) {
      setLoading(true);
      try {
        await startLogin();
      } catch (err: any) {
        setErrorMessage(err?.message || 'No se pudo iniciar el proceso de autenticación.');
        setLoading(false);
      }
      return;
    }

    // REGISTRO: conserva el endpoint de registro existente.
    if (
      !nombre ||
      !nombreUsuario ||
      !email ||
      !password ||
      !passwordConfir
            ) {
            setErrorMessage('Por favor, completa todos los campos requeridos.');
          return;
       }

    if (password !== passwordConfir) {
      setErrorMessage('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);

    try {
      await api.registerUser({
    Nombre: nombre,
     NombreUsuario: nombreUsuario,
    Apellido: apellido,
      Email: email,
     Password: password,
     PasswordConfir: passwordConfir,
      });
      setSuccessMessage('¡Cuenta creada con éxito!');
      setTimeout(() => {
        setIsRegister(false);
      }, 1200);
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
                  : 'Serás dirigido al sistema seguro de autenticación de Los Tiempos'}
              </Text>

              {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
              {successMessage && <Text style={styles.successText}>{successMessage}</Text>}

              {isRegister ? (
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
                     <Text style={styles.label}>Nombre de usuario</Text>
                                  <TextInput
                             style={styles.input}
                             //placeholder="Ej. zaid123"
                        value={nombreUsuario}
                                   onChangeText={setNombreUsuario}
                           autoCapitalize="none"
                                                   />
                                          </View>

                  <View style={styles.inputGroup}>
                    
                    <Text style={styles.label}>Apellido </Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Tu apellido"
                      value={apellido}
                      onChangeText={setApellido}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Correo electrónico</Text>
                    <TextInput
                      style={styles.input}
                     // placeholder="ejemplo@correo.com"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Contraseña</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="     "
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Confirmar Contraseña</Text>
                    <TextInput
                      style={styles.input}
                     // placeholder="••••••••"
                      value={passwordConfir}
                      onChangeText={setPasswordConfir}
                      secureTextEntry
                    />
                  </View>
                </>
              ) : (
                <View style={styles.loginInfo}>
                  <Text style={styles.loginInfoText}>
                    Tu correo y contraseña se solicitarán en la pantalla segura de autenticación.
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.submitBtnText}>
                    {isRegister ? 'Registrarme' : 'Continuar con el inicio de sesión'}
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
  backgroundColor: LiveTheme.gold,
  paddingVertical: 9,
  borderRadius: 6,
  alignItems: 'center',
  marginTop: 8,
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