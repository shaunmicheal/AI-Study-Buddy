/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#2D2D2D',
    background: '#F5F1E8',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#E8E4D8',
    textSecondary: '#666666',
    primary: '#6B7D3A',
    accent: '#D4A72C',
    placeholder: '#999999',
    error: '#D32F2F',
    success: '#4CAF50',
    loading: '#6B7D3A',
    shadow: 'rgba(0, 0, 0, 0.1)',
    white: '#FFFFFF',
    card: '#FFFFFF',
  },
  dark: {
    text: '#FFFFFF',
    background: '#1A1A1A',
    backgroundElement: '#2D2D2D',
    backgroundSelected: '#3D3D3D',
    textSecondary: '#B0B0B0',
    primary: '#8FA64B',
    accent: '#E6C445',
    placeholder: '#888888',
    error: '#FF6B6B',
    success: '#66BB6A',
    loading: '#8FA64B',
    shadow: 'rgba(0, 0, 0, 0.3)',
    white: '#FFFFFF',
    card: '#2D2D2D',
  },
};

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 12,
  four: 16,
  five: 20,
  six: 24,
  eight: 32,
  ten: 40,
  twelve: 48,
  sixteen: 64,
};

export const BorderRadius = {
  small: 8,
  medium: 12,
  large: 16,
  extraLarge: 24,
};

export const Typography = {
  fontSize: {
    small: 14,
    medium: 16,
    large: 18,
    xlarge: 24,
    xxlarge: 32,
  },
  fontWeight: {
    normal: 'normal',
    medium: '500',
    bold: 'bold',
  },
};

export const Shadows = {
  small: {
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: 'rgba(0, 0, 0, 0.2)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
};

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 34;
export const MaxContentWidth = 400;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});