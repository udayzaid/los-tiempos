import { VideoPlayer } from '@/components/live/VideoPlayer';
import { LiveHeader } from '@/components/live/LiveHeader';
import { LiveTheme } from '@/constants/live-theme';
import { useAuth } from '@/context/AuthContext';
import { api, type StreamHistoryItem } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { StreamCredentialsModal } from '@/components/admin/StreamCredentialsModal';
import type { StreamCredentials } from '@/types/stream';

/* =========================================================
   TIPOS
========================================================= */



type Feedback = {
  type: 'success' | 'error' | 'info' | null;
  message: string;
};

type AdminSection = 'dashboard' | 'live' | 'users' | 'settings';

type ActiveStream = {
  titulo?: string;
  descripcion?: string;
};

/* =========================================================
   MOCK KPIS (temporales)
========================================================= */

const MOCK_KPIS = {
  streamsToday: 8,
  currentViewers: 1248,
  totalHours: 24.5,
};

function getYouTubeVideoId(watchUrl: string): string | null {
  try {
    const url = new URL(watchUrl);
    const host = url.hostname.toLowerCase();
    let videoId = '';

    if (host === 'youtu.be' || host.endsWith('.youtu.be')) {
      videoId = url.pathname.split('/').filter(Boolean)[0] || '';
    } else if (host.includes('youtube.com')) {
      videoId = url.searchParams.get('v') ||
        url.pathname.match(/\/(?:embed|live|shorts)\/([^/?]+)/)?.[1] || '';
    }

    return /^[A-Za-z0-9_-]{6,20}$/.test(videoId) ? videoId : null;
  } catch {
    return null;
  }
}

/* =========================================================
   COMPONENTE PRINCIPAL
========================================================= */

