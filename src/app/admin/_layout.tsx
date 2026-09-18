import { Redirect, Stack } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useAuth } from '@/context/AuthContext';

export default function AdminLayout() {
  const { isAuthenticated, loading, role } = useAuth();

  // Mientras AuthContext verifica la sesión, no mostramos el dashboard.
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" />
      </View>
    );
  }

  // La ruta /admin requiere una sesión autenticada con rol Admin.
  // Esto evita que un usuario normal pueda entrar escribiendo /admin.
  if (!isAuthenticated || role?.trim().toLowerCase() !== 'admin') {
    return <Redirect href="/" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
