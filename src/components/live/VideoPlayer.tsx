import { StyleSheet, View } from 'react-native';

type VideoPlayerProps = {
  videoUrl?: string;
};

export function VideoPlayer({ 
  videoUrl = 'https://youtu.be/2FrvoWyV9o8' 
}: VideoPlayerProps) {

  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    
    // Si ya viene formateado como embed
    if (url.includes('youtube.com/embed/')) return url;

    // Extrae el ID (funciona con links cortos como https://youtu.be/2FrvoWyV9o8)
    const match = url.match(/(?:youtu\.be\/|watch\?v=|\/live\/|embed\/)([^#\&\?]+)/);
    const videoId = match ? match[1] : '';

    return videoId
      ? `https://www.youtube.com/embed/${videoId}?autoplay=1`
      : url;
  };

  return (
    <View style={styles.container}>
      <iframe
        src={getEmbedUrl(videoUrl)}
        style={{ width: '100%', height: '100%', border: 'none' }}
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