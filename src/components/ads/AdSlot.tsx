import React, { useEffect, useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

type AdItem = {
  imageUrl: string;
  alt?: string;
};

type AdSlotProps = {
  placement: 'left' | 'right';
};

const DEFAULT_AD_IMAGE =
  'https://www.honda.mx/web/img/motorcycles/home/slides/MASTER-998x1500-TORNADO.jpg';

// Publicidad de prueba. Posteriormente estas piezas pueden reemplazarse
// por creatividades reales proporcionadas/autorizadas por el anunciante.
const ADS: AdItem[] = [
  { imageUrl: DEFAULT_AD_IMAGE, alt: 'Publicidad' },
  { imageUrl: DEFAULT_AD_IMAGE, alt: 'Publicidad' },
  { imageUrl: DEFAULT_AD_IMAGE, alt: 'Publicidad' },
];

const ROTATION_MS = 10000;

export function AdSlot({ placement }: AdSlotProps) {
  const { width } = useWindowDimensions();
  const [currentIndex, setCurrentIndex] = useState(
    placement === 'right' ? 1 : 0
  );

  const currentAd = ADS[currentIndex];

  const adWidth = useMemo(() => {
    if (width >= 1800) return 190;
    if (width >= 1500) return 180;
    return 160;
  }, [width]);

  useEffect(() => {
    if (ADS.length < 2) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ADS.length);
    }, ROTATION_MS);

    return () => clearInterval(interval);
  }, []);

  const goPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + ADS.length) % ADS.length);
  };

  const goNext = () => {
    setCurrentIndex((prev) => (prev + 1) % ADS.length);
  };

  return (
    <View
      accessibilityLabel={'Publicidad ' + placement}
      style={[styles.slot, { width: adWidth }]}
    >
      <View style={styles.mediaFrame}>
        <Image
          source={{ uri: currentAd.imageUrl }}
          accessibilityLabel={currentAd.alt || 'Publicidad'}
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      <View style={styles.labelContainer}>
        <Text style={styles.label}>PUBLICIDAD</Text>
      </View>

      {ADS.length > 1 && (
        <>
          <Pressable
            accessibilityLabel="Publicidad anterior"
            onPress={goPrevious}
            style={({ pressed }) => [
              styles.arrowButton,
              styles.leftArrow,
              pressed && styles.arrowPressed,
            ]}
          >
            <Text style={styles.arrowText}>‹</Text>
          </Pressable>

          <Pressable
            accessibilityLabel="Publicidad siguiente"
            onPress={goNext}
            style={({ pressed }) => [
              styles.arrowButton,
              styles.rightArrow,
              pressed && styles.arrowPressed,
            ]}
          >
            <Text style={styles.arrowText}>›</Text>
          </Pressable>

          <View style={styles.indicator}>
            <Text style={styles.indicatorText}>
              {currentIndex + 1}/{ADS.length}
            </Text>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  slot: {
    alignSelf: 'stretch',
    flex: 1,
    minHeight: 460,
    maxHeight: 620,
    backgroundColor: '#F7F7F7',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
    position: 'relative',
  },

  mediaFrame: {
    flex: 1,
    width: '100%',
    minHeight: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 6,
    backgroundColor: '#F7F7F7',
  },

  image: {
    width: '100%',
    height: '100%',
  },

  labelContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    paddingVertical: 5,
    alignItems: 'center',
  },

  label: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },

  arrowButton: {
    position: 'absolute',
    top: '50%',
    marginTop: -15,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderWidth: 1,
    borderColor: '#D9D9D9',
    justifyContent: 'center',
    alignItems: 'center',
  },

  leftArrow: {
    left: 6,
  },

  rightArrow: {
    right: 6,
  },

  arrowPressed: {
    opacity: 0.65,
  },

  arrowText: {
    fontSize: 22,
    lineHeight: 24,
    fontWeight: '700',
    color: '#1A1A1A',
  },

  indicator: {
    position: 'absolute',
    right: 6,
    bottom: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },

  indicatorText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
