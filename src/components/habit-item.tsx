import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { theme } from "@/constants/theme";
import type { Habit } from "@/store/useAppStore";
import { lightTap } from "@/utils/haptics";

interface Props {
  habit: Habit;
  done: boolean;
  streak: number;
  onToggle: () => void;
  onLongPress: () => void;
}

/** 习惯行：emoji + 名称 + 连续天数 + 打卡圆点。点击圆点/整行切换打卡。 */
export default function HabitItem({ habit, done, streak, onToggle, onLongPress }: Props) {
  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      onPress={() => {
        lightTap();
        onToggle();
      }}
      onLongPress={onLongPress}
      delayLongPress={400}
    >
      <View style={styles.emojiBox}>
        <Text style={styles.emoji}>{habit.emoji}</Text>
      </View>
      <View style={styles.body}>
        <Text style={[styles.name, done && styles.nameDone]} numberOfLines={1}>
          {habit.name}
        </Text>
        {streak > 0 ? (
          <Text style={styles.streak}>🔥 连续 {streak} 天</Text>
        ) : (
          <Text style={styles.streakMuted}>今日未打卡</Text>
        )}
      </View>
      <View style={[styles.dot, done && styles.dotDone]}>
        {done ? (
          <Ionicons name="checkmark" size={16} color="#FFFFFF" />
        ) : (
          <View style={styles.dotHollow} />
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  pressed: { opacity: 0.6 },
  emojiBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: theme.colors.background,
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.md,
  },
  emoji: { fontSize: 20 },
  body: { flex: 1 },
  name: { fontSize: 16, fontWeight: "600", color: theme.colors.text },
  nameDone: { color: theme.colors.textSecondary, textDecorationLine: "line-through" },
  streak: {
    fontSize: 12,
    color: theme.colors.danger,
    marginTop: 2,
    fontVariant: ["tabular-nums"],
  },
  streakMuted: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 2 },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: theme.spacing.md,
  },
  dotDone: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  dotHollow: { width: 10, height: 10, borderRadius: 5, backgroundColor: theme.colors.primary },
});
