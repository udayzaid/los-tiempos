import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // <-- Esto oculta la barra superior por defecto de Expo
      }}
    >
      <Stack.Screen name="index" />
    </Stack>
  );
}