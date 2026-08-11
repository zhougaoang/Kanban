import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Panel, useTokens } from '@/components/ui/liquid-glass';
import { SheetModal } from '@/components/ui/sheet-modal';
import { IconSymbol } from '@/components/ui/icon-symbol';

/** 健身计划：一条计划（id / 名称 / 完成状态 / 创建时间） */
type WorkoutPlan = {
  id: string;
  name: string;
  done: boolean;
  createdAt: number;
};

const STORAGE_KEY = 'workout-plans:v1';

/** 第二界面：健身计划（长按打卡 + AsyncStorage 持久化） */
export default function ExploreScreen() {
  const { ground, text, meta, accent, buttonText, hairline, surface, track, success, successSoft } =
    useTokens();
  const insets = useSafeAreaInsets();

  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [draft, setDraft] = useState('');

  // 启动时从本地加载
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          setPlans(JSON.parse(raw) as WorkoutPlan[]);
        }
      } catch {
        // 数据损坏时忽略，从空列表开始
      }
      setLoaded(true);
    })();
  }, []);

  // 数据变化时持久化
  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(plans)).catch(() => {});
  }, [plans, loaded]);

  /** 添加计划 */
  const addPlan = useCallback(() => {
    const name = draft.trim();
    if (!name) return;
    const plan: WorkoutPlan = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name,
      done: false,
      createdAt: Date.now(),
    };
    setPlans((prev) => [plan, ...prev]);
    setDraft('');
    setModalVisible(false);
  }, [draft]);

  /** 长按切换完成状态（再次长按可恢复） */
  const togglePlan = useCallback((id: string) => {
    setPlans((prev) => prev.map((p) => (p.id === id ? { ...p, done: !p.done } : p)));
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }
  }, []);

  return (
    <View style={[styles.screen, { backgroundColor: ground, paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.largeTitle, { color: text }]}>健身计划</Text>
        <Text style={[styles.subtitle, { color: meta }]}>长按计划打卡 · 再次长按可恢复</Text>

        {plans.length === 0 ? (
          <Panel style={styles.emptyPanel}>
            <IconSymbol name="dumbbell.fill" size={40} color={meta} style={styles.emptyIcon} />
            <Text style={[styles.emptyTitle, { color: text }]}>暂无计划</Text>
            <Text style={[styles.emptyHint, { color: meta }]}>点右下角 + 添加第一条健身计划</Text>
          </Panel>
        ) : (
          <Panel>
            {plans.map((plan, index) => (
              <Pressable
                key={plan.id}
                onLongPress={() => togglePlan(plan.id)}
                delayLongPress={400}
                style={({ pressed }) => [
                  styles.planRow,
                  index > 0 && {
                    borderTopWidth: StyleSheet.hairlineWidth,
                    borderTopColor: hairline,
                  },
                  pressed && styles.planRowPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel={`${plan.name}，${plan.done ? '已完成' : '未完成'}，长按切换状态`}
              >
                <Text
                  numberOfLines={1}
                  style={[styles.planName, { color: text }, plan.done && styles.planNameDone]}>
                  {plan.name}
                </Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: plan.done ? successSoft : track },
                  ]}>
                  <Text
                    style={[
                      styles.statusText,
                      { color: plan.done ? success : meta },
                    ]}>
                    {plan.done ? '✓ 已完成' : '未完成'}
                  </Text>
                </View>
              </Pressable>
            ))}
          </Panel>
        )}
      </ScrollView>

      {/* 悬浮加号按钮 */}
      <Pressable
        onPress={() => setModalVisible(true)}
        style={({ pressed }) => [
          styles.fab,
          { backgroundColor: accent },
          pressed && styles.fabPressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel="添加健身计划"
      >
        <Text style={styles.fabIcon}>+</Text>
      </Pressable>

      {/* 添加计划：底部弹层 */}
      <SheetModal visible={modalVisible} onClose={() => setModalVisible(false)} title="添加健身计划">
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="例如：胸肌训练、有氧跑步 30 分钟"
          placeholderTextColor={meta}
          autoFocus
          maxLength={40}
          returnKeyType="done"
          onSubmitEditing={addPlan}
          style={[styles.input, { color: text, borderColor: hairline, backgroundColor: surface }]}
        />
        <View style={styles.actions}>
          <Pressable
            onPress={() => setModalVisible(false)}
            style={({ pressed }) => [
              styles.actionButton,
              styles.actionSecondary,
              { borderColor: hairline },
              pressed && styles.actionPressed,
            ]}
            accessibilityRole="button"
          >
            <Text style={[styles.actionText, { color: text }]}>取消</Text>
          </Pressable>
          <Pressable
            onPress={addPlan}
            disabled={!draft.trim()}
            style={({ pressed }) => [
              styles.actionButton,
              { backgroundColor: accent },
              (!draft.trim() || pressed) && styles.actionDisabled,
            ]}
            accessibilityRole="button"
          >
            <Text style={[styles.actionText, { color: buttonText }]}>添加</Text>
          </Pressable>
        </View>
      </SheetModal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 110, // 给 FAB 留空间
  },
  largeTitle: {
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    marginBottom: 16,
  },
  emptyPanel: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    marginBottom: 12,
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  emptyHint: {
    fontSize: 13,
  },
  planRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    minHeight: 56,
    paddingVertical: 10,
  },
  planRowPressed: {
    opacity: 0.55,
  },
  planName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  planNameDone: {
    textDecorationLine: 'line-through',
    opacity: 0.55,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 28,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
  fabPressed: {
    transform: [{ scale: 0.94 }],
  },
  fabIcon: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '300',
    lineHeight: 34,
    marginTop: -2,
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionSecondary: {
    borderWidth: StyleSheet.hairlineWidth,
    backgroundColor: 'transparent',
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
  },
  actionPressed: {
    opacity: 0.6,
  },
  actionDisabled: {
    opacity: 0.4,
  },
});
