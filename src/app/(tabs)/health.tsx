import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import Card from "@/components/card";
import InputModal from "@/components/input-modal";
import ProgressRing from "@/components/progress-ring";
import SectionHeader from "@/components/section-header";
import TimeField from "@/components/time-field";
import { theme } from "@/constants/theme";
import { useAppStore } from "@/store/useAppStore";
import { todayKey } from "@/utils/date";
import { lightTap } from "@/utils/haptics";

/** 睡眠星级：按 实际/目标 比例映射 1-5 星。 */
function starCount(hours: number, goal: number): number {
  if (hours <= 0 || goal <= 0) return 0;
  return Math.max(1, Math.min(5, Math.round((hours / goal) * 5)));
}

const QUICK_EXERCISE = [
  { label: "🏃 跑步", min: 30 },
  { label: "🏋️ 力量", min: 45 },
  { label: "🧘 拉伸", min: 10 },
];

export default function HealthScreen() {
  const settings = useAppStore((s) => s.settings);
  const day = useAppStore((s) => s.records[todayKey()]);
  const addWater = useAppStore((s) => s.addWater);
  const setSleep = useAppStore((s) => s.setSleep);
  const clearSleep = useAppStore((s) => s.clearSleep);
  const addExercise = useAppStore((s) => s.addExercise);

  const [waterModal, setWaterModal] = useState(false);

  const water = day?.water ?? 0;
  const waterPct = settings.waterGoal > 0 ? (water / settings.waterGoal) * 100 : 0;
  const sleep = day?.sleep ?? null;
  const exercise = day?.exercise ?? 0;
  const stars = starCount(sleep?.hours ?? 0, settings.sleepGoal);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      contentInsetAdjustmentBehavior="automatic"
    >
      <Text style={styles.pageTitle}>健康</Text>

      <SectionHeader title="💧 喝水" right={`目标 ${settings.waterGoal} ml`} />
      <Card>
        <View style={styles.waterRow}>
          <ProgressRing size={110} strokeWidth={10} progress={waterPct}>
            <Text style={styles.waterValue}>{water}</Text>
            <Text style={styles.waterUnit}>ml</Text>
          </ProgressRing>
          <View style={styles.waterButtons}>
            <Pressable
              style={styles.waterBtn}
              onPress={() => {
                lightTap();
                addWater(200);
              }}
            >
              <Text style={styles.waterBtnText}>+200ml</Text>
            </Pressable>
            <Pressable
              style={styles.waterBtn}
              onPress={() => {
                lightTap();
                addWater(500);
              }}
            >
              <Text style={styles.waterBtnText}>+500ml</Text>
            </Pressable>
          <Pressable
            style={[styles.waterBtn, styles.waterBtnGhost]}
            onPress={() => {
              lightTap();
              setWaterModal(true);
            }}
          >
            <Text style={styles.waterBtnGhostText}>自定义</Text>
          </Pressable>
          </View>
        </View>
        {water >= settings.waterGoal && water > 0 ? (
          <Text style={styles.doneHint}>🎉 已达成今日饮水目标</Text>
        ) : null}
      </Card>

      <SectionHeader title="😴 睡眠" right="自动计算时长" />
      <Card>
        <View style={styles.sleepRow}>
          <TimeField
            label="入睡时间"
            value={sleep?.bed ?? ""}
            onChange={(v) => setSleep(v, sleep?.wake ?? "07:30")}
          />
          <TimeField
            label="起床时间"
            value={sleep?.wake ?? ""}
            onChange={(v) => setSleep(sleep?.bed ?? "23:30", v)}
          />
        </View>
        {sleep ? (
          <View style={styles.sleepResult}>
            <View style={styles.sleepMeta}>
              <Text style={styles.sleepHours}>{sleep.hours} 小时</Text>
              <View style={styles.starRow}>
                {stars > 0 ? (
                  <>
                    <Text style={styles.starOn}>{"★".repeat(stars)}</Text>
                    <Text style={styles.starOff}>{"★".repeat(5 - stars)}</Text>
                  </>
                ) : (
                  <Text style={styles.starOff}>☆☆☆☆☆</Text>
                )}
              </View>
            </View>
            <Pressable style={styles.clearBtn} onPress={clearSleep}>
              <Ionicons name="close" size={14} color={theme.colors.textSecondary} />
              <Text style={styles.clearText}>清除</Text>
            </Pressable>
          </View>
        ) : (
          <Text style={styles.hint}>设置入睡 / 起床时间后自动计算睡眠时长</Text>
        )}
      </Card>

      <SectionHeader title="🏃 运动" right={`目标 ${settings.exerciseGoal} 分钟`} />
      <Card>
        <Text style={styles.exerciseValue}>{exercise}</Text>
        <Text style={styles.exerciseUnit}>今日运动（分钟）</Text>
        <View style={styles.exerciseActions}>
          <Pressable
            style={styles.exerciseBtn}
            onPress={() => {
              lightTap();
              addExercise(10);
            }}
          >
            <Text style={styles.exerciseBtnText}>+10 分钟</Text>
          </Pressable>
        </View>
        <View style={styles.quickRow}>
          {QUICK_EXERCISE.map((q) => (
            <Pressable
              key={q.label}
              style={styles.quickCard}
              onPress={() => {
                lightTap();
                addExercise(q.min);
              }}
            >
              <Text style={styles.quickLabel}>{q.label}</Text>
              <Text style={styles.quickMin}>{q.min} 分钟</Text>
            </Pressable>
          ))}
        </View>
      </Card>

      <InputModal
        visible={waterModal}
        title="自定义喝水"
        placeholder="输入毫升数"
        suffix="ml"
        keyboardType="numeric"
        onCancel={() => setWaterModal(false)}
        onConfirm={(v) => {
          const n = Number(v);
          if (!Number.isNaN(n) && n > 0) addWater(n);
          setWaterModal(false);
        }}
      />
    </ScrollView>
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
  waterRow: { flexDirection: "row", alignItems: "center", gap: theme.spacing.xl },
  waterValue: {
    fontSize: 28,
    fontWeight: "800",
    color: theme.colors.text,
    fontVariant: ["tabular-nums"],
  },
  waterUnit: { fontSize: 12, color: theme.colors.textSecondary },
  waterButtons: { flex: 1, gap: theme.spacing.sm },
  waterBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.medium,
    paddingVertical: theme.spacing.md,
    alignItems: "center",
  },
  waterBtnText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
  waterBtnGhost: { backgroundColor: theme.colors.background },
  waterBtnGhostText: { color: theme.colors.primary, fontSize: 15, fontWeight: "700" },
  doneHint: {
    marginTop: theme.spacing.md,
    textAlign: "center",
    fontSize: 13,
    color: theme.colors.success,
    fontWeight: "600",
  },
  sleepRow: { flexDirection: "row", gap: theme.spacing.md },
  sleepResult: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: theme.spacing.lg,
    backgroundColor: theme.colors.background,
    borderRadius: theme.radius.medium,
    padding: theme.spacing.lg,
  },
  sleepMeta: { flexDirection: "row", alignItems: "center", gap: theme.spacing.md },
  sleepHours: {
    fontSize: 20,
    fontWeight: "800",
    color: theme.colors.text,
    fontVariant: ["tabular-nums"],
  },
  starRow: { flexDirection: "row" },
  starOn: { fontSize: 16, color: theme.colors.star },
  starOff: { fontSize: 16, color: theme.colors.track },
  clearBtn: { flexDirection: "row", alignItems: "center", gap: 2 },
  clearText: { fontSize: 13, color: theme.colors.textSecondary },
  hint: {
    marginTop: theme.spacing.lg,
    fontSize: 13,
    color: theme.colors.textSecondary,
    textAlign: "center",
  },
  exerciseValue: {
    fontSize: 40,
    fontWeight: "800",
    color: theme.colors.text,
    fontVariant: ["tabular-nums"],
  },
  exerciseUnit: { fontSize: 13, color: theme.colors.textSecondary, marginBottom: theme.spacing.lg },
  exerciseActions: { marginBottom: theme.spacing.md },
  exerciseBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.medium,
    paddingVertical: theme.spacing.md,
    alignItems: "center",
  },
  exerciseBtnText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
  quickRow: { flexDirection: "row", gap: theme.spacing.sm },
  quickCard: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderRadius: theme.radius.medium,
    padding: theme.spacing.md,
    alignItems: "center",
  },
  quickLabel: { fontSize: 14, fontWeight: "600", color: theme.colors.text },
  quickMin: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 2 },
});
