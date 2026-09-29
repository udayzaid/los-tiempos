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

function getColumns(width: number) {
  if (width >= 1024) return 4;
  if (width >= 640) return 2;
  return 1;
}

export function PromoCardsRow() {
  const { width } = useWindowDimensions();
  const columns = getColumns(width);
  const gap = width >= 1024 ? 10 : 12;
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

  return (
    <View style={styles.container}>
      <View style={styles.contentRow}>
        <View style={styles.cardsArea}>
          {loading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color={LiveTheme.gold || '#FFD700'} />
            </View>
          ) : (
            <View style={[styles.row, { marginHorizontal: -gap / 2 }]}>
              {data?.items.map((item) => (
                <View
                  key={item.titulo}
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

          {/* Flechas integradas en la zona de tarjetas */}
          {!loading && (
            <>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Noticias anteriores"
                onPress={handlePrev}
                disabled={!data?.hasPreviousPage}
                style={({ pressed }) => [
                  styles.overlayArrow,
                  styles.overlayArrowLeft,
                  !data?.hasPreviousPage && styles.overlayArrowDisabled,
                  pressed && data?.hasPreviousPage && styles.overlayArrowPressed,
                ]}
              >
                <Text style={styles.overlayArrowText}>‹</Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Siguientes noticias"
                onPress={handleNext}
                disabled={!data?.hasNextPage}
                style={({ pressed }) => [
                  styles.overlayArrow,
                  styles.overlayArrowRight,
                  !data?.hasNextPage && styles.overlayArrowDisabled,
                  pressed && data?.hasNextPage && styles.overlayArrowPressed,
                ]}
              >
                <Text style={styles.overlayArrowText}>›</Text>
              </Pressable>
            </>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingVertical: 6,
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
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardsArea: {
    flex: 1,
    minWidth: 0,
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
    zIndex: 10,
    shadowColor: '#000000',
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 3,
  },
  overlayArrowLeft: {
    left: 2,
  },
  overlayArrowRight: {
    right: 2,
  },
  overlayArrowDisabled: {
    opacity: 0.35,
  },
  overlayArrowPressed: {
    backgroundColor: LiveTheme.gold || '#FFD700',
  },
  overlayArrowText: {
    fontSize: 25,
    lineHeight: 28,
    fontWeight: '500',
    color: LiveTheme.black || '#1A1A1A',
  },
});