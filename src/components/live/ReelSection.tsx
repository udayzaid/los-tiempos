import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { api, ReelGetDto } from '@/services/api'; // Ajusta la ruta a tu api.ts
import { ReelCard } from './ReelCard';

export const ReelSection: React.FC = () => {
  const [reels, setReels] = useState<ReelGetDto[]>([]);
  const [pageIndex, setPageIndex] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchReels = async (page: number) => {
    if (loading || (page > 1 && !hasNextPage)) return;

    if (page === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      const response = await api.getReels(page, 10);
      
      setReels((prev) => (page === 1 ? response.items : [...prev, ...response.items]));
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

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="small" color="#FF004F" />
      </View>
    );
  }

  if (reels.length === 0) return null;

  return (
    <View style={styles.container} role="region" aria-label="Reels y cortos">
      <Text style={styles.sectionTitle} role="heading" aria-level={2}>Reels & Cortos</Text>
      
      <FlatList
        data={reels}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, index) => `${item.tiktokVideoId}-${index}`}
        renderItem={({ item }) => <ReelCard item={item} />}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        contentContainerStyle={styles.listContent}
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator size="small" color="#FF004F" />
            </View>
          ) : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  listContent: {
    paddingLeft: 16,
    paddingRight: 4,
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