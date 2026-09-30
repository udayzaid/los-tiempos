import { StyleSheet, View } from 'react-native';

type VideoPlayerProps = {
  videoUrl?: string;
};

export function VideoPlayer({
  videoUrl = '',
}: VideoPlayerProps) {
  return (
    <View style={styles.container}>
      {videoUrl ? (
        <iframe
          src={videoUrl}
          title="Transmisión de Los Tiempos"
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
          }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000000',
    borderRadius: 8,
    overflow: 'hidden',
  },
});
