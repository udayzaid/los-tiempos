import React from 'react';
import { StyleSheet, View } from 'react-native';

interface ReelPlayerProps {
  videoId: string;
}

export const ReelPlayer: React.FC<ReelPlayerProps> = ({ videoId }) => {
  const playerUrl =
    `https://www.tiktok.com/player/v1/${videoId}?controls=1&description=0&music_info=0&rel=0&fullscreen_button=1&loop=0`;

  return (
    <View style={styles.container}>
      <View style={styles.playerContainer}>
        <iframe
          src={playerUrl}
          title="TikTok Reel"
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            display: 'block',
          }}
          allow="fullscreen"
          scrolling="no"
          frameBorder="0"
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
    width: 320,
    maxWidth: '82%' as any, // En React Native se usan porcentajes en string
    aspectRatio: 9 / 16,
    backgroundColor: 'transparent',
    borderRadius: 12,
    overflow: 'hidden',
  },
});