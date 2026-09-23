import { LiveTheme } from '@/constants/live-theme';
import { api, NoticiaItem, PagedResponse } from '@/services/api';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { PromoCard } from './PromoCard';

// Calcula cuántas columnas mostrar según el ancho disponible
function getColumns(width: number) {
  if (width >= 1024) return 4;
  if (width >= 640) return 2;
  return 1;
}

export function PromoCardsRow() {
  const { width } = useWindowDimensions();
  const columns = getColumns(width);
  const gap = 16;
  // % de ancho por tarjeta, restando el gap acumulado
  const cardWidthPercent = `${100 / columns}%` as const;

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

  const currentPage = data?.pageIndex ?? 1;
  const totalPages = data?.totalPages ?? 1;

  return (
    <View style={styles.container}>
      {/* CONTENIDO DE LAS TARJETAS */}
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={LiveTheme.gold || '#FFD700'} />
        </View>
      ) : (
        <View style={[styles.row, { marginHorizontal: -gap / 2 }]}>
          {data?.items.map((item) => (
            <View
              key={item.id}
              style={{
                width: cardWidthPercent,
                paddingHorizontal: gap / 2,
                marginBottom: gap,
              }}
            >
              <PromoCard noticia={item} />
            </View>
          ))}
        </View>
      )}

      {/* PAGINACIÓN */}
      <View style={styles.pagination}>
        <Pressable
          style={({ pressed }) => [
            styles.pageBtn,
            !data?.hasPreviousPage && styles.pageBtnDisabled,
            pressed && data?.hasPreviousPage && styles.pageBtnPressed,
          ]}
          onPress={handlePrev}
          disabled={!data?.hasPreviousPage || loading}
        >
          <Text
            style={[
              styles.pageBtnText,
              !data?.hasPreviousPage && styles.pageBtnTextDisabled,
            ]}
          >
            ‹
          </Text>
        </Pressable>

        <View style={styles.pagePill}>
          <Text style={styles.pagePillText}>
            {currentPage} <Text style={styles.pagePillTextMuted}>/ {totalPages}</Text>
          </Text>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.pageBtn,
            !data?.hasNextPage && styles.pageBtnDisabled,
            pressed && data?.hasNextPage && styles.pageBtnPressed,
          ]}
          onPress={handleNext}
          disabled={!data?.hasNextPage || loading}
        >
          <Text
            style={[
              styles.pageBtnText,
              !data?.hasNextPage && styles.pageBtnTextDisabled,
            ]}
          >
            ›
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  loaderContainer: {
    height: 179,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 16,
  },
  pageBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: LiveTheme.gold || '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageBtnPressed: {
    backgroundColor: LiveTheme.gold || '#FFD700',
  },
  pageBtnDisabled: {
    borderColor: '#E2E2E2',
    backgroundColor: '#F7F7F7',
  },
  pageBtnText: {
    fontSize: 18,
    fontWeight: '700',
    color: LiveTheme.black || '#1A1A1A',
    lineHeight: 20,
  },
  pageBtnTextDisabled: {
    color: '#C4C4C4',
  },
  pagePill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#F5F1E6',
  },
  pagePillText: {
    fontSize: 13,
    fontWeight: '800',
    color: LiveTheme.black || '#1A1A1A',
  },
  pagePillTextMuted: {
    fontWeight: '600',
    color: LiveTheme.textMuted || '#888888',
  },
});