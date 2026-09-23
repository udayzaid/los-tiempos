import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { ReelGetDto } from '@/services/api'; // Ajusta la ruta a tu api.ts

interface ReelCardProps {
  item: ReelGetDto;
}

const { width, height } = Dimensions.get('window');

export const ReelCard: React.FC<ReelCardProps> = ({ item }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [loadingWebView, setLoadingWebView] = useState(true);

  // URL del reproductor embebido de TikTok
  const embedUrl = `https://www.tiktok.com/embed/v2/${item.tiktokVideoId}`;

  return (
    <>
      {/* Tarjeta del Reel en la lista */}
      <TouchableOpacity
        style={styles.cardContainer}
        activeOpacity={0.85}
        onPress={() => setModalVisible(true)}
      >
        <Image
          source={{ uri: item.portadaUrl }}
          style={styles.thumbnail}
          resizeMode="cover"
        />
        
        {/* Capa oscura con sombra para resaltar el texto e icono */}
        <View style={styles.overlay}>
          <View style={styles.playIconContainer}>
            <Ionicons name="play" size={24} color="#FFF" />
          </View>
          <Text style={styles.title} numberOfLines={2}>
            {item.titulo}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Modal con el Reproductor de TikTok */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          {/* Botón para cerrar el Modal */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setModalVisible(false)}
          >
            <Ionicons name="close-circle" size={36} color="#FFF" />
          </TouchableOpacity>

          {/* Indicador de carga mientras renderiza el iframe */}
          {loadingWebView && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FF004F" />
            </View>
          )}

          {/* WebView reproduciendo TikTok */}
          <WebView
            source={{ uri: embedUrl }}
            style={styles.webview}
            onLoadEnd={() => setLoadingWebView(false)}
            allowsInlineMediaPlayback
            javaScriptEnabled
            domStorageEnabled
          />
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: 160,
    height: 260,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1E1E1E',
    marginRight: 12,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    padding: 10,
    justifyContent: 'space-between',
  },
  playIconContainer: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 6,
    borderRadius: 20,
  },
  title: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  closeButton: {
    position: 'absolute',
    top: 45,
    right: 20,
    zIndex: 10,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    zIndex: 5,
  },
  webview: {
    flex: 1,
    backgroundColor: '#000',
    marginTop: 40,
  },
});