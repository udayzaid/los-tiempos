import { api, type NoticiaItem, type PagedResponse, type ReelGetDto } from '@/services/api';
import { LiveTheme } from '@/constants/live-theme';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

type ContentTab = 'news' | 'reels';
type Pagination = Pick<PagedResponse<unknown>, 'pageIndex' | 'totalPages' | 'totalCount' | 'hasPreviousPage' | 'hasNextPage'>;
const PAGE_SIZE = 10;
const EMPTY_PAGINATION: Pagination = {
  pageIndex: 1,
  totalPages: 1,
  totalCount: 0,
  hasPreviousPage: false,
  hasNextPage: false,
};

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value || '—' : date.toLocaleDateString('es-BO');
}

export function ContentManagementPanel() {
  const [tab, setTab] = useState<ContentTab>('news');
  const [news, setNews] = useState<NoticiaItem[]>([]);
  const [reels, setReels] = useState<ReelGetDto[]>([]);
  const [newsPage, setNewsPage] = useState(1);
  const [reelsPage, setReelsPage] = useState(1);
  const [newsPagination, setNewsPagination] = useState(EMPTY_PAGINATION);
  const [reelsPagination, setReelsPagination] = useState(EMPTY_PAGINATION);
  const [newsLoading, setNewsLoading] = useState(true);
  const [reelsLoading, setReelsLoading] = useState(false);
  const [newsError, setNewsError] = useState('');
  const [reelsError, setReelsError] = useState('');
  const [newsUrl, setNewsUrl] = useState('');
  const [reelUrl, setReelUrl] = useState('');
  const [creatingNews, setCreatingNews] = useState(false);
  const [creatingReel, setCreatingReel] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDeleteReelId, setConfirmDeleteReelId] = useState<number | null>(null);
  const [deletingReelId, setDeletingReelId] = useState<number | null>(null);
  const [notice, setNotice] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);

  const loadNews = useCallback(async (page: number) => {
    setNewsLoading(true);
    setNewsError('');
    try {
      const result = await api.getAllNoticias(page, PAGE_SIZE);
      setNews(result.items ?? []);
      setNewsPage(result.pageIndex ?? page);
      setNewsPagination({
        pageIndex: result.pageIndex ?? page,
        totalPages: result.totalPages ?? 1,
        totalCount: result.totalCount ?? 0,
        hasPreviousPage: result.hasPreviousPage ?? page > 1,
        hasNextPage: result.hasNextPage ?? false,
      });
    } catch (error: any) {
      setNews([]);
      setNewsError(error?.message || 'No se pudieron cargar las noticias.');
    } finally {
      setNewsLoading(false);
    }
  }, []);

  const loadReels = useCallback(async (page: number) => {
    setReelsLoading(true);
    setReelsError('');
    try {
      const result = await api.getAllReels(page, PAGE_SIZE);
      setReels(result.items ?? []);
      setReelsPage(result.pageIndex ?? page);
      setReelsPagination({
        pageIndex: result.pageIndex ?? page,
        totalPages: result.totalPages ?? 1,
        totalCount: result.totalCount ?? 0,
        hasPreviousPage: result.hasPreviousPage ?? page > 1,
        hasNextPage: result.hasNextPage ?? false,
      });
    } catch (error: any) {
      setReels([]);
      setReelsError(error?.message || 'No se pudieron cargar los reels.');
    } finally {
      setReelsLoading(false);
    }
  }, []);

  useEffect(() => { void loadNews(newsPage); }, [loadNews, newsPage]);
  useEffect(() => { void loadReels(reelsPage); }, [loadReels, reelsPage]);

  const handleCreateNews = async () => {
    const url = newsUrl.trim();
    if (!url) {
      setNotice({ kind: 'error', text: 'Ingresa la URL de la noticia.' });
      return;
    }

    try {
      new URL(url);
    } catch {
      setNotice({ kind: 'error', text: 'Ingresa una URL válida, incluyendo https://.' });
      return;
    }

    setCreatingNews(true);
    setNotice(null);
    try {
      await api.createNoticia(url);
      setNewsUrl('');
      setNotice({ kind: 'success', text: 'La noticia se agregó correctamente.' });
      if (newsPage === 1) void loadNews(1);
      else setNewsPage(1);
    } catch (error: any) {
      setNotice({ kind: 'error', text: error?.message || 'No se pudo agregar la noticia.' });
    } finally {
      setCreatingNews(false);
    }
  };

  const handleDeleteNews = async (item: NoticiaItem) => {
    if (item.id == null) return;

    setDeletingId(item.id);
    setNotice(null);
    try {
      await api.deleteNoticia(item.id);
      setConfirmDeleteId(null);
      setNotice({ kind: 'success', text: 'La noticia se eliminó correctamente.' });
      if (news.length === 1 && newsPage > 1) setNewsPage(newsPage - 1);
      else void loadNews(newsPage);
    } catch (error: any) {
      setNotice({ kind: 'error', text: error?.message || 'No se pudo eliminar la noticia.' });
    } finally {
      setDeletingId(null);
    }
  };

  const handleCreateReel = async () => {
    const url = reelUrl.trim();
    if (!url) {
      setNotice({ kind: 'error', text: 'Ingresa la URL del reel.' });
      return;
    }

    try {
      new URL(url);
    } catch {
      setNotice({ kind: 'error', text: 'Ingresa una URL válida, incluyendo https://.' });
      return;
    }

    setCreatingReel(true);
    setNotice(null);
    try {
      await api.createReel(url);
      setReelUrl('');
      setNotice({ kind: 'success', text: 'El reel se agregó correctamente.' });
      if (reelsPage === 1) void loadReels(1);
      else setReelsPage(1);
    } catch (error: any) {
      setNotice({ kind: 'error', text: error?.message || 'No se pudo agregar el reel.' });
    } finally {
      setCreatingReel(false);
    }
  };

  const handleDeleteReel = async (item: ReelGetDto) => {
    if (item.id == null) return;

    setDeletingReelId(item.id);
    setNotice(null);
    try {
      await api.deleteReel(item.id);
      setConfirmDeleteReelId(null);
      setNotice({ kind: 'success', text: 'El reel se eliminó correctamente.' });
      if (reels.length === 1 && reelsPage > 1) setReelsPage(reelsPage - 1);
      else void loadReels(reelsPage);
    } catch (error: any) {
      setNotice({ kind: 'error', text: error?.message || 'No se pudo eliminar el reel.' });
    } finally {
      setDeletingReelId(null);
    }
  };

  const openLink = (url: string) => {
    if (url) void Linking.openURL(url).catch((error) => console.error('No se pudo abrir el contenido:', error));
  };

  const currentLoading = tab === 'news' ? newsLoading : reelsLoading;
  const currentError = tab === 'news' ? newsError : reelsError;
  const currentPagination = tab === 'news' ? newsPagination : reelsPagination;
  const currentPage = tab === 'news' ? newsPage : reelsPage;
  const setCurrentPage = tab === 'news' ? setNewsPage : setReelsPage;

  return (
    <View style={styles.container}>
      <View style={styles.heading}>
        <View style={styles.headingIcon}>
          <Ionicons name="layers-outline" size={18} color={LiveTheme.goldDark} />
        </View>
        <View style={styles.headingCopy}>
          <Text style={styles.title}>Gestión de contenido</Text>
          <Text style={styles.subtitle}>Administra las noticias y consulta los reels publicados.</Text>
        </View>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, tab === 'news' && styles.tabActive]} onPress={() => setTab('news')}>
          <Ionicons name="newspaper-outline" size={16} color={tab === 'news' ? LiveTheme.goldDark : LiveTheme.textMuted} />
          <Text style={[styles.tabText, tab === 'news' && styles.tabTextActive]}>Noticias</Text>
          <Text style={styles.tabCount}>{newsPagination.totalCount}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab === 'reels' && styles.tabActive]} onPress={() => setTab('reels')}>
          <Ionicons name="play-circle-outline" size={17} color={tab === 'reels' ? LiveTheme.goldDark : LiveTheme.textMuted} />
          <Text style={[styles.tabText, tab === 'reels' && styles.tabTextActive]}>Reels</Text>
          <Text style={styles.tabCount}>{reelsPagination.totalCount}</Text>
        </TouchableOpacity>
      </View>

      {tab === 'news' && (
        <View style={styles.createCard}>
          <View style={styles.createHeading}>
            <View style={styles.createIcon}>
              <Ionicons name="add" size={17} color={LiveTheme.goldDark} />
            </View>
            <View>
              <Text style={styles.createTitle}>Agregar noticia</Text>
              <Text style={styles.createHelp}>Pega el enlace de la publicación para registrarla.</Text>
            </View>
          </View>
          <View style={styles.formRow}>
            <TextInput
              value={newsUrl}
              onChangeText={setNewsUrl}
              placeholder="https://www.lostiempos.com/..."
              placeholderTextColor={LiveTheme.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              style={styles.input}
              accessibilityLabel="URL de la noticia"
              onSubmitEditing={handleCreateNews}
            />
            <Pressable
              style={({ pressed }) => [styles.submitButton, (pressed || creatingNews) && styles.pressed, creatingNews && styles.disabled]}
              onPress={handleCreateNews}
              disabled={creatingNews}
            >
              {creatingNews ? <ActivityIndicator size="small" color={LiveTheme.black} /> : <Ionicons name="add" size={16} color={LiveTheme.black} />}
              <Text style={styles.submitText}>{creatingNews ? 'Agregando' : 'Agregar'}</Text>
            </Pressable>
          </View>
          {notice && (
            <Text style={[styles.notice, notice.kind === 'success' ? styles.successNotice : styles.errorNotice]}>
              {notice.text}
            </Text>
          )}
        </View>
      )}
      {tab === 'reels' && (
        <View style={styles.createCard}>
          <View style={styles.createHeading}>
            <View style={styles.createIcon}>
              <Ionicons name="add" size={17} color={LiveTheme.goldDark} />
            </View>
            <View>
              <Text style={styles.createTitle}>Agregar reel</Text>
              <Text style={styles.createHelp}>Pega el enlace del video para registrarlo.</Text>
            </View>
          </View>
          <View style={styles.formRow}>
            <TextInput
              value={reelUrl}
              onChangeText={setReelUrl}
              placeholder="https://www.tiktok.com/@.../video/..."
              placeholderTextColor={LiveTheme.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              style={styles.input}
              accessibilityLabel="URL del reel"
              onSubmitEditing={handleCreateReel}
            />
            <Pressable
              style={({ pressed }) => [styles.submitButton, (pressed || creatingReel) && styles.pressed, creatingReel && styles.disabled]}
              onPress={handleCreateReel}
              disabled={creatingReel}
            >
              {creatingReel ? <ActivityIndicator size="small" color={LiveTheme.black} /> : <Ionicons name="add" size={16} color={LiveTheme.black} />}
              <Text style={styles.submitText}>{creatingReel ? 'Agregando' : 'Agregar'}</Text>
            </Pressable>
          </View>
          {notice && (
            <Text style={[styles.notice, notice.kind === 'success' ? styles.successNotice : styles.errorNotice]}>
              {notice.text}
            </Text>
          )}
        </View>
      )}

      <View style={styles.listHeader}>
        <View>
          <Text style={styles.listTitle}>{tab === 'news' ? 'Noticias registradas' : 'Reels publicados'}</Text>
          <Text style={styles.listSubtitle}>{currentPagination.totalCount} elementos en el catálogo</Text>
        </View>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={() => tab === 'news' ? void loadNews(newsPage) : void loadReels(reelsPage)}
          disabled={currentLoading}
          accessibilityLabel="Actualizar lista"
        >
          {currentLoading ? <ActivityIndicator size="small" color={LiveTheme.textSecondary} /> : <Ionicons name="refresh-outline" size={16} color={LiveTheme.textSecondary} />}
        </TouchableOpacity>
      </View>

      {currentLoading ? (
        <View style={styles.stateBox}><ActivityIndicator color={LiveTheme.goldDark} /><Text style={styles.stateText}>Cargando {tab === 'news' ? 'noticias' : 'reels'}...</Text></View>
      ) : currentError ? (
        <View style={styles.stateBox}>
          <Text style={styles.errorNotice}>{currentError}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => tab === 'news' ? void loadNews(newsPage) : void loadReels(reelsPage)}>
            <Text style={styles.retryText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : tab === 'news' ? (
        news.length ? news.map((item) => (
          <View key={item.id ?? item.url}>
            <View style={styles.itemRow}>
              {item.urlImagen ? <Image source={{ uri: item.urlImagen }} style={styles.thumbnail} resizeMode="cover" /> : (
                <View style={styles.thumbnailPlaceholder}><Ionicons name="newspaper-outline" size={19} color={LiveTheme.textMuted} /></View>
              )}
              <View style={styles.itemCopy}>
                <Text style={styles.itemTitle} numberOfLines={2}>{item.titulo || 'Noticia sin título'}</Text>
                <Text style={styles.itemDescription} numberOfLines={1}>{item.categoria || item.descripcion || 'Sin categoría'}</Text>
                <Text style={styles.itemMeta}>{formatDate(item.fecha)}</Text>
              </View>
              <View style={styles.itemActions}>
                <TouchableOpacity style={styles.openButton} onPress={() => openLink(item.url)} disabled={!item.url} accessibilityLabel="Abrir noticia">
                  <Ionicons name="open-outline" size={16} color={LiveTheme.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.deleteButton, (item.id == null || deletingId === item.id) && styles.disabled]}
                  onPress={() => setConfirmDeleteId(confirmDeleteId === item.id ? null : item.id ?? null)}
                  disabled={item.id == null || deletingId === item.id}
                  accessibilityLabel={`Eliminar ${item.titulo || 'noticia'}`}
                >
                  {deletingId === item.id ? <ActivityIndicator size="small" color={LiveTheme.error} /> : <Ionicons name="trash-outline" size={16} color={LiveTheme.error} />}
                </TouchableOpacity>
              </View>
            </View>
            {confirmDeleteId === item.id && item.id != null && (
              <View style={styles.deleteConfirmation}>
                <Text style={styles.confirmationText}>¿Eliminar “{item.titulo || 'esta noticia'}”?</Text>
                <View style={styles.confirmationActions}>
                  <TouchableOpacity style={styles.cancelDeleteButton} onPress={() => setConfirmDeleteId(null)} disabled={deletingId === item.id}>
                    <Text style={styles.cancelDeleteText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.confirmDeleteButton} onPress={() => void handleDeleteNews(item)} disabled={deletingId === item.id}>
                    <Text style={styles.confirmDeleteText}>{deletingId === item.id ? 'Eliminando...' : 'Eliminar'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )) : <Text style={styles.emptyText}>Todavía no hay noticias registradas.</Text>
      ) : (
        reels.length ? reels.map((item, index) => (
          <View key={item.id ?? `${item.tiktokVideoId || item.link}-${index}`}>
            <View style={styles.itemRow}>
              {item.portadaUrl ? <Image source={{ uri: item.portadaUrl }} style={styles.thumbnail} resizeMode="cover" /> : (
                <View style={styles.thumbnailPlaceholder}><Ionicons name="play-circle-outline" size={19} color={LiveTheme.textMuted} /></View>
              )}
              <View style={styles.itemCopy}>
                <Text style={styles.itemTitle} numberOfLines={2}>{item.titulo || 'Reel sin título'}</Text>
                <Text style={styles.itemDescription} numberOfLines={1}>Video corto publicado</Text>
                <Text style={styles.itemMeta} numberOfLines={1}>{item.link || 'Enlace no disponible'}</Text>
              </View>
              <View style={styles.itemActions}>
                <TouchableOpacity style={styles.openButton} onPress={() => openLink(item.link)} disabled={!item.link} accessibilityLabel="Abrir reel">
                  <Ionicons name="open-outline" size={16} color={LiveTheme.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.deleteButton, (item.id == null || deletingReelId === item.id) && styles.disabled]}
                  onPress={() => setConfirmDeleteReelId(confirmDeleteReelId === item.id ? null : item.id ?? null)}
                  disabled={item.id == null || deletingReelId === item.id}
                  accessibilityLabel={`Eliminar ${item.titulo || 'reel'}`}
                >
                  {deletingReelId === item.id ? <ActivityIndicator size="small" color={LiveTheme.error} /> : <Ionicons name="trash-outline" size={16} color={LiveTheme.error} />}
                </TouchableOpacity>
              </View>
            </View>
            {confirmDeleteReelId === item.id && item.id != null && (
              <View style={styles.deleteConfirmation}>
                <Text style={styles.confirmationText}>¿Eliminar “{item.titulo || 'este reel'}”?</Text>
                <View style={styles.confirmationActions}>
                  <TouchableOpacity style={styles.cancelDeleteButton} onPress={() => setConfirmDeleteReelId(null)} disabled={deletingReelId === item.id}>
                    <Text style={styles.cancelDeleteText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.confirmDeleteButton} onPress={() => void handleDeleteReel(item)} disabled={deletingReelId === item.id}>
                    <Text style={styles.confirmDeleteText}>{deletingReelId === item.id ? 'Eliminando...' : 'Eliminar'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )) : <Text style={styles.emptyText}>Todavía no hay reels registrados.</Text>
      )}

      {!currentLoading && !currentError && currentPagination.totalCount > 0 && (
        <View style={styles.pagination}>
          <Text style={styles.paginationInfo}>Página {currentPage} de {currentPagination.totalPages}</Text>
          <View style={styles.paginationActions}>
            <TouchableOpacity
              style={[styles.pageButton, !currentPagination.hasPreviousPage && styles.disabled]}
              onPress={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={!currentPagination.hasPreviousPage}
            ><Text style={styles.pageButtonText}>Anterior</Text></TouchableOpacity>
            <TouchableOpacity
              style={[styles.pageButton, !currentPagination.hasNextPage && styles.disabled]}
              onPress={() => setCurrentPage(currentPage + 1)}
              disabled={!currentPagination.hasNextPage}
            ><Text style={styles.pageButtonText}>Siguiente</Text></TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: LiveTheme.surface, borderRadius: LiveTheme.radius.lg, borderWidth: 1, borderColor: LiveTheme.border, padding: LiveTheme.spacing.lg },
  heading: { flexDirection: 'row', alignItems: 'center', gap: 11, marginBottom: LiveTheme.spacing.lg },
  headingIcon: { width: 38, height: 38, borderRadius: LiveTheme.radius.md, backgroundColor: LiveTheme.surfaceSoft, alignItems: 'center', justifyContent: 'center' },
  headingCopy: { flex: 1, minWidth: 0 },
  title: { color: LiveTheme.text, fontSize: 16, fontWeight: '700' },
  subtitle: { color: LiveTheme.textMuted, fontSize: 11, marginTop: 3 },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: LiveTheme.border, marginBottom: LiveTheme.spacing.lg, gap: 8 },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 13, paddingVertical: 10, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: LiveTheme.goldDark },
  tabText: { color: LiveTheme.textMuted, fontSize: 12, fontWeight: '600' },
  tabTextActive: { color: LiveTheme.text },
  tabCount: { color: LiveTheme.textMuted, backgroundColor: LiveTheme.surfaceSoft, borderRadius: 10, overflow: 'hidden', fontSize: 9, paddingHorizontal: 6, paddingVertical: 2 },
  createCard: { padding: LiveTheme.spacing.md, borderWidth: 1, borderColor: LiveTheme.border, borderRadius: LiveTheme.radius.md, backgroundColor: LiveTheme.offWhite, marginBottom: LiveTheme.spacing.lg },
  createHeading: { flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 10 },
  createIcon: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#FFF1C2', alignItems: 'center', justifyContent: 'center' },
  createTitle: { color: LiveTheme.text, fontSize: 12, fontWeight: '700' },
  createHelp: { color: LiveTheme.textMuted, fontSize: 10, marginTop: 2 },
  formRow: { flexDirection: 'row', gap: 8 },
  input: { flex: 1, minWidth: 0, height: 40, borderWidth: 1, borderColor: LiveTheme.borderStrong, borderRadius: LiveTheme.radius.sm, paddingHorizontal: 11, backgroundColor: LiveTheme.white, color: LiveTheme.text, fontSize: 12 },
  submitButton: { minWidth: 98, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingHorizontal: 12, borderRadius: LiveTheme.radius.sm, backgroundColor: LiveTheme.gold },
  submitText: { color: LiveTheme.black, fontSize: 11, fontWeight: '700' },
  pressed: { opacity: 0.8 },
  disabled: { opacity: 0.45 },
  notice: { fontSize: 11, marginTop: 9 },
  successNotice: { color: LiveTheme.success },
  errorNotice: { color: LiveTheme.error },
  listHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  listTitle: { color: LiveTheme.text, fontSize: 13, fontWeight: '700' },
  listSubtitle: { color: LiveTheme.textMuted, fontSize: 10, marginTop: 3 },
  refreshButton: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: LiveTheme.border, borderRadius: LiveTheme.radius.sm },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 11, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: LiveTheme.border },
  thumbnail: { width: 68, height: 50, borderRadius: LiveTheme.radius.sm, backgroundColor: LiveTheme.surfaceSoft },
  thumbnailPlaceholder: { width: 68, height: 50, borderRadius: LiveTheme.radius.sm, backgroundColor: LiveTheme.surfaceSoft, alignItems: 'center', justifyContent: 'center' },
  itemCopy: { flex: 1, minWidth: 0 },
  itemTitle: { color: LiveTheme.text, fontSize: 12, fontWeight: '700' },
  itemDescription: { color: LiveTheme.textSecondary, fontSize: 10, marginTop: 3 },
  itemMeta: { color: LiveTheme.textMuted, fontSize: 9, marginTop: 3 },
  openButton: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: LiveTheme.border, borderRadius: LiveTheme.radius.sm },
  itemActions: { flexDirection: 'row', gap: 6 },
  deleteButton: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E9C7C7', borderRadius: LiveTheme.radius.sm, backgroundColor: '#FFF8F8' },
  deleteConfirmation: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', padding: 10, marginBottom: 5, borderRadius: LiveTheme.radius.sm, backgroundColor: '#FFF8F8', borderWidth: 1, borderColor: '#E9C7C7' },
  confirmationText: { flex: 1, minWidth: 140, color: LiveTheme.textSecondary, fontSize: 10 },
  confirmationActions: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  cancelDeleteButton: { paddingHorizontal: 9, paddingVertical: 6, borderRadius: LiveTheme.radius.sm, borderWidth: 1, borderColor: LiveTheme.borderStrong },
  cancelDeleteText: { color: LiveTheme.textSecondary, fontSize: 10, fontWeight: '600' },
  confirmDeleteButton: { paddingHorizontal: 9, paddingVertical: 6, borderRadius: LiveTheme.radius.sm, backgroundColor: LiveTheme.error },
  confirmDeleteText: { color: LiveTheme.white, fontSize: 10, fontWeight: '700' },
  stateBox: { minHeight: 110, alignItems: 'center', justifyContent: 'center', gap: 9, padding: 18 },
  stateText: { color: LiveTheme.textMuted, fontSize: 11, textAlign: 'center' },
  emptyText: { color: LiveTheme.textMuted, textAlign: 'center', fontSize: 11, paddingVertical: 24 },
  retryButton: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: LiveTheme.radius.sm, borderWidth: 1, borderColor: LiveTheme.borderStrong },
  retryText: { color: LiveTheme.textSecondary, fontSize: 10, fontWeight: '600' },
  pagination: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10, paddingTop: 13, marginTop: 3 },
  paginationInfo: { color: LiveTheme.textMuted, fontSize: 10 },
  paginationActions: { flexDirection: 'row', gap: 7 },
  pageButton: { paddingHorizontal: 11, paddingVertical: 7, borderRadius: LiveTheme.radius.sm, borderWidth: 1, borderColor: LiveTheme.borderStrong, backgroundColor: LiveTheme.white },
  pageButtonText: { color: LiveTheme.textSecondary, fontSize: 10, fontWeight: '600' },
});
