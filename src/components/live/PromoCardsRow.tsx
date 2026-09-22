import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { LiveTheme } from '@/constants/live-theme';
import { PromoCard } from './PromoCard';
import { api, NoticiaItem, PagedResponse } from '@/services/api'; // Asegúrate de que la ruta apunte a tu archivo api.ts

export function PromoCardsRow() {
  const { width } = useWindowDimensions();
  const isWide = width >= 768;

  const [pageIndex, setPageIndex] = useState<number>(1);
  const pageSize = 4;

  const [data, setData] = useState<PagedResponse<NoticiaItem> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchNoticias = async (page: number) => {
    setLoading(true);
    const response = await api.getNoticias(page, pageSize);
    if (response) {
      setData(response);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNoticias(pageIndex);
  }, [pageIndex]);

  const handlePrev = () => {
    if (data?.hasPreviousPage) {
      setPageIndex((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (data?.hasNextPage) {
      setPageIndex((prev) => prev + 1);
    }
  };

  return (
    <View style={styles.container}>
      {/* CONTROLES DE PAGINACIÓN / FLECHAS */}
      <View style={styles.paginationHeader}>
        <Text style={styles.pageIndicator}>
          Página {data?.pageIndex ?? 1} de {data?.totalPages ?? 1}
        </Text>

        <View style={styles.arrowsContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.arrowButton,
              !data?.hasPreviousPage && styles.arrowDisabled,
              pressed && styles.arrowPressed,
            ]}
            onPress={handlePrev}
            disabled={!data?.hasPreviousPage || loading}
          >
            <Text style={styles.arrowText}>‹</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.arrowButton,
              !data?.hasNextPage && styles.arrowDisabled,
              pressed && styles.arrowPressed,
            ]}
            onPress={handleNext}
            disabled={!data?.hasNextPage || loading}
          >
            <Text style={styles.arrowText}>›</Text>
          </Pressable>
        </View>
      </View>

      {/* CONTENIDO DE LAS TARJETAS */}
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={LiveTheme.gold || '#FFD700'} />
        </View>
      ) : (
        <View style={[styles.row, !isWide && styles.rowNarrow]}>
          {data?.items.map((item) => (
            <PromoCard key={item.id} noticia={item} />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  paginationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  pageIndicator: {
    fontSize: 12,
    fontWeight: '600',
    color: LiveTheme.textMuted || '#888888',
  },
  arrowsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  arrowButton: {
    width: 32,
    height: 32,
    backgroundColor: LiveTheme.black || '#1A1A1A',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowDisabled: {
    backgroundColor: '#E2E2E2',
  },
  arrowPressed: {
    opacity: 0.7,
  },
  arrowText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 22,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
  },
  rowNarrow: {
    flexDirection: 'column',
  },
  loaderContainer: {
    height: 179,
    justifyContent: 'center',
    alignItems: 'center',
  },
});