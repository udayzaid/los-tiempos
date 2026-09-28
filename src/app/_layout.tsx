import { Stack } from 'expo-router';
import { AuthProvider } from '../context/AuthContext';
import { LiveHubProvider } from '../context/LiveHubContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <LiveHubProvider>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="index" />
        </Stack>
      </LiveHubProvider>
    </AuthProvider>
  );
}
