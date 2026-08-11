import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Panel, useTokens } from '@/components/ui/liquid-glass';
import { SheetModal } from '@/components/ui/sheet-modal';
import { IconSymbol } from '@/components/ui/icon-symbol';

/** 睡眠记录：一条入睡日志（日期 YYYY-MM-DD / 入睡时间 HH:mm） */
type SleepRecord = {
  id: string;
  date: string;
  time: string;
  createdAt: number;
};

const STORAGE_KEY = 'sleep-records:v1';

/** 今日日期字符串 YYYY-MM-DD */
function todayStr(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

/** 列表显示用的日期描述：今日睡眠记录 / 8月11日 */
function formatSleepLabel(dateStr: string): string {
  if (dateStr === todayStr()) return '今日睡眠记录';
  const [, m, d] = dateStr.split('-').map(Number);
  return `${m}月${d}日`;
}

/** 第三界面：睡眠记录（倒序列表 + AsyncStorage 持久化） */
export default function ProfileScreen() {
  const { ground, text, meta, accent, buttonText, hairline, surface } = useTokens();
  const insets = useSafeAreaInsets();

  const [records, setRecords] = useState<SleepRecord[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [draftDate, setDraftDate] = useState(todayStr());
  const [draftTime, setDraftTime] = useState('23:30');

  // 启动时从本地加载
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as SleepRecord[];
          // 按添加时间倒序，保证新记录在最上
          setRecords(parsed.sort((a, b) => b.createdAt - a.createdAt));
        }
      } catch {
        // 数据损坏时忽略
      }
      setLoaded(true);
    })();
  }, []);

  // 数据变化时持久化
  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(records)).catch(() => {});
  }, [records, loaded]);

  /** 添加睡眠记录（新记录置顶） */
  const addRecord = useCallback(() => {
    const date = draftDate.trim();
    const time = draftTime.trim();
    if (!date || !time) return;
    const record: SleepRecord = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      date,
      time,
      createdAt: Date.now(),
    };
    setRecords((prev) => [record, ...prev]);
    setModalVisible(false);
  }, [draftDate, draftTime]);

  const canAdd = draftDate.trim().length > 0 && draftTime.trim().length > 0;

  return (
    <View style={[styles.screen, { backgroundColor: ground, paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.largeTitle, { color: text }]}>睡眠记录</Text>
        <Text style={[styles.subtitle, { color: meta }]}>记录每天入睡时间，了解自己的作息</Text>

        {records.length === 0 ? (
          <Panel style={styles.emptyPanel}>
            <IconSymbol name="moon.zzz.fill" size={40} color={meta} style={styles.emptyIcon} />
            <Text style={[styles.emptyTitle, { color: text }]}>暂无记录</Text>
            <Text style={[styles.emptyHint, { color: meta }]}>点右下角 + 记录今天的入睡时间</Text>
          </Panel>
        ) : (
          <Panel>
            {records.map((record, index) => (
              <View
                key={record.id}
                style={[
                  styles.recordRow,
                  index > 0 && {
                    borderTopWidth: StyleSheet.hairlineWidth,
                    borderTopColor: hairline,
                  },
                ]}>
                <Text style={[styles.recordDate, { color: text }]}>
                  {formatSleepLabel(record.date)}
                </Text>
                <Text style={[styles.recordTime, { color: accent, fontVariant: ['tabular-nums'] }]}>
                  {record.time} 入睡
                </Text>
              </View>
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
        accessibilityLabel="添加睡眠记录"
      >
        <Text style={styles.fabIcon}>+</Text>
      </Pressable>

      {/* 添加睡眠记录：底部弹层 */}
      <SheetModal visible={modalVisible} onClose={() => setModalVisible(false)} title="添加睡眠记录">
        <Text style={[styles.fieldLabel, { color: meta }]}>睡眠日期</Text>
        <TextInput
          value={draftDate}
          onChangeText={setDraftDate}
          placeholder="YYYY-MM-DD（默认今天）"
          placeholderTextColor={meta}
          autoCapitalize="none"
          maxLength={10}
          style={[styles.input, { color: text, borderColor: hairline, backgroundColor: surface }]}
        />

        <Text style={[styles.fieldLabel, { color: meta }]}>几点入睡</Text>
        <TextInput
          value={draftTime}
          onChangeText={setDraftTime}
          placeholder="例如：23:30"
          placeholderTextColor={meta}
          autoCapitalize="none"
          maxLength={8}
          returnKeyType="done"
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
            onPress={addRecord}
            disabled={!canAdd}
            style={({ pressed }) => [
              styles.actionButton,
              { backgroundColor: accent },
              (!canAdd || pressed) && styles.actionDisabled,
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
  recordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    minHeight: 56,
    paddingVertical: 10,
  },
  recordDate: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  recordTime: {
    fontSize: 15,
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
  fieldLabel: {
    fontSize: 13,
    marginBottom: 6,
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 14,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
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
