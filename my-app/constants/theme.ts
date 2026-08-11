/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

/**
 * Apple Liquid Glass 设计 token（light / dark）
 * 地面 #f5f5f7（cool）· 表面 #fff / #1c1c1e · accent #0071e3 / #0a84ff
 */
const tintColorLight = '#0071e3';
const tintColorDark = '#0a84ff';

export const Colors = {
  light: {
    text: '#1d1d1f',
    background: '#f5f5f7',
    tint: tintColorLight,
    icon: '#6e6e73',
    tabIconDefault: '#86868b',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#f5f5f7',
    background: '#000000',
    tint: tintColorDark,
    icon: '#a1a1a6',
    tabIconDefault: '#86868b',
    tabIconSelected: tintColorDark,
  },
};

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
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
