import type { ReactNode } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

/**
 * Apple Liquid Glass 设计 token（按明暗主题取）
 * 地面 #f5f5f7 / #000 · 表面 #fff / #1c1c1e · accent #0071e3 / #0a84ff
 * 状态色：成功绿 #34c759 / 未完成灰、橙 #ff9500（仅在状态标签等处使用）
 */
export type LiquidGlassTokens = {
  scheme: 'light' | 'dark';
  ground: string;
  surface: string;
  text: string;
  secondary: string;
  meta: string;
  hairline: string;
  accent: string;
  track: string;
  buttonText: string;
  /** 状态：已完成（绿） */
  success: string;
  successSoft: string;
  /** 状态：未完成 / 待处理（橙） */
  warning: string;
  warningSoft: string;
};

export function useTokens(): LiquidGlassTokens {
  const colorScheme = useColorScheme();
  const scheme = colorScheme ?? 'light';
  return {
    scheme,
    ground: Colors[scheme].background, // #f5f5f7 / #000
    surface: scheme === 'light' ? '#FFFFFF' : '#1C1C1E',
    text: Colors[scheme].text, // #1d1d1f / #f5f5f7
    secondary: scheme === 'light' ? '#424245' : '#a1a1a6',
    meta: Colors[scheme].icon, // #6e6e73 / #a1a1a6
    hairline: scheme === 'light' ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.12)',
    accent: Colors[scheme].tint, // #0071e3 / #0a84ff
    track: scheme === 'light' ? '#E8E8ED' : '#2C2C2E',
    buttonText: scheme === 'light' ? '#FFFFFF' : '#000000',
    success: scheme === 'light' ? '#34C759' : '#30D158',
    successSoft: scheme === 'light' ? 'rgba(52,199,89,0.14)' : 'rgba(48,209,88,0.16)',
    warning: scheme === 'light' ? '#FF9500' : '#FF9F0A',
    warningSoft: scheme === 'light' ? 'rgba(255,149,0,0.14)' : 'rgba(255,159,10,0.16)',
  };
}

/** 统一白色面板：圆角 18、hairline 描边、轻阴影（暗色模式无阴影） */
export function Panel({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const { surface, hairline, scheme } = useTokens();
  return (
    <View
      style={[
        styles.panel,
        { backgroundColor: surface, borderColor: hairline },
        scheme === 'light' && styles.panelShadow,
        style,
      ]}>
      {children}
    </View>
  );
}

/** 面板外小标题（iOS grouped section header：13px meta 灰） */
export function SectionTitle({ children }: { children: ReactNode }) {
  const { meta } = useTokens();
  return <Text style={[styles.sectionTitle, { color: meta }]}>{children}</Text>;
}

const styles = StyleSheet.create({
  panel: {
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 18,
  },
  panelShadow: {
    // panel tier 双层阴影，RN 取主层近似
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 24,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 6,
    marginLeft: 4,
  },
});
