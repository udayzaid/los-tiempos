import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { api, ReelGetDto } from '@/services/api';
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
          <Text style={styles.tiktokIcon}>♪</Text>

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

        <Text style={styles.viewAll}>
          Ver todos →
        </Text>
      </View>

      <FlatList
        data={reels}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, index) => item.tiktokVideoId + '-' + index}
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
  },

  tiktokIcon: {
    fontSize: 20,
    fontWeight: '900',
    color: '#111',
    marginRight: 7,
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
  },

  viewAll: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111',
    marginLeft: 12,
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