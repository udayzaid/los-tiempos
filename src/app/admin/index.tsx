import { VideoPlayer } from '@/components/live/VideoPlayer';
import { useState } from 'react';
import {
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

// DATOS DE PRUEBA (MOCK DATA) - Mientras tu amigo conecta la BD
const MOCK_COMMENTS = [
  { id: '1', user: 'Carlos M.', text: 'Excelente transmisión, saludos desde Cochabamba', status: 'OK' },
  { id: '2', user: 'Spammer123', text: 'GANA DINERO FÁCIL EN ESTE LINK DE APUESTAS!!!', status: 'OK' },
  { id: '3', user: 'María L.', text: '¿A qué hora empieza la rueda de prensa?', status: 'OK' },
  { id: '4', user: 'Troll99', text: 'Mensaje ofensivo de prueba para moderar', status: 'OK' },
];

export default function AdminScreen() {
  const [comments, setComments] = useState(MOCK_COMMENTS);
  const [streamUrlInput, setStreamUrlInput] = useState('');
  const [activeStreamUrl, setActiveStreamUrl] = useState('https://youtu.be/2FrvoWyV9o8');
  
  // Métricas de prueba
  const [viewersCount, setViewersCount] = useState(1248);

  // Función para simular la eliminación de un comentario ofensivo
  const handleDeleteComment = (id: string) => {
    setComments(prev => prev.filter(comment => comment.id !== id));
  };

  // Función para simular el cambio del video en vivo
  const handleUpdateStream = () => {
    if (streamUrlInput.trim()) {
      setActiveStreamUrl(streamUrlInput.trim());
      setStreamUrlInput('');
      alert('Transmisión actualizada correctamente.');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      
      {/* 🔴 ENCABEZADO DE PANEL DE CONTROL */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Panel de Control y Moderación</Text>
          <Text style={styles.headerSubtitle}>Administración en tiempo real de Los Tiempos</Text>
        </View>
        <View style={styles.badgeLive}>
          <View style={styles.redDot} />
          <Text style={styles.liveText}>MODO EN VIVO</Text>
        </View>
      </View>

      {/* 📊 BARRA DE MÉTRICAS */}
      <View style={styles.metricsRow}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Espectadores Activos</Text>
          <Text style={styles.metricValue}>{viewersCount.toLocaleString()}</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Comentarios Totales</Text>
          <Text style={styles.metricValue}>{comments.length}</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Estado del Servidor</Text>
          <Text style={[styles.metricValue, { color: '#2E7D32' }]}>Online (Azure)</Text>
        </View>
      </View>

      {/* ⚙️ SECCIÓN 1: CAMBIAR / EMITIR TRANSMISIÓN */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>🎥 Gestionar Señal de Video</Text>
        <Text style={styles.label}>URL o ID de Transmisión en Vivo (YouTube / RTMP):</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.textInput}
            placeholder="Ejemplo: https://www.youtube.com/watch?v=..."
            value={streamUrlInput}
            onChangeText={setStreamUrlInput}
          />
          <TouchableOpacity style={styles.btnPrimary} onPress={handleUpdateStream}>
            <Text style={styles.btnPrimaryText}>Actualizar En Vivo</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 🖥️ SECCIÓN 2: VISUALIZACIÓN Y MODERACIÓN DE CHAT */}
      <View style={styles.mainGrid}>
        
        {/* Monitor del Moderador (Visualización del video) */}
        <View style={styles.videoMonitorArea}>
          <Text style={styles.sectionTitle}>Monitor del Moderador</Text>
          <View style={styles.playerWrapper}>
            <VideoPlayer videoUrl={activeStreamUrl} />
          </View>
        </View>

        {/* Panel de Comentarios para eliminar malos mensajes */}
        <View style={styles.chatModerationArea}>
          <Text style={styles.sectionTitle}>Moderación de Chat</Text>
          <FlatList
            data={comments}
            keyExtractor={item => item.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View style={styles.commentRow}>
                <View style={styles.commentInfo}>
                  <Text style={styles.commentUser}>{item.user}</Text>
                  <Text style={styles.commentText}>{item.text}</Text>
                </View>
                <TouchableOpacity
                  style={styles.btnDelete}
                  onPress={() => handleDeleteComment(item.id)}
                >
                  <Text style={styles.btnDeleteText}>Eliminar</Text>
                </TouchableOpacity>
              </View>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No hay comentarios reportados o activos.</Text>
            }
          />
        </View>

      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6F8' },
  scrollContent: { padding: 20 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1A1A1A' },
  headerSubtitle: { fontSize: 12, color: '#666' },
  badgeLive: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFEBEE', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  redDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#D32F2F', marginRight: 6 },
  liveText: { color: '#D32F2F', fontWeight: 'bold', fontSize: 11 },
  metricsRow: { flexDirection: 'row', gap: 12, marginBottom: 20, flexWrap: 'wrap' },
  metricCard: { flex: 1, minWidth: 150, backgroundColor: '#FFFFFF', padding: 16, borderRadius: 8, borderWidth: 1, borderColor: '#E0E0E0' },
  metricLabel: { fontSize: 12, color: '#666', marginBottom: 4 },
  metricValue: { fontSize: 20, fontWeight: 'bold', color: '#1A1A1A' },
  sectionCard: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 8, borderWidth: 1, borderColor: '#E0E0E0', marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 12 },
  label: { fontSize: 12, color: '#444', marginBottom: 6 },
  inputRow: { flexDirection: 'row', gap: 10 },
  textInput: { flex: 1, borderWidth: 1, borderColor: '#CCC', borderRadius: 6, paddingHorizontal: 12, height: 40, backgroundColor: '#FAFAFA' },
  btnPrimary: { backgroundColor: '#000000', paddingHorizontal: 16, justifyContent: 'center', borderRadius: 6 },
  btnPrimaryText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 },
  mainGrid: { flexDirection: 'row', gap: 16, flexWrap: 'wrap' },
  videoMonitorArea: { flex: 2, minWidth: 320, backgroundColor: '#FFFFFF', padding: 16, borderRadius: 8, borderWidth: 1, borderColor: '#E0E0E0' },
  playerWrapper: { marginTop: 8 },
  chatModerationArea: { flex: 1, minWidth: 300, backgroundColor: '#FFFFFF', padding: 16, borderRadius: 8, borderWidth: 1, borderColor: '#E0E0E0' },
  commentRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  commentInfo: { flex: 1, marginRight: 8 },
  commentUser: { fontSize: 12, fontWeight: 'bold', color: '#333' },
  commentText: { fontSize: 13, color: '#555' },
  btnDelete: { backgroundColor: '#FFCDD2', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  btnDeleteText: { color: '#B71C1C', fontSize: 11, fontWeight: 'bold' },
  emptyText: { textAlign: 'center', color: '#888', marginTop: 12, fontSize: 12 },
});