/**
 * Life OS 主题 —— Apple 风格：大圆角、大留白、少文字、大数字。
 */
export const theme = {
  colors: {
    background: "#F5F5F7",
    card: "#FFFFFF",
    primary: "#007AFF",
    text: "#1D1D1F",
    textSecondary: "#86868B",
    success: "#34C759",
    danger: "#FF3B30",
    border: "#E5E5EA",
    track: "#E9E9EE",
    star: "#FFB300",
  },
  radius: { large: 24, medium: 16, small: 12 },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 32 },
} as const;

export const EMOJI_PRESETS = [
  "💧", "🥗", "😴", "🏃", "📚", "🧘", "💪", "🌅",
  "✍️", "🎯", "🛏️", "🥦", "🚶", "🎸", "🧹", "💊",
] as const;
