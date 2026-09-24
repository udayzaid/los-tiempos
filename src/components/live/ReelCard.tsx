import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  StyleSheet,
} from 'react-native';
import { ReelPlayer } from './ReelPlayer';
import { Ionicons } from '@expo/vector-icons';
import { ReelGetDto } from '@/services/api';

interface ReelCardProps {
  item: ReelGetDto;
}

export const ReelCard: React.FC<ReelCardProps> = ({ item }) => {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      {/* Tarjeta del Reel */}
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

        {/* Capa sobre la portada */}
        <View style={styles.overlay}>
          <View style={styles.playIconContainer}>
            <Ionicons name="play" size={24} color="#FFF" />
          </View>

          <Text style={styles.title} numberOfLines={2}>
            {item.titulo}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Modal del Reel */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          {/* Botón cerrar */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setModalVisible(false)}
          >
            <Ionicons name="close-circle" size={36} color="#FFF" />
          </TouchableOpacity>

          {/* Reproductor multiplataforma */}
          <ReelPlayer videoId={item.tiktokVideoId} />
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
});