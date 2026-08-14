import { ScrollView, StyleSheet, Text, View, type DimensionValue } from "react-native";

import Card from "@/components/card";
import SectionHeader from "@/components/section-header";
import { theme } from "@/constants/theme";
import { useAppStore } from "@/store/useAppStore";
import { dailyCompletions, formatMinutes, weekStats } from "@/utils/calc";
import { parseKey, todayKey } from "@/utils/date";

export default function AnalysisScreen() {
  const settings = useAppStore((s) => s.settings);
  const habits = useAppStore((s) => s.habits);
  const records = useAppStore((s) => s.records);

  const stats = weekStats(records, habits, settings);
  const completions = dailyCompletions(records, habits, settings);
  const today = todayKey();

  const hasData = Object.keys(records).length > 0;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      contentInsetAdjustmentBehavior="automatic"
    >
      <Text style={styles.pageTitle}>数据</Text>

      <SectionHeader title="本周概览" right="近 7 天" />
      <View style={styles.statGrid}>
        <StatCard label="睡眠均值" value={`${stats.sleepAvg}`} unit="小时" />
        <StatCard label="喝水均值" value={`${stats.waterAvg}`} unit="ml" />
        <StatCard label="运动" value={`${stats.exerciseCount}`} unit={stats.exerciseCount > 0 ? `次 · ${formatMinutes(stats.exerciseMin)}` : "次"} />
        <StatCard label="完成率" value={`${stats.completionAvg}`} unit="%" />
      </View>

      <SectionHeader title="每日完成率" right="近 7 天" />
      <Card>
        {hasData ? (
          <View style={styles.chart}>
            {stats.days.map((key, i) => {
              const pct = completions[i];
              const isToday = key === today;
              return (
                <View key={key} style={styles.barCol}>
                  <Text style={[styles.barPct, isToday && styles.barPctToday]}>
                    {pct}%
                  </Text>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: `${pct}%` as DimensionValue,
                          backgroundColor: isToday ? theme.colors.primary : theme.colors.textSecondary,
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.barLabel, isToday && styles.barLabelToday]}>
                    {isToday ? "今" : `${parseKey(key).getDate()}`}
                  </Text>
                </View>
              );
            })}
          </View>
        ) : (
          <Text style={styles.empty}>还没有数据，先去记录喝水、睡眠或运动吧</Text>
        )}
      </Card>

      <Card style={styles.tipCard}>
        <Text style={styles.tipTitle}>💡 说明</Text>
        <Text style={styles.tipText}>
          完成率 = 每日「已完成任务数 ÷ 应计任务数（习惯 + 水 + 睡眠 + 运动）」的平均值。
        </Text>
      </Card>
    </ScrollView>
  );
}

function StatCard({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <View style={styles.statValueRow}>
        <Text style={styles.statValue} selectable>
          {value}
        </Text>
        <Text style={styles.statUnit}>{unit}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.lg, paddingBottom: theme.spacing.xxl },
  pageTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: theme.colors.text,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  statGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  statCard: {
    width: "47%",
    flexGrow: 1,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.large,
    padding: theme.spacing.lg,
  },
  statLabel: { fontSize: 13, color: theme.colors.textSecondary },
  statValueRow: { flexDirection: "row", alignItems: "baseline", gap: 4, marginTop: 6 },
  statValue: {
    fontSize: 28,
    fontWeight: "800",
    color: theme.colors.text,
    fontVariant: ["tabular-nums"],
  },
  statUnit: { fontSize: 12, color: theme.colors.textSecondary },
  chart: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 150,
    gap: theme.spacing.sm,
  },
  barCol: { flex: 1, alignItems: "center", height: "100%", justifyContent: "flex-end" },
  barPct: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    marginBottom: 4,
    fontVariant: ["tabular-nums"],
  },
  barPctToday: { color: theme.colors.primary, fontWeight: "700" },
  barTrack: {
    flex: 1,
    width: "60%",
    maxWidth: 28,
    justifyContent: "flex-end",
    backgroundColor: theme.colors.track,
    borderRadius: 8,
    overflow: "hidden",
  },
  bar: { width: "100%", borderRadius: 8, minHeight: 4 },
  barLabel: { fontSize: 11, color: theme.colors.textSecondary, marginTop: 6 },
  barLabelToday: { color: theme.colors.primary, fontWeight: "700" },
  empty: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: "center",
    paddingVertical: theme.spacing.xl,
  },
  tipCard: { backgroundColor: theme.colors.card },
  tipTitle: { fontSize: 14, fontWeight: "700", color: theme.colors.text, marginBottom: 4 },
  tipText: { fontSize: 13, color: theme.colors.textSecondary, lineHeight: 20 },
});