export default function AdminDashboard() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { role, isAuthenticated, loading: authLoading } = useAuth();

  const isMobile = width < 1024;
  const isAdmin = role?.trim().toLowerCase() === 'admin';

  // -------- PROTECCIÓN DE RUTA --------
  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || !isAdmin) {
      router.replace('/');
    }
  }, [authLoading, isAuthenticated, isAdmin, router]);

  // -------- ESTADOS --------
  const [activeSection, setActiveSection] = useState<AdminSection>('live');

  const [activeStream, setActiveStream] = useState<ActiveStream | null>(null);
  const [activeStreamUrl, setActiveStreamUrl] = useState('');

  const [streamTitle, setStreamTitle] = useState('');
  const [streamDescription, setStreamDescription] = useState('');

  const [loadingStream, setLoadingStream] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [stopping, setStopping] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>({ type: null, message: '' });

  const [credentials, setCredentials] = useState<StreamCredentials | null>(null);
  const [credentialsVisible, setCredentialsVisible] = useState(false);
  const [loadingCredentials, setLoadingCredentials] = useState(false);

  const [recentStreams, setRecentStreams] = useState<StreamHistoryItem[]>([]);
  const [recentStreamsLoading, setRecentStreamsLoading] = useState(true);
  const [recentStreamsError, setRecentStreamsError] = useState('');
  const [streamsPageIndex, setStreamsPageIndex] = useState(1);
  const [streamsPagination, setStreamsPagination] = useState({
    totalPages: 1,
    totalCount: 0,
    hasPreviousPage: false,
    hasNextPage: false,
  });

  const [viewersCount] = useState(MOCK_KPIS.currentViewers);

  // -------- HELPERS --------
  const showFeedback = (type: Feedback['type'], message: string) => {
    setFeedback({ type, message });
  };

  const loadRecentStreams = useCallback(async (pageIndex: number) => {
    setRecentStreamsLoading(true);
    setRecentStreamsError('');

    try {
      const result = await api.getAllStreams(pageIndex, 10);
      setRecentStreams(result.items ?? []);
      setStreamsPageIndex(result.pageIndex ?? pageIndex);
      setStreamsPagination({
        totalPages: result.totalPages ?? 1,
        totalCount: result.totalCount ?? 0,
        hasPreviousPage: result.hasPreviousPage ?? pageIndex > 1,
        hasNextPage: result.hasNextPage ?? false,
      });
    } catch (error: any) {
      setRecentStreams([]);
      setRecentStreamsError(error?.message || 'No se pudieron cargar las transmisiones.');
    } finally {
      setRecentStreamsLoading(false);
    }
  }, []);

  const hasActiveStream = Boolean(activeStream);

  const handleFetchCredentials = async () => {
    setLoadingCredentials(true);
    try {
      const data = await api.getStreamCredentials();

      // 🚫 Si NO es 200 o no hay datos → NO abrimos el modal.
      if (!data) {
        showFeedback('info', 'No hay transmisión activa o no autorizada.');
        return;
      }

      setCredentials(data);
      setCredentialsVisible(true);
      showFeedback('success', 'Credenciales obtenidas.');
    } catch (err: any) {
      showFeedback('error', err?.message || 'Error al obtener credenciales.');
    } finally {
      setLoadingCredentials(false);
    }
  };

  // -------- CARGAR STREAM ACTIVO --------
  const loadActiveStream = useCallback(async () => {
    setLoadingStream(true);
    try {
      const data = await api.getStream();

      if (data && data.hasActiveStream) {
        setActiveStream(data.raw);
        setActiveStreamUrl(data.url);
      } else {
        setActiveStream(null);
        setActiveStreamUrl('');
      }
    } catch {
      setActiveStream(null);
      setActiveStreamUrl('');
    } finally {
      setLoadingStream(false);
    }
  }, []);

  useEffect(() => {
    loadActiveStream();
  }, [loadActiveStream]);

  useEffect(() => {
    loadRecentStreams(streamsPageIndex);
  }, [loadRecentStreams, streamsPageIndex]);

  // -------- PUBLICAR STREAM --------
  const handlePublishStream = async () => {
    const title = streamTitle.trim();
    const description = streamDescription.trim();

    if (!title) {
      showFeedback('error', 'Ingresa un título para la transmisión.');
      return;
    }

    if (hasActiveStream) {
      showFeedback('error', 'Ya existe un stream activo.');
      return;
    }

    setPublishing(true);
    setFeedback({ type: null, message: '' });

    try {
      // 👇 createStream ahora devuelve las credenciales tipadas
      const created = await api.createStream({
        titulo: title,
        descripcion: description || title,
      });

      // Reflejamos el nuevo live en el estado local del panel
      setActiveStream({ titulo: title, descripcion: description || title });
      if (streamsPageIndex === 1) void loadRecentStreams(1);
      setStreamsPageIndex(1);

      // Intentamos obtener la URL de reproducción para el monitor
      const playableUrl = created.watchUrl || created.embeUrl || '';
      if (playableUrl) {
        setActiveStreamUrl(playableUrl);
      } else {
        await loadActiveStream();
      }

      // Limpiamos el formulario
      setStreamTitle('');
      setStreamDescription('');

      // 👇 AQUÍ ESTÁ LA MAGIA: si el live se creó OK, mostramos el modal
      if (created.broadcastId || created.streamingKey) {
        setCredentials(created);
        setCredentialsVisible(true);
        showFeedback('success', 'Transmisión creada. Credenciales listas.');
      } else {
        showFeedback('success', 'Transmisión publicada correctamente.');
      }
    } catch (err: any) {
      showFeedback(
        'error',
        err?.message || 'Error al publicar la transmisión.'
      );
    } finally {
      setPublishing(false);
    }
  };

  // -------- DETENER STREAM --------
  const handleStopStream = async () => {
    setStopping(true);
    try {
      const response = await api.deleteStream();
      setActiveStream(null);
      setActiveStreamUrl('');
      void loadRecentStreams(streamsPageIndex);
      showFeedback(
        'success',
        response?.message || 'Transmisión finalizada correctamente.'
      );
    } catch (error: any) {
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

  const getSectionSubtitle = () => {
    if (activeSection === 'live') return 'Resumen general de la plataforma en tiempo real.';
    if (activeSection === 'users') return 'Gestión de usuarios registrados.';
    if (activeSection === 'settings') return 'Configuración general del panel.';
    return 'Resumen general de la plataforma en tiempo real.';
  };

  // -------- RENDER DE CARGA / BLOQUEO --------
  if (authLoading || !isAuthenticated || !isAdmin) {
    return (
      <View style={styles.authLoading}>
        <ActivityIndicator size="large" color="#F5B301" />
        <Text style={styles.authLoadingText}>Verificando permisos...</Text>
      </View>
    );
  }

  /* =========================================================
     RENDER PRINCIPAL
  ========================================================= */
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.pageContent}
      showsVerticalScrollIndicator={false}
    >
      <LiveHeader
        headline="Los Tiempos, señal en vivo - Artemis retorna, Trump y los convenios, Liga boliviana y las ultimas posiciones en las tablas"
        onOpenLogin={() => {}}
        onOpenRegister={() => {}}
      />
      <StreamCredentialsModal
        visible={credentialsVisible}
        credentials={credentials}
        onClose={() => setCredentialsVisible(false)}
      />
      <View
        style={[
          styles.layout,
          isMobile && styles.layoutMobile,
        ]}
      >
        {/* =========================================================
            SIDEBAR
        ========================================================= */}
        <View style={[styles.sidebar, isMobile && styles.sidebarMobile]}>
          <Text style={styles.sidebarBrand}>ADMINISTRACIÓN</Text>

          <TouchableOpacity
            style={[styles.sidebarItem, activeSection === 'live' && styles.sidebarItemActive]}
            onPress={() => setActiveSection('live')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="grid-outline"
              size={18}
              color={activeSection === 'live' ? '#C99200' : '#666'}
            />
            <Text
              style={
                activeSection === 'live'
                  ? styles.sidebarTextActive
                  : styles.sidebarText
              }
            >
              Gestión de Live
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sidebarItem, activeSection === 'users' && styles.sidebarItemActive]}
            onPress={() => setActiveSection('users')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="people-outline"
              size={18}
              color={activeSection === 'users' ? '#C99200' : '#666'}
            />
            <Text
              style={
                activeSection === 'users'
                  ? styles.sidebarTextActive
                  : styles.sidebarText
              }
            >
              Usuarios
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sidebarItem, activeSection === 'settings' && styles.sidebarItemActive]}
            onPress={() => setActiveSection('settings')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="settings-outline"
              size={18}
              color={activeSection === 'settings' ? '#C99200' : '#666'}
            />
            <Text
              style={
                activeSection === 'settings'
                  ? styles.sidebarTextActive
                  : styles.sidebarText
              }
            >
              Configuración
            </Text>
          </TouchableOpacity>
        </View>

        {/* =========================================================
            COLUMNA CENTRAL
        ========================================================= */}
        <View style={styles.mainColumn}>

          {/* HEADER */}
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.pageTitle}>Dashboard</Text>
              <Text style={styles.pageSubtitle}>{getSectionSubtitle()}</Text>
            </View>

            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>SISTEMA ACTIVO</Text>
            </View>
          </View>

          {/* KPIs */}
          <View style={[styles.kpiRow, isMobile && styles.kpiRowMobile]}>
            <View style={styles.kpiCard}>
              <View style={[styles.kpiIcon, { backgroundColor: '#E8F5E9' }]}>
                <Ionicons name="radio-outline" size={20} color="#2E7D32" />
              </View>
              <View>
                <Text style={styles.kpiLabel}>Transmisiones Hoy</Text>
                <Text style={styles.kpiValue}>{MOCK_KPIS.streamsToday}</Text>
              </View>
            </View>

            <View style={styles.kpiCard}>
              <View style={[styles.kpiIcon, { backgroundColor: '#E3F2FD' }]}>
                <Ionicons name="eye-outline" size={20} color="#1565C0" />
              </View>
              <View>
                <Text style={styles.kpiLabel}>Espectadores Actuales</Text>
                <Text style={styles.kpiValue}>
                  {MOCK_KPIS.currentViewers.toLocaleString()}
                </Text>
              </View>
            </View>

            <View style={styles.kpiCard}>
              <View style={[styles.kpiIcon, { backgroundColor: '#F3E5F5' }]}>
                <Ionicons name="time-outline" size={20} color="#6A1B9A" />
              </View>
              <View>
                <Text style={styles.kpiLabel}>Tiempo Total (h)</Text>
                <Text style={styles.kpiValue}>{MOCK_KPIS.totalHours}</Text>
              </View>
            </View>
          </View>

          {/* CREAR NUEVO LIVE */}
          {activeSection === 'live' && (
            <>
              <View style={styles.card}>
                <View style={styles.cardHeaderRow}>
                  <View style={[styles.cardIcon, { backgroundColor: '#FFF8E1' }]}>
                    <Ionicons name="add" size={18} color="#C99200" />
                  </View>
                  <Text style={styles.cardTitle}>Crear Nuevo Live</Text>
                </View>

                <Text style={styles.formLabel}>Título de la transmisión</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Ej: Conferencia de Prensa Presidencial"
                  placeholderTextColor="#AAAAAA"
                  value={streamTitle}
                  onChangeText={setStreamTitle}
                  editable={!publishing && !stopping}
                />

                <Text style={styles.formLabel}>Descripción breve</Text>
                <TextInput
                  style={styles.descriptionInput}
                  placeholder="Ingrese los detalles principales de la transmisión..."
                  placeholderTextColor="#AAAAAA"
                  value={streamDescription}
                  onChangeText={(t) => setStreamDescription(t.slice(0, 300))}
                  multiline
                  textAlignVertical="top"
                  editable={!publishing && !stopping}
                  maxLength={300}
                />
                <Text style={styles.counterText}>
                  {streamDescription.length}/300
                </Text>

                {feedback.type !== null && (
                  <Text
                    style={[
                      styles.feedbackText,
                      feedback.type === 'success' && styles.feedbackSuccess,
                      feedback.type === 'error' && styles.feedbackError,
                      feedback.type === 'info' && styles.feedbackInfo,
                    ]}
                  >
                    {feedback.message}
                  </Text>
                )}

                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={[
                      styles.startButton,
                      (publishing || stopping || hasActiveStream) && styles.btnDisabled,
                    ]}
                    onPress={handlePublishStream}
                    disabled={publishing || stopping || hasActiveStream}
                    activeOpacity={0.85}
                  >
                    {publishing ? (
                      <ActivityIndicator color="#FFD900" size="small" />
                    ) : (
                      <>
                        <Ionicons name="radio-outline" size={14} color="#FFD900" />
                        <Text style={styles.startButtonText}>INICIAR TRANSMISIÓN</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* TRANSMISIONES RECIENTES */}
              <View style={styles.card}>
                <View style={styles.cardHeaderRow}>
                  <View style={[styles.cardIcon, { backgroundColor: '#FFF8E1' }]}>
                    <Ionicons name="time-outline" size={16} color="#C99200" />
                  </View>
                  <Text style={styles.cardTitle}>Transmisiones Recientes</Text>
                </View>

                {recentStreamsLoading ? (
                  <View style={styles.recentMessage}>
                    <ActivityIndicator size="small" color="#C99200" />
                    <Text style={styles.placeholderText}>Cargando transmisiones...</Text>
                  </View>
                ) : recentStreamsError ? (
                  <View style={styles.recentMessage}>
                    <Text style={styles.feedbackError}>{recentStreamsError}</Text>
                    <TouchableOpacity
                      style={styles.detailsButton}
                      onPress={() => loadRecentStreams(streamsPageIndex)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.detailsButtonText}>Reintentar</Text>
                    </TouchableOpacity>
                  </View>
                ) : recentStreams.length === 0 ? (
                  <Text style={styles.placeholderText}>No hay transmisiones registradas.</Text>
                ) : (
                  recentStreams.map((item, index) => {
                    const videoId = getYouTubeVideoId(item.watchUrl);
                    const thumbnailUrl = videoId
                      ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
                      : 'https://picsum.photos/seed/live/200/120';
                    const isActive = ['activo', 'active', 'estable', 'en vivo'].includes(
                      String(item.estado ?? '').trim().toLowerCase()
                    );
                    const startDate = item.incio ? new Date(item.incio) : null;
                    const endDate = item.fin ? new Date(item.fin) : null;
                    const startLabel = startDate && !Number.isNaN(startDate.getTime())
                      ? startDate.toLocaleString('es-BO')
                      : item.incio || '—';
                    const endLabel = endDate && !Number.isNaN(endDate.getTime())
                      ? endDate.toLocaleString('es-BO')
                      : item.fin || 'En curso';

                    return (
                      <View key={`${item.watchUrl}-${item.incio}-${index}`} style={styles.recentRow}>
                        <Pressable
                          onPress={() => {
                            if (item.watchUrl) {
                              void Linking.openURL(item.watchUrl).catch((error) =>
                                console.error('No se pudo abrir el video de YouTube:', error)
                              );
                            }
                          }}
                          disabled={!item.watchUrl}
                          accessibilityRole="link"
                          accessibilityLabel={`Abrir en YouTube: ${item.nombre || 'transmisión'}`}
                        >
                          <Image source={{ uri: thumbnailUrl }} style={styles.recentThumb} />
                        </Pressable>

                        <View style={{ flex: 1, minWidth: 0 }}>
                          <Text style={styles.recentTitle} numberOfLines={1}>
                            {item.nombre || 'Transmisión sin título'}
                          </Text>
                          <Text style={styles.recentCategory} numberOfLines={1}>
                            {item.descripcion || 'Sin descripción'}
                          </Text>
                          <Text style={styles.recentTime} numberOfLines={1}>
                            Inicio: {startLabel}
                          </Text>
                          <Text style={styles.recentAuthor} numberOfLines={1}>
                            Fin: {endLabel}
                          </Text>
                        </View>

                        <View style={styles.recentStats}>
                          <Text style={styles.recentViewers}>
                            {(item.espectadores ?? 0).toLocaleString()}
                          </Text>
                          <Text style={styles.recentViewersLabel}>Espectadores</Text>
                        </View>

                        <View
                          style={[
                            styles.recentStatus,
                            isActive && styles.recentStatusOk,
                          ]}
                        >
                          <View
                            style={[
                              styles.recentStatusDot,
                              isActive && { backgroundColor: '#2E7D32' },
                            ]}
                          />
                          <Text style={styles.recentStatusText}>{item.estado || 'Desconocido'}</Text>
                        </View>

                        <TouchableOpacity style={styles.detailsButton} activeOpacity={0.8}>
                          <Ionicons name="eye-outline" size={14} color="#333" />
                          <Text style={styles.detailsButtonText}>Ver Detalles</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.moreButton} activeOpacity={0.8}>
                          <Ionicons name="ellipsis-vertical" size={14} color="#666" />
                        </TouchableOpacity>
                      </View>
                    );
                  })
                )}

                {!recentStreamsLoading && !recentStreamsError && streamsPagination.totalCount > 0 && (
                  <View style={styles.paginationRow}>
                    <Text style={styles.paginationInfo}>
                      Página {streamsPageIndex} de {streamsPagination.totalPages} · {streamsPagination.totalCount} transmisiones
                    </Text>
                    <View style={styles.paginationActions}>
                      <TouchableOpacity
                        style={[styles.paginationButton, !streamsPagination.hasPreviousPage && styles.btnDisabled]}
                        onPress={() => setStreamsPageIndex((page) => Math.max(1, page - 1))}
                        disabled={!streamsPagination.hasPreviousPage}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.paginationButtonText}>Anterior</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.paginationButton, !streamsPagination.hasNextPage && styles.btnDisabled]}
                        onPress={() => setStreamsPageIndex((page) => page + 1)}
                        disabled={!streamsPagination.hasNextPage}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.paginationButtonText}>Siguiente</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            </>
          )}

          {/* USUARIOS (placeholder) */}
          {activeSection === 'users' && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Usuarios</Text>
              <Text style={styles.placeholderText}>
                Aquí irá la gestión de usuarios registrados.
              </Text>
            </View>
          )}

          {/* CONFIGURACIÓN (placeholder) */}
          {activeSection === 'settings' && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Configuración</Text>
              <Text style={styles.placeholderText}>
                Aquí irán los ajustes generales del panel administrativo.
              </Text>
            </View>
          )}
        </View>

        {/* =========================================================
            COLUMNA DERECHA
        ========================================================= */}
        <View style={[styles.rightColumn, isMobile && styles.rightColumnMobile]}>

          {/* ESTADO ACTUAL */}
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <Ionicons name="radio-outline" size={16} color="#333" />
              <Text style={styles.cardTitle}>Estado Actual</Text>
            </View>

            <View style={styles.liveStatusBox}>
              <Text
                style={[
                  styles.liveStatusTitle,
                  !hasActiveStream && styles.liveStatusOffline,
                ]}
              >
                ● {hasActiveStream ? 'EN VIVO AHORA' : 'SIN TRANSMISIÓN'}
              </Text>
              <Text style={styles.liveStatusInfo}>
                {hasActiveStream
                  ? activeStream?.titulo || 'Sesión activa'
                  : 'No hay sesión activa'}
              </Text>
              <Text style={styles.liveStatusInfo}>
                {hasActiveStream
                  ? activeStream?.descripcion || 'Transmisión publicada'
                  : 'Esperando publicación'}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.infoButton, loadingCredentials && styles.btnDisabled]}
              onPress={handleFetchCredentials}
              disabled={loadingCredentials}
              activeOpacity={0.85}
            >
              {loadingCredentials ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.infoButtonText}>Obtener Información</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.stopButton,
                (!hasActiveStream || stopping || publishing) && styles.btnDisabled,
              ]}
              onPress={handleStopStream}
              disabled={!hasActiveStream || stopping || publishing}
              activeOpacity={0.85}
            >
              {stopping ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <View style={styles.stopIconSquare} />
                  <Text style={styles.stopButtonText}>TERMINAR LIVE</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* ESTADÍSTICAS EN TIEMPO REAL */}
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <Ionicons name="stats-chart-outline" size={16} color="#333" />
              <Text style={styles.cardTitle}>Estadísticas en Tiempo Real</Text>
            </View>

            {/* GRÁFICA DE LÍNEA (mock) */}
            <View style={styles.chartContainer}>
              <Svg height="80" width="100%" viewBox="0 0 300 80">
                <Path
                  d="M0,60 L30,45 L60,55 L90,30 L120,50 L150,20 L180,40 L210,15 L240,35 L270,10 L300,25"
                  stroke="#F5B301"
                  strokeWidth="2"
                  fill="none"
                />
              </Svg>
            </View>

            <View style={styles.statsRow}>
              <Text style={styles.statsLabel}>Espectadores concurrentes</Text>
              <View style={styles.statsRowValue}>
                <Text style={styles.statsValue}>
                  {viewersCount.toLocaleString()}
                </Text>
                <View style={styles.trendBadge}>
                  <Ionicons name="trending-up" size={10} color="#2E7D32" />
                  <Text style={styles.trendText}>12%</Text>
                </View>
              </View>
            </View>

            <View style={styles.statsRow}>
              <Text style={styles.statsLabel}>Pico máximo (hoy)</Text>
              <Text style={styles.statsValue}>2,350</Text>
            </View>

            <View style={[styles.statsRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.statsLabel}>Duración promedio</Text>
              <Text style={styles.statsValue}>01:24:18</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

/* =========================================================
   ESTILOS
========================================================= */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7F8' },
  pageContent: { flexGrow: 1 },

  authLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  authLoadingText: { fontSize: 13, color: '#777' },

  /* ===== LAYOUT ===== */
  layout: {
    flexDirection: 'row',
    padding: 20,
    gap: 20,
    alignItems: 'flex-start',
  },
  layoutMobile: { flexDirection: 'column', padding: 12, gap: 12 },

  /* ===== SIDEBAR ===== */
  sidebar: {
    width: 200,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  sidebarMobile: { width: '100%' },

  sidebarBrand: {
    fontSize: 10,
    fontWeight: '700',
    color: '#999',
    letterSpacing: 1,
    paddingHorizontal: 10,
    marginBottom: 14,
  },

  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 10,
    paddingVertical: 11,
    borderRadius: 8,
    marginBottom: 4,
  },
  sidebarItemActive: { backgroundColor: '#FFF8E1' },
  sidebarText: { fontSize: 12, color: '#666', fontWeight: '500' },
  sidebarTextActive: { fontSize: 12, color: '#C99200', fontWeight: '700' },

  /* ===== COLUMNA CENTRAL ===== */
  mainColumn: { flex: 1, minWidth: 0, gap: 16 },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 4,
    gap: 10,
  },
  pageTitle: { fontSize: 26, fontWeight: '800', color: '#111' },
  pageSubtitle: { fontSize: 12, color: '#888', marginTop: 2 },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2E7D32',
  },
  statusText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#2E7D32',
    letterSpacing: 0.5,
  },

  /* ===== KPIs ===== */
  kpiRow: { flexDirection: 'row', gap: 14 },
  kpiRowMobile: { flexDirection: 'column' },
  kpiCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  kpiIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiLabel: { fontSize: 10, color: '#888', fontWeight: '500' },
  kpiValue: { fontSize: 22, fontWeight: '800', color: '#111', marginTop: 2 },

  /* ===== CARD GENÉRICA ===== */
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 18,
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  cardIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#111' },

  /* ===== FORM ===== */
  formLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
    marginTop: 6,
  },
  formInput: {
    height: 42,
    borderWidth: 1,
    borderColor: '#E2E2E2',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 13,
    color: '#222',
    backgroundColor: '#FAFAFA',
  },
  descriptionInput: {
    minHeight: 90,
    borderWidth: 1,
    borderColor: '#E2E2E2',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#222',
    backgroundColor: '#FAFAFA',
  },
  counterText: {
    alignSelf: 'flex-end',
    fontSize: 10,
    color: '#AAA',
    marginTop: 4,
  },

  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#111',
    paddingHorizontal: 20,
    height: 40,
    borderRadius: 8,
  },
  startButtonText: {
    color: '#FFD900',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  btnDisabled: { opacity: 0.45 },

  /* ===== FEEDBACK ===== */
  feedbackText: {
    marginTop: 10,
    padding: 10,
    borderRadius: 6,
    fontSize: 11,
    fontWeight: '600',
  },
  feedbackSuccess: { color: '#1B5E20', backgroundColor: '#E8F5E9' },
  feedbackError: { color: '#B71C1C', backgroundColor: '#FFEBEE' },
  feedbackInfo: { color: '#0D47A1', backgroundColor: '#E3F2FD' },

  /* ===== TRANSMISIONES RECIENTES ===== */
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  recentThumb: {
    width: 90,
    height: 56,
    borderRadius: 6,
    backgroundColor: '#EEE',
  },
  recentTitle: { fontSize: 12, fontWeight: '700', color: '#111' },
  recentCategory: { fontSize: 10, color: '#C99200', fontWeight: '600', marginTop: 1 },
  recentTime: { fontSize: 10, color: '#888', marginTop: 2 },
  recentAuthor: { fontSize: 10, color: '#888', marginTop: 1 },
  recentMessage: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  recentStats: { alignItems: 'flex-end', marginHorizontal: 8 },
  recentViewers: { fontSize: 12, fontWeight: '700', color: '#111' },
  recentViewersLabel: { fontSize: 9, color: '#888' },
  recentStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
  },
  recentStatusOk: { backgroundColor: '#E8F5E9' },
  recentStatusDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#999',
  },
  recentStatusText: { fontSize: 10, color: '#333', fontWeight: '600' },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E2E2',
    marginHorizontal: 6,
  },
  detailsButtonText: { fontSize: 10, color: '#333', fontWeight: '600' },
  moreButton: { padding: 4 },
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingTop: 14,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  paginationInfo: { fontSize: 10, color: '#888', flex: 1 },
  paginationActions: { flexDirection: 'row', gap: 8 },
  paginationButton: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: '#E2E2E2',
    borderRadius: 6,
    backgroundColor: '#FFF',
  },
  paginationButtonText: { fontSize: 10, color: '#333', fontWeight: '600' },

  /* ===== COLUMNA DERECHA ===== */
  rightColumn: { width: 300, gap: 16 },
  rightColumnMobile: { width: '100%' },

  liveStatusBox: {
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  liveStatusTitle: {
    color: '#FFD900',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  liveStatusOffline: { color: '#888' },
  liveStatusInfo: { color: '#DDD', fontSize: 11, marginTop: 2 },

  infoButton: {
    backgroundColor: '#F5B301',
    height: 38,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  infoButtonText: { color: '#FFF', fontSize: 12, fontWeight: '800' },

  stopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#E53935',
    height: 38,
    borderRadius: 8,
  },
  stopIconSquare: {
    width: 10,
    height: 10,
    backgroundColor: '#FFF',
    borderRadius: 1,
  },
  stopButtonText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  /* ===== GRÁFICA ===== */
  chartContainer: {
    height: 80,
    marginBottom: 12,
    marginTop: -4,
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  statsLabel: { fontSize: 11, color: '#888' },
  statsRowValue: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statsValue: { fontSize: 14, fontWeight: '700', color: '#111' },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  trendText: { fontSize: 9, color: '#2E7D32', fontWeight: '700' },

  /* ===== PLACEHOLDER ===== */
  placeholderText: {
    fontSize: 12,
    color: '#888',
    marginTop: 8,
    textAlign: 'center',
  },
});
