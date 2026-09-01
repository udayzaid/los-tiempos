import { StyleSheet, View } from 'react-native';

type VideoPlayerProps = {
  videoUrl?: string;
};

export function VideoPlayer({ 
  videoUrl = 'https://youtu.be/2FrvoWyV9o8' 
}: VideoPlayerProps) {

  const getEmbedUrl = (url: string) => {
    if (!url) return 'https://www.youtube.com/embed/2FrvoWyV9o8?autoplay=1&mute=1';

    // Expresión regular mejorada para extraer exactamente los 11 caracteres del ID de YouTube
    const match = url.match(/(?:youtu\.be\/|watch\?v=|\/live\/|embed\/)([^#\&\?\/]{11})/);
    const videoId = match ? match[1] : '';

    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    }

    // Si por alguna razón no extrae la ID pero el string contiene embed, se asegura de incluir autoplay
    if (url.includes('youtube.com/embed/')) {
      return url.includes('?') ? `${url}&autoplay=1` : `${url}?autoplay=1`;
    }

    return url;
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
    aspectRatio: 960 / 580,
    backgroundColor: '#000000',
    borderRadius: 8,
    overflow: 'hidden',
  },
});