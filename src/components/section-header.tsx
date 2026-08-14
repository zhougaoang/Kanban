import { StyleSheet, Text, View } from "react-native";

import { theme } from "@/constants/theme";

/** 区块标题：左侧大标题 + 右侧可选辅助文字。 */
export default function SectionHeader({
  title,
  right,
}: {
  title: string;
  right?: string;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {right ? <Text style={styles.right}>{right}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: theme.colors.text,
  },
  right: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
});
