import { Image, StyleSheet, Text, View } from 'react-native';

type AdSlotProps = {
  placement: 'left' | 'right';
};

export function AdSlot({ placement }: AdSlotProps) {
  const adImage =
    'https://www.honda.mx/web/img/motorcycles/home/slides/MASTER-998x1500-TORNADO.jpg';

  return (
    <View
      accessibilityLabel={`Publicidad ${placement}`}
      style={styles.slot}
    >
      {/* Imagen de publicidad  */}
      <Image
        source={{ uri: adImage }}
        style={styles.image}
        resizeMode="cover"
      />

      {/* Etiqueta para indicar que es un espacio publicitario */}
      <View style={styles.labelContainer}>
        <Text style={styles.label}>
          PUBLICIDAD
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  slot: {
    width: 160,
    height: 300,

    backgroundColor: '#F7F7F7',

    borderWidth: 1,
    borderColor: '#E0E0E0',

    overflow: 'hidden',

    position: 'relative',
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
});