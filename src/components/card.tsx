import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import type { PropsWithChildren } from "react";

import { theme } from "@/constants/theme";

/** 统一卡片：白底、圆角 24、内边距 20 —— 所有模块复用。 */
export default function Card({
  children,
  style,
}: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.large,
    borderCurve: "continuous",
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
  },
});
