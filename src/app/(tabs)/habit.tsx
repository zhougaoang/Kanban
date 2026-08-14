import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import AddHabitModal from "@/components/add-habit-modal";
import Card from "@/components/card";
import HabitCalendar from "@/components/habit-calendar";
import HabitItem from "@/components/habit-item";
import SectionHeader from "@/components/section-header";
import { theme } from "@/constants/theme";
import { useAppStore } from "@/store/useAppStore";
import { monthDoneDays, streakDays } from "@/utils/calc";
import { currentMonthKey, formatToday, todayKey } from "@/utils/date";

export default function HabitScreen() {
  const habits = useAppStore((s) => s.habits);
  const records = useAppStore((s) => s.records);
  const addHabit = useAppStore((s) => s.addHabit);
  const deleteHabit = useAppStore((s) => s.deleteHabit);
  const toggleHabit = useAppStore((s) => s.toggleHabit);

  const [modal, setModal] = useState(false);
  const monthKey = currentMonthKey();
  const doneDays = monthDoneDays(monthKey, records);
  const day = records[todayKey()];

  const confirmDelete = (id: string, name: string) => {
    Alert.alert("删除习惯", `确定删除「${name}」吗？历史打卡会保留但不再计入。`, [
      { text: "取消", style: "cancel" },
      { text: "删除", style: "destructive", onPress: () => deleteHabit(id) },
    ]);
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      contentInsetAdjustmentBehavior="automatic"
    >
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.pageTitle}>习惯</Text>
          <Text style={styles.date} selectable>
            {formatToday()}
          </Text>
        </View>
        <Pressable style={styles.addBtn} onPress={() => setModal(true)}>
          <Ionicons name="add" size={22} color="#FFFFFF" />
          <Text style={styles.addBtnText}>新建</Text>
        </Pressable>
      </View>

      <SectionHeader title="本月打卡" right={doneDays.size > 0 ? `${doneDays.size} 天` : undefined} />
      <Card>
        <HabitCalendar doneDays={doneDays} monthKey={monthKey} />
      </Card>

      <SectionHeader title="今日打卡" right={habits.length > 0 ? `${habits.length} 个` : undefined} />
      <Card>
        {habits.length === 0 ? (
          <Text style={styles.empty}>点击右上角「新建」，创建你的第一个习惯</Text>
        ) : (
          habits.map((h) => (
            <HabitItem
              key={h.id}
              habit={h}
              done={day?.habitsDone[h.id] === true}
              streak={streakDays(h.id, records)}
              onToggle={() => toggleHabit(h.id)}
              onLongPress={() => confirmDelete(h.id, h.name)}
            />
          ))
        )}
      </Card>

      <Text style={styles.tip}>提示：长按习惯可删除</Text>

      <AddHabitModal
        visible={modal}
        onCancel={() => setModal(false)}
        onConfirm={(name, emoji) => {
          addHabit(name, emoji);
          setModal(false);
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.lg, paddingBottom: theme.spacing.xxl },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  pageTitle: { fontSize: 32, fontWeight: "800", color: theme.colors.text },
  date: { fontSize: 14, color: theme.colors.textSecondary, marginTop: 2 },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: 999,
  },
  addBtnText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
  empty: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: "center",
    paddingVertical: theme.spacing.xl,
  },
  tip: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginTop: -theme.spacing.sm,
  },
});
