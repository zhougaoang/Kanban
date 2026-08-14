import Ionicons from "@expo/vector-icons/Ionicons";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import Card from "@/components/card";
import SectionHeader from "@/components/section-header";
import { theme } from "@/constants/theme";
import { useAppStore } from "@/store/useAppStore";
import { lightTap } from "@/utils/haptics";

function round1(v: number): number {
  return Math.round(v * 10) / 10;
}

function StepperRow({
  label,
  value,
  unit,
  step,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  unit: string;
  step: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <View style={styles.stepperRow}>
      <Text style={styles.stepperLabel}>{label}</Text>
      <View style={styles.stepper}>
        <Pressable
          style={styles.stepBtn}
          onPress={() => {
            lightTap();
            onChange(Math.max(min, round1(value - step)));
          }}
        >
          <Ionicons name="remove" size={18} color={theme.colors.primary} />
        </Pressable>
        <Text style={styles.stepperValue} selectable>
          {value}
          {unit}
        </Text>
        <Pressable
          style={styles.stepBtn}
          onPress={() => {
            lightTap();
            onChange(Math.min(max, round1(value + step)));
          }}
        >
          <Ionicons name="add" size={18} color={theme.colors.primary} />
        </Pressable>
      </View>
    </View>
  );
}

export default function SettingsScreen() {
  const settings = useAppStore((s) => s.settings);
  const setSettings = useAppStore((s) => s.setSettings);
  const resetAll = useAppStore((s) => s.resetAll);

  const confirmReset = () => {
    Alert.alert(
      "清除所有数据",
      "将删除全部习惯、记录和设置，此操作不可撤销。确定继续吗？",
      [
        { text: "取消", style: "cancel" },
        { text: "清除", style: "destructive", onPress: () => resetAll() },
      ]
    );
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      contentInsetAdjustmentBehavior="automatic"
    >
      <Text style={styles.pageTitle}>设置</Text>

      <SectionHeader title="每日目标" right="影响完成度计算" />
      <Card>
        <StepperRow
          label="💧 喝水"
          value={settings.waterGoal}
          unit=" ml"
          step={100}
          min={0}
          max={5000}
          onChange={(v) => setSettings({ waterGoal: v })}
        />
        <StepperRow
          label="😴 睡眠"
          value={settings.sleepGoal}
          unit=" 小时"
          step={0.5}
          min={0}
          max={12}
          onChange={(v) => setSettings({ sleepGoal: v })}
        />
        <StepperRow
          label="🏃 运动"
          value={settings.exerciseGoal}
          unit=" 分钟"
          step={5}
          min={0}
          max={180}
          onChange={(v) => setSettings({ exerciseGoal: v })}
        />
      </Card>

      <SectionHeader title="数据" />
      <Card>
        <Pressable style={styles.dangerBtn} onPress={confirmReset}>
          <Ionicons name="trash-outline" size={18} color={theme.colors.danger} />
          <Text style={styles.dangerText}>清除所有数据</Text>
        </Pressable>
      </Card>

      <Card style={styles.aboutCard}>
        <Text style={styles.aboutTitle}>Life OS</Text>
        <Text style={styles.aboutText}>v0.1.0 · MVP</Text>
        <Text style={styles.aboutText}>本地存储，数据仅保存在本机</Text>
      </Card>
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
  stepperRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: theme.spacing.sm,
  },
  stepperLabel: { fontSize: 15, fontWeight: "600", color: theme.colors.text },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  stepBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  stepperValue: {
    fontSize: 15,
    fontWeight: "700",
    color: theme.colors.text,
    minWidth: 70,
    textAlign: "center",
    fontVariant: ["tabular-nums"],
  },
  dangerBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.sm,
    backgroundColor: "#FFF2F0",
    borderRadius: theme.radius.medium,
    paddingVertical: theme.spacing.lg,
  },
  dangerText: { fontSize: 15, fontWeight: "700", color: theme.colors.danger },
  aboutCard: { alignItems: "center" },
  aboutTitle: { fontSize: 17, fontWeight: "800", color: theme.colors.text },
  aboutText: { fontSize: 13, color: theme.colors.textSecondary, marginTop: 4 },
});
