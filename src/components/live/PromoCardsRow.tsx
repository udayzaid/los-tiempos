import { LiveTheme } from '@/constants/live-theme';
import { api, NoticiaItem, PagedResponse } from '@/services/api';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
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

  const [data, setData] =
    useState<PagedResponse<NoticiaItem> | null>(null);

  const [loading, setLoading] = useState(true);

  const translateX = useRef(
    new Animated.Value(0)
  ).current;

  const [currentOffset, setCurrentOffset] = useState(0);

  useEffect(() => {
    const loadNoticias = async () => {
      try {
        setLoading(true);

        const response = await api.getNoticias(1, 4);

        if (response) {
          setData(response);
        }
      } catch (error) {
        console.error(
          'Error cargando noticias:',
          error
        );
      } finally {
        setLoading(false);
      }
    };

    void loadNoticias();
  }, []);

  /*
   * Para la prueba del carrusel:
   *
   * Si el backend devuelve:
   *
   * 1 2 3 4
   *
   * temporalmente tendremos:
   *
   * 1 2 3 4 1 2 3 4
   *
   * Esto nos permite comprobar el desplazamiento
   * sin modificar el backend.
   */
  const carouselItems = useMemo(() => {
    if (!data?.items?.length) {
      return [];
    }

    return [
      ...data.items,
      ...data.items,
    ];
  }, [data]);

  /*
   * Calculamos cuánto ocupa una tarjeta.
   */
const cardWidth =
  width >= 1024
    ? (width - gap * 4) / 4.25
    : (width - gap * 4) / 5;
  /*
   * Cada clic desplaza exactamente una tarjeta.
   */
  const slideDistance =
    cardWidth + gap;

  const moveNext = () => {
    if (
      currentOffset >=
      carouselItems.length - 4
    ) {
      return;
    }

    const nextOffset =
      currentOffset + 1;

    Animated.timing(translateX, {
      toValue:
        -(nextOffset * slideDistance),
      duration: 450,
      useNativeDriver: true,
    }).start(() => {
      setCurrentOffset(nextOffset);
    });
  };

  const movePrevious = () => {
    if (currentOffset <= 0) {
      return;
    }

    const previousOffset =
      currentOffset - 1;

    Animated.timing(translateX, {
      toValue:
        -(previousOffset * slideDistance),
      duration: 450,
      useNativeDriver: true,
    }).start(() => {
      setCurrentOffset(previousOffset);
    });
  };

  const canMoveNext =
    currentOffset <
    carouselItems.length - 4;

  const canMovePrevious =
    currentOffset > 0;

  return (
    <View style={styles.container}>
      <View style={styles.contentRow}>
        <View style={styles.cardsArea}>

          {loading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator
                size="large"
                color={
                  LiveTheme.gold || '#FFD700'
                }
              />
            </View>
          ) : (
            <View style={styles.viewport}>

              <Animated.View
                style={[
                  styles.cardsTrack,
                  {
                    gap,
                    transform: [
                      {
                        translateX,
                      },
                    ],
                  },
                ]}
              >
                {carouselItems.map(
                  (item, index) => (
                    <View
                      key={`${item.titulo}-${index}`}
                      style={{
                        width:
                          columns === 4
                            ? cardWidth
                            : `${100 / columns}%`,
                      }}
                    >
                      <PromoCard
                        noticia={item}
                      />
                    </View>
                  )
                )}
              </Animated.View>

              {/* FLECHA IZQUIERDA */}
              {canMovePrevious && (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Noticias anteriores"
                  onPress={movePrevious}
                  style={({ pressed }) => [
                    styles.overlayArrow,
                    styles.overlayArrowLeft,
                    pressed &&
                      styles.overlayArrowPressed,
                  ]}
                >
                  <Text
                    style={
                      styles.overlayArrowText
                    }
                  >
                    ‹
                  </Text>
                </Pressable>
              )}

              {/* FLECHA DERECHA */}
              {canMoveNext && (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Siguientes noticias"
                  onPress={moveNext}
                  style={({ pressed }) => [
                    styles.overlayArrow,
                    styles.overlayArrowRight,
                    pressed &&
                      styles.overlayArrowPressed,
                  ]}
                >
                  <Text
                    style={
                      styles.overlayArrowText
                    }
                  >
                    ›
                  </Text>
                </Pressable>
              )}

            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 8,
    paddingVertical: 6,
  },

  contentRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },

  cardsArea: {
    flex: 1,
    minWidth: 0,
  },

  /*
   * Esta es nuestra ventana.
   *
   * Los cards pueden ser más anchos que ella,
   * pero solamente vemos los cuatro visibles.
   */
  viewport: {
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
  },

  /*
   * Esta es la fila que se mueve.
   */
  cardsTrack: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },

  loaderContainer: {
    height: 179,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /*
   * Botones de navegación.
   * Están encima de los cards.
   */
  overlayArrow: {
    position: 'absolute',

    top: '50%',
    marginTop: -18,

    width: 36,
    height: 36,

    borderRadius: 18,

    backgroundColor:
      'rgba(255,255,255,0.96)',

    borderWidth: 1,
    borderColor: '#D9D9D9',

    justifyContent: 'center',
    alignItems: 'center',

    zIndex: 20,

    shadowColor: '#000000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 1,
    },

    elevation: 4,
  },

  overlayArrowLeft: {
    left: 6,
  },

  overlayArrowRight: {
    right: 6,
  },

  overlayArrowPressed: {
    backgroundColor:
      LiveTheme.gold || '#FFD700',
  },

  overlayArrowText: {
    fontSize: 27,
    lineHeight: 29,
    fontWeight: '600',

    color:
      LiveTheme.black || '#1A1A1A',
  },
});