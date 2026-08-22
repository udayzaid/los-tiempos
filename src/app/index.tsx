import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AuthModal } from '@/components/auth/AuthModal';
import { LiveChat } from '@/components/live/LiveChat';
import { LiveDescription } from '@/components/live/LiveDescription';
import { LiveHeader } from '@/components/live/LiveHeader';
import { PromoCardsRow } from '@/components/live/PromoCardsRow';
import { SiteFooter } from '@/components/live/SiteFooter';
import { VideoPlayer } from '@/components/live/VideoPlayer';
import { api } from '@/services/api';

export default function LiveScreen() {
  const [mensajeApi, setMensajeApi] = useState<string>('Cargando conexion con la api...');
  const [authVisible, setAuthVisible] = useState<boolean>(false);
  const [initialRegisterMode, setInitialRegisterMode] = useState<boolean>(false);
  // Apartado para el estado del stream url
  const [StreamUrl, setStreamUrl] = useState<string>(''); 

  useEffect(() => {
    api.getPrimer()
      .then((data) => setMensajeApi(data))
      .catch(() => setMensajeApi('Error al conectar con el servidor'));

    api.getStream()
      .then((data) => {
        console.log('📌 LINK DESDE LA API:', data);
        
        // Si la API devuelve el objeto directo o el string extraído
        const urlFinal = typeof data === 'string' ? data : data?.link;

        if (urlFinal) {
          setStreamUrl(urlFinal);
        }
      })
      .catch((err) => console.error('Error cargando Stream:', err));
  }, []);

  const handleOpenLogin = () => {
    setInitialRegisterMode(false); // Fuerza pestaña Iniciar Sesión
    setAuthVisible(true);
  };

  const handleOpenRegister = () => {
    setInitialRegisterMode(true); // Fuerza pestaña Registrarse
    setAuthVisible(true);
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.scrollContent}>
      <LiveHeader
        headline="Los Tiempos, señal en vivo - Artemis II retorna, Trump y los convenios, Liga boliviana y las ultimas posiciones en las tablas"
        onOpenLogin={handleOpenLogin}
        onOpenRegister={handleOpenRegister}
      />

      <View style={styles.apiBanner}>
        <Text style={styles.apiText}>Estado Backend: {mensajeApi}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.videoArea}>
          {/* AHORA SÍ USA LA URL DE LA API */}
          <VideoPlayer videoUrl={StreamUrl || 'https://youtu.be/2FrvoWyV9o8'} />
        </View>
        <View style={styles.chatArea}>
          <LiveChat />
        </View>
      </View>

      <LiveDescription
        title="Transmisión en vivo 13/04/2026"
        body="sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat."
      />

      <PromoCardsRow />
      <SiteFooter />

      <AuthModal
        visible={authVisible}
        onClose={() => setAuthVisible(false)}
        initialRegister={initialRegisterMode}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
  },
  apiBanner: {
    backgroundColor: '#E3F2FD',
    padding: 8,
    marginHorizontal: 12,
    marginTop: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  apiText: {
    color: '#0D47A1',
    fontWeight: 'bold',
    fontSize: 12,
  },
  content: {
    padding: 12,
    gap: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
  },
  videoArea: {
    flex: 3,
    minWidth: 320,
  },
  chatArea: {
    flex: 1,
    minWidth: 300,
  },
});