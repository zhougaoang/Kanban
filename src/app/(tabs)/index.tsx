import { ScrollView, StyleSheet, Text, View } from "react-native";

import Card from "@/components/card";
import HabitItem from "@/components/habit-item";
import HealthRow from "@/components/health-row";
import ProgressRing from "@/components/progress-ring";
import SectionHeader from "@/components/section-header";
import { theme } from "@/constants/theme";
import { useAppStore } from "@/store/useAppStore";
import { calcCompletion, formatMinutes, streakDays } from "@/utils/calc";
import { formatToday, greeting, todayKey } from "@/utils/date";

export default function HomeScreen() {
  const settings = useAppStore((s) => s.settings);
  const habits = useAppStore((s) => s.habits);
  const records = useAppStore((s) => s.records);
  const toggleHabit = useAppStore((s) => s.toggleHabit);

  const day = records[todayKey()];
  const completion = calcCompletion(day, habits, settings);

  const waterPct = settings.waterGoal > 0 ? (day?.water ?? 0) / settings.waterGoal : 0;
  const sleepHours = day?.sleep?.hours ?? 0;
  const sleepPct = settings.sleepGoal > 0 ? sleepHours / settings.sleepGoal : 0;
  const exercisePct = settings.exerciseGoal > 0 ? (day?.exercise ?? 0) / settings.exerciseGoal : 0;

  const waterText = day ? `${day.water} / ${settings.waterGoal} ml` : `0 / ${settings.waterGoal} ml`;
  const sleepText = day?.sleep
    ? `${day.sleep.hours} / ${settings.sleepGoal} 小时`
    : `未记录 / ${settings.sleepGoal} 小时`;
  const exerciseText = day
    ? `${formatMinutes(day.exercise)} / ${settings.exerciseGoal} 分钟`
    : `0 分钟 / ${settings.exerciseGoal} 分钟`;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      contentInsetAdjustmentBehavior="automatic"
    >
      <Text style={styles.greeting}>{greeting()}</Text>
      <Text style={styles.date} selectable>
        {formatToday()}
      </Text>

      <Card style={styles.heroCard}>
        <ProgressRing size={150} strokeWidth={12} progress={completion}>
          <Text style={styles.heroPct}>{completion}%</Text>
          <Text style={styles.heroLabel}>今日完成度</Text>
        </ProgressRing>
      </Card>

      <SectionHeader title="健康" right="去记录 ›" />
      <Card>
        <HealthRow emoji="💧" label="喝水" value={waterText} pct={waterPct * 100} />
        <HealthRow
          emoji="😴"
          label="睡眠"
          value={sleepText}
          pct={sleepPct * 100}
          tint={theme.colors.textSecondary}
        />
        <HealthRow
          emoji="🏃"
          label="运动"
          value={exerciseText}
          pct={exercisePct * 100}
          tint={theme.colors.success}
        />
      </Card>

      <SectionHeader title="今日任务" right={habits.length > 0 ? `${habits.length} 个习惯` : undefined} />
      <Card>
        {habits.length === 0 ? (
          <Text style={styles.empty}>还没有习惯，去「习惯」页创建一个吧</Text>
        ) : (
          habits.map((h) => (
            <HabitItem
              key={h.id}
              habit={h}
              done={day?.habitsDone[h.id] === true}
              streak={streakDays(h.id, records)}
              onToggle={() => toggleHabit(h.id)}
              onLongPress={() => {}}
            />
          ))
        )}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.lg, paddingBottom: theme.spacing.xxl },
  greeting: {
    fontSize: 28,
    fontWeight: "800",
    color: theme.colors.text,
    marginTop: theme.spacing.sm,
  },
  date: { fontSize: 15, color: theme.colors.textSecondary, marginTop: 2, marginBottom: theme.spacing.lg },
  heroCard: { alignItems: "center", paddingVertical: theme.spacing.xxl },
  heroPct: {
    fontSize: 36,
    fontWeight: "800",
    color: theme.colors.text,
    fontVariant: ["tabular-nums"],
  },
  heroLabel: { fontSize: 13, color: theme.colors.textSecondary, marginTop: 2 },
  empty: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: "center",
    paddingVertical: theme.spacing.lg,
  },
});
