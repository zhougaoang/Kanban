import { StyleSheet, Text, View } from "react-native";

import { theme } from "@/constants/theme";
import { monthCalendar, todayKey, type DateKey } from "@/utils/date";

const WEEK_LABELS = ["日", "一", "二", "三", "四", "五", "六"];

interface Props {
  /** 当月已打卡的日期集合（任意习惯完成即算） */
  doneDays: Set<DateKey>;
  /** "YYYY-MM" */
  monthKey: string;
}

/** 当月日历网格：日期数字 + 底部打卡圆点，今天高亮。周日起始。 */
export default function HabitCalendar({ doneDays, monthKey }: Props) {
  const cells = monthCalendar(monthKey);
  const today = todayKey();

  return (
    <View>
      <View style={styles.weekRow}>
        {WEEK_LABELS.map((w) => (
          <Text key={w} style={styles.weekLabel}>
            {w}
          </Text>
        ))}
      </View>
      <View style={styles.grid}>
        {cells.map((key, i) =>
          key === null ? (
            <View key={`empty-${i}`} style={styles.cell} />
          ) : (
            <View
              key={key}
              style={[styles.cell, key === today && styles.todayCell]}
            >
              <Text
                style={[
                  styles.dayText,
                  doneDays.has(key) && styles.doneText,
                  key === today && styles.todayText,
                ]}
              >
                {Number(key.slice(8))}
              </Text>
              <View style={[styles.dot, doneDays.has(key) && styles.dotDone]} />
            </View>
          )
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  weekRow: {
    flexDirection: "row",
    marginBottom: theme.spacing.sm,
  },
  weekLabel: {
    flex: 1,
    textAlign: "center",
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  cell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  todayCell: { backgroundColor: theme.colors.primary },
  dayText: { fontSize: 14, fontWeight: "500", color: theme.colors.text, fontVariant: ["tabular-nums"] },
  todayText: { color: "#FFFFFF", fontWeight: "700" },
  doneText: { color: theme.colors.success, fontWeight: "700" },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "transparent",
    marginTop: 2,
  },
  dotDone: { backgroundColor: theme.colors.success },
});
