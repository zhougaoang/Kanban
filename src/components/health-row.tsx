import { StyleSheet, Text, View, type DimensionValue } from "react-native";

import { theme } from "@/constants/theme";

interface Props {
  emoji: string;
  label: string;
  value: string; // 已格式化的数值文本，如 "1200 / 2000 ml"
  /** 0-100 */
  pct: number;
  tint?: string;
}

/** 健康单行：emoji 圆底 + 标题/数值 + 右侧迷你进度条。 */
export default function HealthRow({ emoji, label, value, pct, tint = theme.colors.primary }: Props) {
  const width = `${Math.max(0, Math.min(100, pct))}%` as DimensionValue;
  return (
    <View style={styles.row}>
      <View style={styles.emojiBox}>
        <Text style={styles.emoji}>{emoji}</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width, backgroundColor: tint }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.sm,
  },
  emojiBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.background,
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.md,
  },
  emoji: { fontSize: 18 },
  body: { flex: 1 },
  label: { fontSize: 13, color: theme.colors.textSecondary },
  value: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.text,
    marginTop: 2,
    fontVariant: ["tabular-nums"],
  },
  track: {
    width: 64,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.track,
    overflow: "hidden",
    marginLeft: theme.spacing.md,
  },
  fill: { height: "100%", borderRadius: 3 },
});
