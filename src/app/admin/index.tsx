import { VideoPlayer } from '@/components/live/VideoPlayer';
import { LiveHeader } from '@/components/live/LiveHeader';
import { LiveTheme } from '@/constants/live-theme';
import { useAuth } from '@/context/AuthContext';
import { useLiveHub } from '@/context/LiveHubContext';
import { api, type StreamHistoryItem } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import * as signalR from '@microsoft/signalr';
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
import { StreamChatHistoryModal } from '@/components/admin/StreamChatHistoryModal';
import type { StreamCredentials } from '@/types/stream';

/* =========================================================
   TIPOS
========================================================= */



type Feedback = {
  type: 'success' | 'error' | 'info' | null;
  message: string;
};

type AdminSection = 'live' | 'content' | 'users' | 'settings';

type ActiveStream = {
  titulo?: string;
  descripcion?: string;
};

type LiveConnectionSample = {
  timestampUtc: string;
  connectedCount: number;
};

type LiveStatistics = {
  connectedCount: number;
  peakConnectedCount: number;
  history: LiveConnectionSample[];
};

const LIVE_HUB_URL = 'https://lostiemposapi20260817104248-avbkfhcfcucgf9e0.centralus-01.azurewebsites.net/hubs/live';

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
  const { liveInfo } = useLiveHub();

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
  const [selectedChatStream, setSelectedChatStream] = useState<StreamHistoryItem | null>(null);
  const [recentStreamsLoading, setRecentStreamsLoading] = useState(true);
  const [recentStreamsError, setRecentStreamsError] = useState('');
  const [streamsPageIndex, setStreamsPageIndex] = useState(1);
  const [streamsPagination, setStreamsPagination] = useState({
    totalPages: 1,
    totalCount: 0,
    hasPreviousPage: false,
    hasNextPage: false,
  });
  const [connectedCount, setConnectedCount] = useState(0);
  const [peakConnectedCount, setPeakConnectedCount] = useState(0);
  const [liveHistory, setLiveHistory] = useState<LiveConnectionSample[]>([]);

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

  const hasActiveStream = liveInfo ? liveInfo.isLive : Boolean(activeStream);

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
      } else {
        setActiveStream(null);
      }
    } catch {
      setActiveStream(null);
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

  useEffect(() => {
    if (authLoading || !isAuthenticated || !isAdmin) return;

    let mounted = true;
    const metricsConnection = new signalR.HubConnectionBuilder()
      .withUrl(LIVE_HUB_URL, { withCredentials: true })
      .withAutomaticReconnect()
      .build();

    metricsConnection.on('LiveStats', (stats: LiveStatistics) => {
      if (!mounted) return;
      setConnectedCount(stats.connectedCount ?? 0);
      setPeakConnectedCount(stats.peakConnectedCount ?? 0);
      setLiveHistory(Array.isArray(stats.history) ? stats.history : []);
    });
    metricsConnection.onreconnecting((error) => {
      if (mounted) console.warn('[Admin] El Hub de métricas está reconectando:', error);
    });
    metricsConnection.onclose((error) => {
      if (mounted) console.warn('[Admin] El Hub de métricas se desconectó:', error);
    });

    const metricsStart = (async () => {
      let attempt = 0;
      while (mounted) {
        try {
          await metricsConnection.start();
          return;
        } catch (error) {
          if (!mounted) return;
          const delay = Math.min(1000 * 2 ** attempt, 15000);
          console.warn(`[Admin] Falló el inicio del Hub de métricas; nuevo intento en ${delay / 1000}s.`, error);
          attempt += 1;
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    })();

    return () => {
      mounted = false;
      void metricsStart.then(async () => {
        try {
          await metricsConnection.stop();
        } catch (error) {
          console.error('[Admin] Error cerrando el Hub de métricas:', error);
        }
      }).catch(() => {
        // Si el arranque falla, no hay una conexión activa que detener.
      });
    };
  }, [authLoading, isAuthenticated, isAdmin]);

  const chartSamples = liveHistory.slice(-30);
  const chartScale = Math.max(peakConnectedCount, ...chartSamples.map((sample) => sample.connectedCount), 1);
  const chartPath = chartSamples
    .map((sample, index) => {
      const x = chartSamples.length === 1 ? 150 : (index / (chartSamples.length - 1)) * 300;
      const y = 72 - (sample.connectedCount / chartScale) * 60;
      return `${index === 0 ? 'M' : 'L'}${x},${y}`;
    })
    .join(' ');

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
      void loadRecentStreams(streamsPageIndex);
      showFeedback(
        'success',
        response?.message || 'Transmisión finalizada correctamente.'
      );
    } catch (error: any) {
      const errorMsg = error?.message || '';
      if (errorMsg.includes('No existe live activo') || errorMsg.includes('null')) {
        setActiveStream(null);
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
    if (activeSection === 'content') return 'Organiza los contenidos publicados en la página principal.';
    if (activeSection === 'users') return 'Gestión de usuarios registrados.';
    if (activeSection === 'settings') return 'Configuración general del panel.';
    return 'Resumen general de la plataforma en tiempo real.';
  };

  const getSectionTitle = () => {
    if (activeSection === 'content') return 'Gestión de contenido';
    if (activeSection === 'users') return 'Usuarios';
    if (activeSection === 'settings') return 'Configuración';
    return 'Gestión de Live';
  };

  // -------- RENDER DE CARGA / BLOQUEO --------
  if (authLoading || !isAuthenticated || !isAdmin) {
    return (
      <View style={styles.authLoading}>
        <ActivityIndicator size="large" color={LiveTheme.gold} />
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
      <StreamChatHistoryModal
        key={selectedChatStream?.broadcastId ?? 'closed-stream-chat'}
        visible={Boolean(selectedChatStream)}
        broadcastId={selectedChatStream?.broadcastId ?? ''}
        streamName={selectedChatStream?.nombre ?? 'Transmisión'}
        onClose={() => setSelectedChatStream(null)}
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
          <Text style={[styles.sidebarBrand, isMobile && styles.sidebarBrandMobile]}>ADMINISTRACIÓN</Text>

          <TouchableOpacity
            style={[styles.sidebarItem, isMobile && styles.sidebarItemMobile, activeSection === 'live' && styles.sidebarItemActive]}
            onPress={() => setActiveSection('live')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="grid-outline"
              size={18}
              color={activeSection === 'live' ? LiveTheme.goldDark : LiveTheme.textMuted}
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
            style={[styles.sidebarItem, isMobile && styles.sidebarItemMobile, activeSection === 'content' && styles.sidebarItemActive]}
            onPress={() => setActiveSection('content')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="newspaper-outline"
              size={18}
              color={activeSection === 'content' ? LiveTheme.goldDark : LiveTheme.textMuted}
            />
            <Text style={activeSection === 'content' ? styles.sidebarTextActive : styles.sidebarText}>
              Gestión de contenido
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sidebarItem, isMobile && styles.sidebarItemMobile, activeSection === 'users' && styles.sidebarItemActive]}
            onPress={() => setActiveSection('users')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="people-outline"
              size={18}
              color={activeSection === 'users' ? LiveTheme.goldDark : LiveTheme.textMuted}
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
            style={[styles.sidebarItem, isMobile && styles.sidebarItemMobile, activeSection === 'settings' && styles.sidebarItemActive]}
            onPress={() => setActiveSection('settings')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="settings-outline"
              size={18}
              color={activeSection === 'settings' ? LiveTheme.goldDark : LiveTheme.textMuted}
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
          <View style={[styles.headerRow, isMobile && styles.headerRowMobile]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.pageTitle}>{getSectionTitle()}</Text>
              <Text style={styles.pageSubtitle}>{getSectionSubtitle()}</Text>
            </View>

            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>SISTEMA ACTIVO</Text>
            </View>
          </View>

          {/* CREAR NUEVO LIVE */}
          {activeSection === 'live' && (
            <>
              <View style={styles.card}>
                <View style={styles.cardHeaderRow}>
                  <View style={[styles.cardIcon, { backgroundColor: '#FFF8E1' }]}>
                    <Ionicons name="add" size={18} color={LiveTheme.goldDark} />
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
                      <ActivityIndicator color={LiveTheme.gold} size="small" />
                    ) : (
                      <>
                        <Ionicons name="radio-outline" size={14} color={LiveTheme.gold} />
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
                    <Ionicons name="time-outline" size={16} color={LiveTheme.goldDark} />
                  </View>
                  <Text style={styles.cardTitle}>Transmisiones Recientes</Text>
                </View>

                {recentStreamsLoading ? (
                  <View style={styles.recentMessage}>
                    <ActivityIndicator size="small" color={LiveTheme.goldDark} />
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
                      <View key={`${item.broadcastId || item.watchUrl}-${item.incio}-${index}`} style={[styles.recentRow, isMobile && styles.recentRowMobile]}>
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

                    <View style={[{ flex: 1, minWidth: 0 }, isMobile && styles.recentDetailsMobile]}>
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
                              isActive && { backgroundColor: LiveTheme.success },
                            ]}
                          />
                          <Text style={styles.recentStatusText}>{item.estado || 'Desconocido'}</Text>
                        </View>

                        <TouchableOpacity
                          style={[styles.detailsButton, !item.broadcastId && styles.btnDisabled]}
                          activeOpacity={0.8}
                          onPress={() => setSelectedChatStream(item)}
                          disabled={!item.broadcastId}
                          accessibilityLabel={`Ver chat de ${item.nombre || 'transmisión'}`}
                        >
                          <Ionicons name="chatbubbles-outline" size={14} color={LiveTheme.textSecondary} />
                          <Text style={styles.detailsButtonText}>Ver chat</Text>
                        </TouchableOpacity>

                      </View>
                    );
                  })
                )}

                {!recentStreamsLoading && !recentStreamsError && streamsPagination.totalCount > 0 && (
                  <View style={[styles.paginationRow, isMobile && styles.paginationRowMobile]}>
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

          {activeSection === 'content' && (
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <View style={[styles.cardIcon, styles.contentHeaderIcon]}>
                  <Ionicons name="layers-outline" size={17} color={LiveTheme.goldDark} />
                </View>
                <View style={styles.contentHeaderText}>
                  <Text style={styles.cardTitle}>Contenido del sitio</Text>
                  <Text style={styles.contentDescription}>
                    Secciones que aparecen en la página principal.
                  </Text>
                </View>
              </View>

              <View style={[styles.contentGrid, isMobile && styles.contentGridMobile]}>
                <View style={styles.contentTile}>
                  <View style={styles.contentTileIcon}>
                    <Ionicons name="newspaper-outline" size={20} color={LiveTheme.textSecondary} />
                  </View>
                  <Text style={styles.contentTileTitle}>Noticias</Text>
                  <Text style={styles.contentTileDescription}>
                    Publicaciones editoriales y noticias destacadas.
                  </Text>
                  <Text style={styles.contentTileState}>Catálogo conectado</Text>
                </View>

                <View style={styles.contentTile}>
                  <View style={styles.contentTileIcon}>
                    <Ionicons name="play-circle-outline" size={20} color={LiveTheme.textSecondary} />
                  </View>
                  <Text style={styles.contentTileTitle}>Reels y videos cortos</Text>
                  <Text style={styles.contentTileDescription}>
                    Videos breves que se muestran en la página principal.
                  </Text>
                  <Text style={styles.contentTileState}>Catálogo conectado</Text>
                </View>
              </View>

              <View style={styles.contentNotice}>
                <Ionicons name="information-circle-outline" size={17} color={LiveTheme.textSecondary} />
                <Text style={styles.contentNoticeText}>
                  La API disponible en este proyecto permite consultar estos contenidos; las acciones para crearlos o editarlos requieren endpoints de administración.
                </Text>
              </View>
            </View>
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
        {activeSection === 'live' && (
        <View style={[styles.rightColumn, isMobile && styles.rightColumnMobile]}>

          {/* ESTADO ACTUAL */}
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <Ionicons name="radio-outline" size={16} color={LiveTheme.textSecondary} />
              <Text style={styles.cardTitle}>Estado Actual</Text>
            </View>

            <View style={styles.liveStatusBox}>
              <View style={styles.liveStatusHeadline}>
                <View style={[styles.liveStatusDot, hasActiveStream && styles.liveStatusDotActive]} />
                <Text
                style={[
                  styles.liveStatusTitle,
                  !hasActiveStream && styles.liveStatusOffline,
                ]}
              >
                  {hasActiveStream ? 'EN VIVO AHORA' : 'SIN TRANSMISIÓN'}
                </Text>
              </View>
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
                <ActivityIndicator color={LiveTheme.white} size="small" />
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
                <ActivityIndicator color={LiveTheme.white} size="small" />
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
              <Ionicons name="stats-chart-outline" size={16} color={LiveTheme.textSecondary} />
              <Text style={styles.cardTitle}>Estadísticas actuales en tiempo real</Text>
            </View>

            {/* HISTORIAL DE CONEXIONES ENVIADO POR EL HUB */}
            <View style={styles.chartContainer}>
              <Svg height="80" width="100%" viewBox="0 0 300 80">
                {chartPath ? (
                  <Path
                    d={chartPath}
                    stroke={LiveTheme.gold}
                    strokeWidth="2"
                    fill="none"
                  />
                ) : null}
              </Svg>
            </View>

            <View style={styles.statsRow}>
              <Text style={styles.statsLabel}>Conectados ahora</Text>
              <Text style={styles.statsValue}>{connectedCount.toLocaleString('es-BO')}</Text>
            </View>

            <View style={styles.statsRow}>
              <Text style={styles.statsLabel}>Pico máximo</Text>
              <Text style={styles.statsValue}>{peakConnectedCount.toLocaleString('es-BO')}</Text>
            </View>

          </View>
        </View>
        )}
      </View>
    </ScrollView>
  );
}

/* =========================================================
   ESTILOS
========================================================= */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: LiveTheme.surfaceSoft },
  pageContent: { flexGrow: 1 },

  authLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  authLoadingText: { fontSize: 13, color: LiveTheme.textMuted },

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
    backgroundColor: LiveTheme.surface,
    borderRadius: LiveTheme.radius.lg,
    paddingVertical: LiveTheme.spacing.lg,
    paddingHorizontal: LiveTheme.spacing.sm,
    borderWidth: 1,
    borderColor: LiveTheme.border,
  },
  sidebarMobile: { width: '100%', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: LiveTheme.spacing.xs, paddingVertical: LiveTheme.spacing.md },

  sidebarBrand: {
    fontSize: 10,
    fontWeight: '700',
    color: LiveTheme.textMuted,
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
    borderRadius: LiveTheme.radius.md,
    marginBottom: 4,
  },
  sidebarItemMobile: { flexGrow: 1, minWidth: 120, justifyContent: 'center', marginBottom: 0, paddingHorizontal: LiveTheme.spacing.sm },
  sidebarBrandMobile: { width: '100%', marginBottom: 4 },
  sidebarItemActive: { backgroundColor: LiveTheme.surfaceSoft },
  sidebarText: { fontSize: 12, color: LiveTheme.textSecondary, fontWeight: '500' },
  sidebarTextActive: { fontSize: 12, color: LiveTheme.goldDark, fontWeight: '700' },

  /* ===== COLUMNA CENTRAL ===== */
  mainColumn: { flex: 1, minWidth: 0, gap: 16 },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 4,
    gap: 10,
  },
  headerRowMobile: { flexDirection: 'column', alignItems: 'stretch' },
  pageTitle: { fontSize: 26, fontWeight: '800', color: LiveTheme.text },
  pageSubtitle: { fontSize: 12, color: LiveTheme.textMuted, marginTop: 2 },

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
    backgroundColor: LiveTheme.success,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '700',
    color: LiveTheme.success,
    letterSpacing: 0.5,
  },

  /* ===== CARD GENÉRICA ===== */
  card: {
    backgroundColor: LiveTheme.surface,
    borderRadius: LiveTheme.radius.lg,
    padding: LiveTheme.spacing.lg,
    borderWidth: 1,
    borderColor: LiveTheme.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.035,
    shadowRadius: 6,
    elevation: 1,
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
  cardTitle: { fontSize: 15, fontWeight: '700', color: LiveTheme.text, flexShrink: 1 },
  contentHeaderIcon: { backgroundColor: LiveTheme.surfaceSoft },
  contentHeaderText: { flex: 1, minWidth: 0 },
  contentDescription: { fontSize: 11, color: LiveTheme.textMuted, marginTop: 3 },
  contentGrid: { flexDirection: 'row', gap: LiveTheme.spacing.md },
  contentGridMobile: { flexDirection: 'column' },
  contentTile: {
    flex: 1,
    minWidth: 0,
    padding: LiveTheme.spacing.lg,
    borderWidth: 1,
    borderColor: LiveTheme.border,
    borderRadius: LiveTheme.radius.md,
    backgroundColor: LiveTheme.white,
  },
  contentTileIcon: {
    width: 38,
    height: 38,
    borderRadius: LiveTheme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: LiveTheme.surfaceSoft,
    marginBottom: LiveTheme.spacing.md,
  },
  contentTileTitle: { fontSize: 14, fontWeight: '700', color: LiveTheme.text },
  contentTileDescription: { fontSize: 11, lineHeight: 17, color: LiveTheme.textSecondary, marginTop: 5 },
  contentTileState: { fontSize: 10, fontWeight: '600', color: LiveTheme.success, marginTop: 14 },
  contentNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: LiveTheme.spacing.sm,
    marginTop: LiveTheme.spacing.lg,
    padding: LiveTheme.spacing.md,
    borderRadius: LiveTheme.radius.md,
    backgroundColor: LiveTheme.surfaceSoft,
  },
  contentNoticeText: { flex: 1, fontSize: 11, lineHeight: 17, color: LiveTheme.textSecondary },

  /* ===== FORM ===== */
  formLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: LiveTheme.textSecondary,
    marginBottom: 6,
    marginTop: 6,
  },
  formInput: {
    height: 42,
    borderWidth: 1,
    borderColor: LiveTheme.borderStrong,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 13,
    color: LiveTheme.text,
    backgroundColor: LiveTheme.surfaceSoft,
  },
  descriptionInput: {
    minHeight: 90,
    borderWidth: 1,
    borderColor: LiveTheme.borderStrong,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: LiveTheme.text,
    backgroundColor: LiveTheme.surfaceSoft,
  },
  counterText: {
    alignSelf: 'flex-end',
    fontSize: 10,
    color: LiveTheme.textMuted,
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
    backgroundColor: LiveTheme.black,
    paddingHorizontal: 20,
    height: 40,
    borderRadius: 8,
  },
  startButtonText: {
    color: LiveTheme.gold,
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
  feedbackSuccess: { color: LiveTheme.success, backgroundColor: '#EAF4EC' },
  feedbackError: { color: LiveTheme.error, backgroundColor: '#FDECEC' },
  feedbackInfo: { color: LiveTheme.info, backgroundColor: '#EEF4FF' },

  /* ===== TRANSMISIONES RECIENTES ===== */
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: LiveTheme.border,
  },
  recentRowMobile: { flexWrap: 'wrap', alignItems: 'flex-start' },
  recentDetailsMobile: { flexBasis: '60%' },
  recentThumb: {
    width: 90,
    height: 56,
    borderRadius: 6,
    backgroundColor: LiveTheme.surfaceSoft,
  },
  recentTitle: { fontSize: 12, fontWeight: '700', color: LiveTheme.text },
  recentCategory: { fontSize: 10, color: LiveTheme.goldDark, fontWeight: '600', marginTop: 1 },
  recentTime: { fontSize: 10, color: LiveTheme.textMuted, marginTop: 2 },
  recentAuthor: { fontSize: 10, color: LiveTheme.textMuted, marginTop: 1 },
  recentMessage: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  recentStats: { alignItems: 'flex-end', marginHorizontal: 8 },
  recentViewers: { fontSize: 12, fontWeight: '700', color: LiveTheme.text },
  recentViewersLabel: { fontSize: 9, color: LiveTheme.textMuted },
  recentStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: LiveTheme.surfaceSoft,
  },
  recentStatusOk: { backgroundColor: '#EAF4EC' },
  recentStatusDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: LiveTheme.textMuted,
  },
  recentStatusText: { fontSize: 10, color: LiveTheme.textSecondary, fontWeight: '600' },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: LiveTheme.borderStrong,
    marginHorizontal: 6,
  },
  detailsButtonText: { fontSize: 10, color: LiveTheme.textSecondary, fontWeight: '600' },
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingTop: 14,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: LiveTheme.border,
  },
  paginationRowMobile: { flexDirection: 'column', alignItems: 'stretch' },
  paginationInfo: { fontSize: 10, color: LiveTheme.textMuted, flex: 1 },
  paginationActions: { flexDirection: 'row', gap: 8 },
  paginationButton: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: LiveTheme.borderStrong,
    borderRadius: 6,
    backgroundColor: LiveTheme.surface,
  },
  paginationButtonText: { fontSize: 10, color: LiveTheme.textSecondary, fontWeight: '600' },

  /* ===== COLUMNA DERECHA ===== */
  rightColumn: { width: 300, gap: 16 },
  rightColumnMobile: { width: '100%' },

  liveStatusBox: {
    backgroundColor: LiveTheme.black,
    borderRadius: LiveTheme.radius.md,
    padding: 12,
    marginBottom: 12,
  },
  liveStatusHeadline: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  liveStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: LiveTheme.textMuted,
  },
  liveStatusDotActive: { backgroundColor: LiveTheme.liveRed },
  liveStatusTitle: {
    color: LiveTheme.gold,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  liveStatusOffline: { color: LiveTheme.textMuted },
  liveStatusInfo: { color: LiveTheme.surfaceSoft, fontSize: 11, marginTop: 2 },

  infoButton: {
    backgroundColor: LiveTheme.gold,
    height: 38,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  infoButtonText: { color: LiveTheme.black, fontSize: 12, fontWeight: '800' },

  stopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: LiveTheme.error,
    height: 38,
    borderRadius: 8,
  },
  stopIconSquare: {
    width: 10,
    height: 10,
    backgroundColor: LiveTheme.white,
    borderRadius: 1,
  },
  stopButtonText: {
    color: LiveTheme.white,
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
    borderBottomColor: LiveTheme.border,
  },
  statsLabel: { fontSize: 11, color: LiveTheme.textMuted },
  statsValue: { fontSize: 14, fontWeight: '700', color: LiveTheme.text },

  /* ===== PLACEHOLDER ===== */
  placeholderText: {
    fontSize: 12,
    color: LiveTheme.textMuted,
    marginTop: 8,
    textAlign: 'center',
  },
});
