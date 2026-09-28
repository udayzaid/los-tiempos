import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

interface ReelPreviewProps {
  videoId: string;
  active: boolean;
  duration?: number;
}

export const ReelPreview: React.FC<ReelPreviewProps> = ({
  videoId,
  active,
  duration = 5000,
}) => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [ready, setReady] = useState(false);

  const sendMessage = (type: string, value?: number) => {
    iframeRef.current?.contentWindow?.postMessage(
      {
        'x-tiktok-player': true,
        type,
        ...(value !== undefined ? { value } : {}),
      },
      '*'
    );
  };

  useEffect(() => {
    if (!active || !ready) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (ready) sendMessage('pause');
      return;
    }

    sendMessage('mute');
    sendMessage('play');

    timerRef.current = setTimeout(() => {
      sendMessage('pause');
    }, duration);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      sendMessage('pause');
    };
  }, [active, ready, duration]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const playerUrl =
    `https://www.tiktok.com/player/v1/${videoId}?autoplay=1&muted=1&controls=0&description=0&music_info=0&rel=0&fullscreen_button=0&loop=0&play_button=0&volume_control=0`;

  return (
    <View style={styles.container} pointerEvents="none">
      <iframe
        ref={iframeRef}
        src={playerUrl}
        title="TikTok Reel preview"
        style={styles.iframe}
        allow="autoplay; fullscreen"
        scrolling="no"
        frameBorder="0"
        onLoad={() => setReady(true)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  iframe: {
    width: '100%',
    height: '100%',
    border: 'none',
    display: 'block',
  },
});