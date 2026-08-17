import { Platform } from 'react-native';

// Colores base de cada modo (claro/oscuro).
// Las claves deben coincidir con todo lo que usan ThemedText / ThemedView:
// 'text', 'textSecondary', 'background', 'backgroundElement', 'backgroundSelected'.
const light = {
  text: '#11181C',
  textSecondary: '#687076',
  background: '#FFFFFF',
  backgroundElement: '#F2F2F2',
  backgroundSelected: '#E4E4E4',
  tint: '#0a7ea4',
  icon: '#687076',
  border: '#E5E5E5',
};

const dark = {
  text: '#ECEDEE',
  textSecondary: '#9BA1A6',
  background: '#151718',
  backgroundElement: '#1F2223',
  backgroundSelected: '#2A2D2E',
  tint: '#FFFFFF',
  icon: '#9BA1A6',
  border: '#2A2D2E',
};

export const Colors = { light, dark };

// Tipo de clave de color válida, usado por ThemedText (themeColor) y ThemedView (type)
export type ThemeColor = keyof typeof light;

export const Fonts = Platform.select({
  ios: {
    mono: 'Menlo',
  },
  android: {
    mono: 'monospace',
  },
  default: {
    mono: 'monospace',
  },
  web: {
    mono: "'SFMono-Regular', Menlo, Consolas, 'Liberation Mono', monospace",
  },
});

// Escala de espaciado usada en paddings/gaps/border-radius (app-tabs, explore, etc.)
export const Spacing = {
  one: 4,
  two: 8,
  three: 12,
  four: 16,
  five: 24,
};

// Ancho máximo de contenido centrado (usado en la barra de tabs y en explore)
export const MaxContentWidth = 960;

// Espacio inferior reservado para no chocar con la barra de tabs flotante en móvil
export const BottomTabInset = 80;