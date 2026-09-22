import { StyleSheet, View } from 'react-native';

type VideoPlayerProps = {
  videoUrl?: string;
};

export function VideoPlayer({
  videoUrl = 'https://youtu.be/Zi-dsa7d5jM?si=E2XBC40NfOQtsz2j',
}: VideoPlayerProps) {
  const getEmbedUrl = (url: string) => {
    if (!url) {
      return 'https://www.youtube-nocookie.com/embed/KplVe8OILMc?controls=1&rel=0';
    }

    const match = url.match(
      /(?:youtu\.be\/|watch\?v=|\/live\/|embed\/)([^#&?\/]{11})/
    );

    const videoId = match ? match[1] : '';

    if (videoId) {
      return `https://www.youtube-nocookie.com/embed/${videoId}?controls=1&rel=0`;
    }

    if (url.includes('youtube.com/embed/')) {
      return url;
    }

    return url;
  };

  return (
    <View style={styles.container}>
      <iframe
        src={getEmbedUrl(videoUrl)}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          //transform: 'scale(1.40)',
          //transformOrigin: 'center center',
        }}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
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