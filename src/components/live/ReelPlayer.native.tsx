import React from 'react';
import { WebView } from 'react-native-webview';

interface ReelPlayerProps {
  videoId: string;
}

export const ReelPlayer: React.FC<ReelPlayerProps> = ({ videoId }) => {
  const embedUrl = `https://www.tiktok.com/embed/v2/${videoId}`;

  return (
    <WebView
      source={{ uri: embedUrl }}
      style={{ flex: 1, backgroundColor: '#000' }}
      allowsInlineMediaPlayback
      javaScriptEnabled
      domStorageEnabled
    />
  );
};