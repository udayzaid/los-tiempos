import React from 'react';
import { StyleSheet, View } from 'react-native';

interface ReelPlayerProps {
  videoId: string;
}

export const ReelPlayer: React.FC<ReelPlayerProps> = ({ videoId }) => {
  const embedUrl = `https://www.tiktok.com/embed/v2/${videoId}`;

  return (
    <View style={styles.container}>
      <View style={styles.playerContainer}>
        <iframe
          src={embedUrl}
          title="TikTok Reel"
          style={styles.iframe}
          allow="autoplay; encrypted-media; fullscreen"
          scrolling="no"
          frameBorder="0"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },

  playerContainer: {
    width: 340,
    maxWidth: '85%',
    aspectRatio: 9 / 16,
    backgroundColor: 'transparent',
    borderRadius: 12,
    overflow: 'hidden',
  },

  iframe: {
    width: '100%',
    height: '100%',
    border: 'none',
    display: 'block',
    backgroundColor: 'transparent',
  },
});