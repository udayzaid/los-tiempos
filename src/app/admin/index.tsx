import { VideoPlayer } from '@/components/live/VideoPlayer';
import { LiveTheme } from '@/constants/live-theme';
import { api } from '@/services/api';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

type Feedback = {
  type: 'success' | 'error' | 'info' | null;
  message: string;
};

type AdminSection = 'dashboard' | 'articles' | 'live' | 'settings';

type ActiveStream = {
  titulo?: string;
  descripcion?: string;
};

// DATOS DE PRUEBA (MOCK DATA) - Mientras tu amigo conecta la BD
const MOCK_COMMENTS = [
  { id: '1', user: 'Carlos M.', text: 'Excelente transmisión, saludos desde Cochabamba' },
  { id: '2', user: 'Spammer123', text: 'GANA DINERO FÁCIL EN ESTE LINK DE APUESTAS!!!' },
  { id: '3', user: 'María L.', text: '¿A qué hora empieza la rueda de prensa?' },
  { id: '4', user: 'Troll99', text: 'Mensaje ofensivo de prueba para moderar' },
];

export default function index() {
  const [comments, setComments] = useState(MOCK_COMMENTS);
  const [activeSection, setActiveSection] = useState<AdminSection>('live');

  const [activeStream, setActiveStream] = useState<ActiveStream | null>(null);
  const [activeStreamUrl, setActiveStreamUrl] = useState('');

  // Campos enviados al backend como CrearTrasmicionDto.
  const [streamTitle, setStreamTitle] = useState('');
  const [streamDescription, setStreamDescription] = useState('');

  const [loadingStream, setLoadingStream] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [stopping, setStopping] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>({ type: null, message: '' });

  // Métrica de prueba mientras la API de espectadores no esté conectada.
  const [viewersCount] = useState(1248);

  const showFeedback = (type: Feedback['type'], message: string) => {
    setFeedback({ type, message });
  };

  // GET /api/Stream -> obtiene la transmisión activa.
  // 1. Cargar estado de la transmisión al entrar o refrescar
const loadActiveStream = useCallback(async () => {
  setLoadingStream(true);
  try {
    const data = await api.getStream();

    // Verificamos si realmente hay una transmisión válida y activa
    if (data && data.hasActiveStream) {
      setActiveStream(data.raw);
      setflexDirection: 'row'(data.url);
    } else {
      // Si la API responde vacía o sin stream activo, limpiamos la UI
      setActiveStream(null);
      setActiveStreamUrl('');
    }
  } catch (error) {
    setActiveStream(null);
    setActiveStreamUrl('');
  } finally {
    setLoadingStream(false);
  }
}, []);

  useEffect(() => {
    loadActiveStream();





    
  }, [loadActiveStream]);

  // POST /api/Stream -> agrega/publica la transmisión.
  // El contrato real del backend es CrearTrasmicionDto: { titulo, descripcion }.
  const handlePublishStream = async () => {
  const title = streamTitle.trim();
  const description = streamDescription.trim();

  // Validar título
  if (!title) {
    showFeedback(
      'error',
      'Ingresa un título para la transmisión.',
    );
    return;
  }

  if (hasActiveStream) {
    showFeedback(
      'error',
      'Ya existe un stream activo. Termina el live actual antes de crear uno nuevo.',
    );
    return;
  }

  setPublishing(true);

  setFeedback({
    type: null,
    message: '',
  });

  try {
    console.log('=================================');
    console.log('PUBLICANDO TRANSMISIÓN');
    console.log('Título:', title);
    console.log('Descripción:', description);
    console.log('=================================');

    const createdStream = await api.postStream({
      titulo: title,
      descripcion: description || title,
    });

    const createdUrl =
      typeof createdStream === 'string'
        ? createdStream
        : createdStream?.link || createdStream?.url || createdStream?.embedUrl;

    setActiveStream({
      titulo: title,
      descripcion: description || title,
    });

    if (createdUrl) {
      setActiveStreamUrl(createdUrl);
    } else {
      await loadActiveStream();
    }

    setStreamTitle('');
    setStreamDescription('');

    showFeedback(
      'success',
      'Transmisión publicada correctamente.',
    );
  } catch (err: any) {
    console.log('=================================');
    console.log('ERROR AL PUBLICAR');
    console.log(err);
    console.log('=================================');

    showFeedback(
      'error',
      err?.message ||
        'Error al publicar la transmisión.',
    );
  } finally {
    setPublishing(false);
  }
};

  // DELETE /api/Stream -> elimina/detiene la transmisión activa.
//// 2. Finalizar transmisión (DELETE) sin alertas invasivas de error cuando ya no existe
const handleStopStream = async () => {
  setStopping(true);
  try {
    const response = await api.deleteStream();

    // Limpiamos los estados inmediatamente
    setActiveStream(null);
    setActiveStreamUrl('');
    showFeedback('success', response?.menssgee || 'Transmisión finalizada correctamente.');
  } catch (error: any) {
    // Si Azure dice que no hay live activo, reseteamos el estado silenciosamente sin lanzar excepción
    const errorMsg = error?.message || '';
    if (errorMsg.includes('No existe live activo') || errorMsg.includes('null')) {
      setActiveStream(null);
      setActiveStreamUrl('');
      showFeedback('info', 'La transmisión ya no estaba activa en el servidor.');
    } else {
      showFeedback('error', errorMsg || 'Error al detener la transmisión.');
    }
  } finally {
    setStopping(false);
  }
};

// 2. Vincularlo al botón de la pantalla
<button 
  onClick={handleStopStream} 
  disabled={stopping}
  className="btn-danger"
>
  {stopping ? 'TERMINANDO...' : '• TERMINAR EN DIRECTO'}
</button>

  // Función de prueba para eliminar comentarios.
  const handleDeleteComment = (id: string) => {
    setComments(prev => prev.filter(comment => comment.id !== id));
  };

  const feedbackStyle =
    feedback.type === 'success'
      ? styles.feedbackSuccess
      : feedback.type === 'error'
        ? styles.feedbackError
        : styles.feedbackInfo;

  const hasActiveStream = Boolean(activeStream);

  const getSectionSubtitle = () => {
    if (activeSection === 'dashboard') return 'Visualice el video activo y modere comentarios.';
    if (activeSection === 'articles') return 'Administre artículos relacionados a la transmisión.';
    if (activeSection === 'settings') return 'Configure los ajustes generales del panel.';
    return 'Gestione las transmisiones en vivo para la plataforma.';
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.pageContent}
      showsVerticalScrollIndicator={false}
    >
      {/* =========================================================
          HEADER PRINCIPAL - ESTILO LOS TIEMPOS
      ========================================================== */}
      <View style={styles.topHeader}>
        <Text style={styles.logo}>LOS TIEMPOS</Text>

        <View style={styles.topMenu}>
          <Text style={styles.topMenuItem}>NACIONAL</Text>
          <Text style={styles.topMenuItem}>INTERNACIONAL</Text>
          <Text style={styles.topMenuItem}>ECONOMÍA</Text>
          <Text style={styles.topMenuItem}>DEPORTES</Text>
          <Text style={styles.topMenuItem}>CULTURA</Text>

          <Text style={styles.topMenuActive}>EN VIVO ADMIN</Text>

          <Text style={styles.login}>⌕ ACCEDER</Text>

          <TouchableOpacity style={styles.registerButton} activeOpacity={0.8}>
            <Text style={styles.registerText}>REGISTRO</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* =========================================================
          CUERPO DEL PANEL
      ========================================================== */}
      <View style={styles.contentWrapper}>
        {/* ================= SIDEBAR ================= */}
        <View style={styles.sidebar}>
          <Text style={styles.sidebarTitle}>Herramientas</Text>

          <TouchableOpacity
            style={[styles.sidebarItem, activeSection === 'dashboard' && styles.sidebarItemActive]}
            onPress={() => setActiveSection('dashboard')}
            activeOpacity={0.8}
          >
            <Text style={styles.sidebarIcon}>⊞</Text>
            <Text style={activeSection === 'dashboard' ? styles.sidebarTextActive : styles.sidebarText}>Dashboard</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sidebarItem, activeSection === 'articles' && styles.sidebarItemActive]}
            onPress={() => setActiveSection('articles')}
            activeOpacity={0.8}
          >
            <Text style={styles.sidebarIcon}>▤</Text>
            <Text style={activeSection === 'articles' ? styles.sidebarTextActive : styles.sidebarText}>Artículos</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sidebarItem, activeSection === 'live' && styles.sidebarItemActive]}
            onPress={() => setActiveSection('live')}
            activeOpacity={0.8}
          >
            <Text style={styles.sidebarIcon}>▣</Text>
            <Text style={activeSection === 'live' ? styles.sidebarTextActive : styles.sidebarText}>Gestión de Live</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sidebarItem, activeSection === 'settings' && styles.sidebarItemActive]}
            onPress={() => setActiveSection('settings')}
            activeOpacity={0.8}
          >
            <Text style={styles.sidebarIcon}>⚙</Text>
            <Text style={activeSection === 'settings' ? styles.sidebarTextActive : styles.sidebarText}>Configuración</Text>
          </TouchableOpacity>
        </View>

        {/* ================= CONTENIDO PRINCIPAL ================= */}
        <View style={styles.mainContent}>
          {/* TÍTULO */}
          <View style={styles.titleRow}>
            <View style={styles.titleBlock}>
              <Text style={styles.pageTitle}>Panel de Transmisión</Text>
              <Text style={styles.pageSubtitle}>
                {getSectionSubtitle()}
              </Text>
            </View>

            <View style={styles.systemStatus}>
              <View style={styles.statusDot} />
              <Text style={styles.systemStatusText}>SISTEMA ACTIVO</Text>
            </View>
          </View>

          {/* ================= CREAR LIVE + ESTADO ================= */}
          {activeSection === 'live' && (
          <View style={styles.liveGrid}>
            {/* CREAR NUEVO LIVE */}
            <View style={styles.createLiveCard}>
              <Text style={styles.createTitle}>⊕ Crear Nuevo Live</Text>

              <Text style={styles.formLabel}>TÍTULO DE LA TRANSMISIÓN</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Ej: Conferencia de Prensa Presidencial"
                placeholderTextColor="#999999"
                value={streamTitle}
                onChangeText={setStreamTitle}
                editable={!publishing && !stopping}
              />

              <Text style={styles.formLabel}>DESCRIPCIÓN BREVE</Text>
              <TextInput
                style={styles.descriptionInput}
                placeholder="Ingrese los detalles principales de la transmisión..."
                placeholderTextColor="#999999"
                value={streamDescription}
                onChangeText={setStreamDescription}
                multiline
                textAlignVertical="top"
                editable={!publishing && !stopping}
              />

              {feedback.type !== null && (
                <Text style={[styles.feedbackText, feedbackStyle]}>{feedback.message}</Text>
              )}

              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={[styles.startButton, (publishing || stopping || hasActiveStream) && styles.btnDisabled]}
                  onPress={handlePublishStream}
                  disabled={publishing || stopping || hasActiveStream}
                  activeOpacity={0.8}
                >
                  {publishing ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.startButtonText}>▸ INICIAR TRANSMISIÓN</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* ESTADO ACTUAL */}
            <View style={styles.statusCard}>
              <Text style={styles.statusTitle}>⌁ Estado Actual</Text>

              <View style={styles.liveStatusBox}>
                <Text style={[styles.liveStatusTitle, !hasActiveStream && styles.liveStatusOffline]}>
                  ● {hasActiveStream ? 'EN VIVO AHORA' : 'SIN TRANSMISIÓN'}
                </Text>

                <Text style={styles.statusInfo}>
                  {hasActiveStream ? activeStream?.titulo || 'Sesión activa' : 'No hay sesión activa'}
                </Text>

                <Text style={styles.statusInfo}>
                  {hasActiveStream ? activeStream?.descripcion || 'Transmisión publicada' : 'Esperando publicación'}
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.infoButton, loadingStream && styles.btnDisabled]}
                onPress={loadActiveStream}
                disabled={loadingStream}
                activeOpacity={0.8}
              >
                {loadingStream ? (
                  <ActivityIndicator color="#333333" size="small" />
                ) : (
                  <Text style={styles.infoButtonText}>◉ OBTENER INFORMACIÓN</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.stopButton, (!hasActiveStream || stopping || publishing) && styles.btnDisabled]}
                onPress={handleStopStream}
                disabled={!hasActiveStream || stopping || publishing}
                activeOpacity={0.8}
              >
                {stopping ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.stopButtonText}>● TERMINAR LIVE</Text>
                )}
              </TouchableOpacity>

              <View style={styles.viewersBox}>
                <View>
                  <Text style={styles.viewersLabel}>ESPECTADORES CONCURRENTES</Text>
                  <Text style={styles.viewersNumber}>{viewersCount.toLocaleString()}</Text>
                </View>
                <Text style={styles.viewerIcon}>♙</Text>
              </View>
            </View>
          </View>
          )}

          {/* ================= MONITOR ================= */}
          {activeSection === 'dashboard' && (
          <>
          <View style={styles.monitorCard}>
            <Text style={styles.monitorTitle}>Monitor de transmisión</Text>

            {loadingStream ? (
              <View style={styles.streamPlaceholder}>
                <ActivityIndicator color={LiveTheme.textMuted} />
                <Text style={styles.placeholderText}>Cargando señal activa...</Text>
              </View>
            ) : activeStreamUrl ? (
              <>
                <View style={styles.flexDirection: 'row'}>
                  <VideoPlayer videoUrl={activeStreamUrl} />
                </View>

                <Text style={styles.streamUrlLabel} numberOfLines={1}>
                  Señal activa: {activeStreamUrl}
                </Text>
              </>
            ) : hasActiveStream ? (
              <View style={styles.streamPlaceholder}>
                <Text style={styles.placeholderTitle}>{activeStream?.titulo || 'Transmisión activa'}</Text>
                <Text style={styles.placeholderText}>
                  La API confirmó el live, pero no devolvió un enlace de video para mostrar en el monitor.
                </Text>
              </View>
            ) : (
              <View style={styles.streamPlaceholder}>
                <Text style={styles.placeholderTitle}>No hay transmisión activa</Text>
                <Text style={styles.placeholderText}>
                  Publica una transmisión desde Gestión de Live para iniciar la señal.
                </Text>
              </View>
            )}
          </View>

          {/* ================= MODERACIÓN ================= */}
          <View style={styles.commentsCard}>
            <View style={styles.commentsHeader}>
              <Text style={styles.commentsTitle}>Moderación de Chat</Text>
              <Text style={styles.commentsCount}>{comments.length} comentarios</Text>
            </View>

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
                    activeOpacity={0.8}
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
          </>
          )}

          {activeSection === 'articles' && (
            <View style={styles.placeholderCard}>
              <Text style={styles.monitorTitle}>Artículos</Text>
              <Text style={styles.placeholderText}>
                Aquí irá la gestión de artículos vinculados a la transmisión en vivo.
              </Text>
            </View>
          )}

          {activeSection === 'settings' && (
            <View style={styles.placeholderCard}>
              <Text style={styles.monitorTitle}>Configuración</Text>
              <Text style={styles.placeholderText}>
                Aquí irán los ajustes generales del panel administrativo.
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* ================= FOOTER ================= */}
      <View style={styles.footer}>
        <Text style={styles.footerLogo}>LOS TIEMPOS</Text>

        <View style={styles.footerLinks}>
          <Text style={styles.footerLink}>Privacidad</Text>
          <Text style={styles.footerLink}>Términos de Uso</Text>
          <Text style={styles.footerLink}>Publicidad</Text>
          <Text style={styles.footerLink}>Contacto</Text>
        </View>

        <Text style={styles.copyright}>
          © 2024 Editorial Canelas. Todos los derechos reservados. Cochabamba, Bolivia.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  pageContent: {
    padding: 0,
  },

  /* ================= HEADER ================= */

  topHeader: {
    minHeight: 62,
    borderBottomWidth: 1,
    borderBottomColor: '#D6D6D6',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexWrap: 'wrap',
    gap: 10,
  },

  logo: {
    fontSize: 23,
    fontWeight: '900',
    color: '#111111',
    letterSpacing: -1,
  },

  topMenu: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 17,
    flexWrap: 'wrap',
  },

  topMenuItem: {
    fontSize: 9,
    color: '#555555',
  },

  topMenuActive: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#222222',
    borderBottomWidth: 2,
    borderBottomColor: '#F5D000',
    paddingBottom: 5,
  },

  login: {
    fontSize: 9,
    color: '#333333',
  },

  registerButton: {
    backgroundColor: '#111111',
    paddingHorizontal: 10,
    paddingVertical: 7,
  },

  registerText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: 'bold',
  },

  /* ================= CONTENIDO ================= */

  contentWrapper: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 16,
    alignItems: 'flex-start',
  },

  /* ================= SIDEBAR ================= */

  sidebar: {
    width: 122,
    borderWidth: 1,
    borderColor: '#BDBDBD',
    backgroundColor: '#FAFAFA',
  },

  sidebarTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#333333',
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#CCCCCC',
  },

  sidebarItem: {
    height: 37,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    gap: 8,
  },

  sidebarItemActive: {
    backgroundColor: '#FFD900',
  },

  sidebarIcon: {
    fontSize: 12,
    color: '#333333',
  },

  sidebarText: {
    fontSize: 9,
    color: '#333333',
  },

  sidebarTextActive: {
    fontSize: 9,
    color: '#111111',
    fontWeight: 'bold',
  },

  /* ================= MAIN ================= */

  mainContent: {
    flex: 1,
    minWidth: 0,
  },

  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
    gap: 10,
  },

  titleBlock: {
    flex: 1,
  },

  pageTitle: {
    fontSize: 27,
    fontWeight: '800',
    color: '#222222',
  },

  pageSubtitle: {
    fontSize: 8,
    color: '#B49B00',
    marginTop: 1,
  },

  systemStatus: {
    backgroundColor: '#222222',
    paddingHorizontal: 9,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#FFD900',
  },

  systemStatusText: {
    color: '#FFD900',
    fontSize: 8,
    fontWeight: 'bold',
  },

  /* ================= LIVE GRID ================= */

  liveGrid: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'stretch',
  },

  createLiveCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#B8B8B8',
    padding: 10,
    backgroundColor: '#FFFFFF',
    minHeight: 240,
  },

  createTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#222222',
    marginBottom: 12,
  },

  formLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: '#555555',
    marginBottom: 5,
    marginTop: 4,
  },

  formInput: {
    height: 29,
    borderWidth: 1,
    borderColor: '#AFAFAF',
    paddingHorizontal: 8,
    fontSize: 10,
    color: '#222222',
    backgroundColor: '#FAFAFA',
  },

  descriptionInput: {
    height: 52,
    borderWidth: 1,
    borderColor: '#AFAFAF',
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 9,
    color: '#222222',
    backgroundColor: '#FAFAFA',
  },

  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },

  startButton: {
    backgroundColor: '#222222',
    paddingHorizontal: 15,
    height: 29,
    alignItems: 'center',
    justifyContent: 'center',
  },

  startButtonText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: 'bold',
  },

  /* ================= STATUS ================= */

  statusCard: {
    width: 180,
    borderWidth: 1,
    borderColor: '#B8B8B8',
    backgroundColor: '#FFFFFF',
  },

  statusTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333333',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#CCCCCC',
  },

  liveStatusBox: {
    backgroundColor: '#222222',
    margin: 7,
    padding: 8,
  },

  liveStatusTitle: {
    color: '#FFD900',
    fontSize: 8,
    fontWeight: 'bold',
    marginBottom: 5,
  },

  liveStatusOffline: {
    color: '#AAAAAA',
  },

  statusInfo: {
    color: '#FFFFFF',
    fontSize: 8,
    marginTop: 2,
  },

  infoButton: {
    marginHorizontal: 7,
    marginBottom: 6,
    height: 27,
    borderWidth: 1,
    borderColor: '#777777',
    alignItems: 'center',
    justifyContent: 'center',
  },

  infoButtonText: {
    fontSize: 8,
    color: '#333333',
  },

  stopButton: {
    marginHorizontal: 7,
    marginBottom: 8,
    height: 27,
    backgroundColor: '#D90000',
    alignItems: 'center',
    justifyContent: 'center',
  },

  stopButtonText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: 'bold',
  },

  btnDisabled: {
    opacity: 0.45,
  },

  /* ================= FEEDBACK ================= */

  feedbackText: {
    marginTop: 7,
    padding: 7,
    fontSize: 9,
    fontWeight: '600',
  },

  feedbackSuccess: {
    color: '#1B5E20',
    backgroundColor: '#E8F5E9',
  },

  feedbackError: {
    color: '#B71C1C',
    backgroundColor: '#FFEBEE',
  },

  feedbackInfo: {
    color: '#0D47A1',
    backgroundColor: '#E3F2FD',
  },

  /* ================= VIEWERS ================= */

  viewersBox: {
    borderTopWidth: 1,
    borderTopColor: '#CCCCCC',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 7,
  },

  viewersLabel: {
    fontSize: 6,
    color: '#777777',
  },

  viewersNumber: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#222222',
    marginTop: 1,
  },

  viewerIcon: {
    fontSize: 20,
    color: '#777777',
  },

  /* ================= MONITOR ================= */

  monitorCard: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#B8B8B8',
    backgroundColor: '#FFFFFF',
    padding: 10,
  },

  placeholderCard: {
    borderWidth: 1,
    borderColor: '#B8B8B8',
    backgroundColor: '#FFFFFF',
    padding: 18,
    minHeight: 170,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },

  monitorTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#222222',
    marginBottom: 8,
  },

  flexDirection: 'row': {
    width: '100%',
  },

  streamPlaceholder: {
    aspectRatio: 16 / 9,
    minHeight: 180,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 20,
  },

  placeholderTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#222222',
  },

  placeholderText: {
    fontSize: 10,
    color: '#777777',
    textAlign: 'center',
  },

  streamUrlLabel: {
    marginTop: 6,
    fontSize: 8,
    color: LiveTheme.textMuted,
    fontStyle: 'italic',
  },

  /* ================= COMMENTS ================= */

  commentsCard: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#B8B8B8',
    backgroundColor: '#FFFFFF',
    padding: 10,
  },

  commentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  commentsTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#222222',
  },

  commentsCount: {
    fontSize: 8,
    color: '#777777',
  },

  commentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },

  commentInfo: {
    flex: 1,
    marginRight: 8,
  },

  commentUser: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333333',
  },

  commentText: {
    fontSize: 10,
    color: '#555555',
  },

  btnDelete: {
    backgroundColor: '#FFCCCC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 2,
  },

  btnDeleteText: {
    color: '#B00000',
    fontSize: 8,
    fontWeight: 'bold',
  },

  emptyText: {
    textAlign: 'center',
    color: '#888888',
    marginTop: 10,
    fontSize: 9,
  },

  /* ================= FOOTER ================= */

  footer: {
    minHeight: 55,
    backgroundColor: '#191919',
    borderTopWidth: 3,
    borderTopColor: '#FFD900',
    paddingHorizontal: 10,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 10,
  },

  footerLogo: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },

  footerLinks: {
    flexDirection: 'row',
    gap: 15,
  },

  footerLink: {
    color: '#FFFFFF',
    fontSize: 7,
  },

  copyright: {
    color: '#FFFFFF',
    fontSize: 7,
  },
});
