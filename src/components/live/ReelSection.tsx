import React, { useEffect, useRef, useState } from 'react';
import { LiveTheme } from '@/constants/live-theme';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Pressable,
  Linking,
  StyleSheet,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons'; // Importamos los iconos de Expo
import { api, ReelGetDto } from '@/services/api';
import { ReelCard } from './ReelCard';

export const ReelSection: React.FC = () => {
  const listRef = useRef<FlatList<ReelGetDto>>(null);
  const [reels, setReels] = useState<ReelGetDto[]>([]);
  const [pageIndex, setPageIndex] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [listOffset, setListOffset] = useState(0);
  const [listWidth, setListWidth] = useState(0);
  const [viewportWidth, setViewportWidth] = useState(0);

  const fetchReels = async (page: number) => {
    if (loading || (page > 1 && !hasNextPage)) return;

    if (page === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      const response = await api.getReels(page, 10);

      setReels((prev) =>
        page === 1 ? response.items : [...prev, ...response.items]
      );
      setHasNextPage(response.hasNextPage);
      setPageIndex(response.pageIndex);
    } catch (error) {
      console.error('Error cargando los reels:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchReels(1);
  }, []);

  const handleLoadMore = () => {
    if (hasNextPage && !loadingMore) {
      fetchReels(pageIndex + 1);
    }
  };

  const scrollByCard = (direction: -1 | 1) => {
  const maxOffset = Math.max(0, listWidth - viewportWidth);

  const nextOffset = Math.max(
    0,
    Math.min(
      maxOffset,
      listOffset + direction * 122
    )
  );

  listRef.current?.scrollToOffset({
    offset: nextOffset,
    animated: true,
  });

  setListOffset(nextOffset);
};

  const canScrollPrevious = listOffset > 4;
  const canScrollNext = listOffset < listWidth - viewportWidth - 4;

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="small" color="#FF004F" />
      </View>
    );
  }

  if (reels.length === 0) return null;

  return (
    <View style={styles.container} role="region" aria-label="Videos cortos">
      <View style={styles.sectionHeader}>
        <View style={styles.headerTitleGroup}>
          {/* AQUÍ REEMPLAZAMOS EL TEXTO "♪" POR EL ICONO OFICIAL */}
          <FontAwesome5 
            name="tiktok" 
            size={18} 
            color="#111111" 
            style={styles.tiktokIcon} 
          />

          <Text
            style={styles.sectionTitle}
            role="heading"
            aria-level={2}
          >
            VIDEOS CORTOS
          </Text>

          <View style={styles.headerDivider} />

          <Text style={styles.sectionSubtitle}>
            Historias que te mantienen informado
          </Text>
        </View>

        <Pressable
          onPress={() => Linking.openURL('https://www.tiktok.com/@lostiemposbol')}
          accessibilityRole="link"
          accessibilityLabel="Ver todos los videos de Los Tiempos en TikTok"
          style={({ pressed }) => [styles.viewAllButton, pressed && styles.viewAllPressed]}
        >
          <Text style={styles.viewAll}>Ver todos →</Text>
        </Pressable>
      </View>

      <View
        style={styles.listViewport}
        onLayout={(event) => setViewportWidth(event.nativeEvent.layout.width)}
      >
        <FlatList
          ref={listRef}
          data={reels}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item, index) => item.tiktokVideoId + '-' + index}
          renderItem={({ item }) => <ReelCard item={item} />}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          onScrollEndDrag={(event) => setListOffset(event.nativeEvent.contentOffset.x)}
          onMomentumScrollEnd={(event) => setListOffset(event.nativeEvent.contentOffset.x)}
          onContentSizeChange={(width) => setListWidth(width)}
          scrollEventThrottle={16}
          contentContainerStyle={styles.listContent}
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color="#FF004F" />
              </View>
            ) : null
          }
        />

        {canScrollPrevious && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Reels anteriores"
            onPress={() => scrollByCard(-1)}
            style={({ pressed }) => [
              styles.overlayArrow,
              styles.overlayArrowLeft,
              pressed && styles.overlayArrowPressed,
            ]}
          >
            <Text style={styles.overlayArrowText}>‹</Text>
          </Pressable>
        )}

        {canScrollNext && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Siguientes reels"
            onPress={() => scrollByCard(1)}
            style={({ pressed }) => [
              styles.overlayArrow,
              styles.overlayArrowRight,
              pressed && styles.overlayArrowPressed,
            ]}
          >
            <Text style={styles.overlayArrowText}>›</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },

  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    minWidth: 0,
  },

  tiktokIcon: {
    marginRight: 8,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111',
    letterSpacing: 0.2,
  },

  headerDivider: {
    width: 1,
    height: 18,
    backgroundColor: '#CFCFCF',
    marginHorizontal: 10,
  },

  sectionSubtitle: {
    fontSize: 13,
    color: '#555',
    fontWeight: '500',
    flexShrink: 1,
  },

  viewAllButton: {
    marginLeft: 12,
    flexShrink: 0,
  },

  viewAllPressed: {
    opacity: 0.55,
  },

  viewAll: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111',
  },

  listContent: {
    paddingLeft: 16,
    paddingRight: 4,
  },

  listViewport: {
    position: 'relative',
  },

  overlayArrow: {
    position: 'absolute',
    top: '50%',
    marginTop: -18,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderWidth: 1,
    borderColor: '#D9D9D9',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
    shadowColor: '#000000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 4,
  },

  overlayArrowLeft: {
    left: 6,
  },

  overlayArrowRight: {
    right: 6,
  },

  overlayArrowPressed: {
    backgroundColor: LiveTheme.gold,
  },

  overlayArrowText: {
    fontSize: 27,
    lineHeight: 29,
    fontWeight: '600',
    color: '#1A1A1A',
  },

  centerContainer: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },

  footerLoader: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 60,
    height: 260,
  },
});
