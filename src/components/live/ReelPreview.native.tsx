import React from 'react';
import { View } from 'react-native';

interface ReelPreviewProps {
  videoId: string;
  active: boolean;
  duration?: number;
}

export const ReelPreview: React.FC<ReelPreviewProps> = () => {
  return <View />;
};