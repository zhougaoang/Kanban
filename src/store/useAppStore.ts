import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { sleepHours, todayKey, type DateKey } from "@/utils/date";

export interface Habit {
  id: string;
  name: string;
  emoji: string;
  createdAt: DateKey; // 创建当天
}

export interface Sleep {
  bed: string; // "23:30"
  wake: string; // "07:30"
  hours: number; // 自动计算
}

/** 按天记录：date 为键（"YYYY-MM-DD"） */
export interface DayRecord {
  date: DateKey;
  water: number; // ml
  sleep: Sleep | null;
  exercise: number; // 分钟
  habitsDone: Record<string, boolean>; // habitId -> 是否完成
}

export interface Settings {
  waterGoal: number; // ml
  sleepGoal: number; // 小时
  exerciseGoal: number; // 分钟
}

export const DEFAULT_SETTINGS: Settings = {
  waterGoal: 2000,
  sleepGoal: 8,
  exerciseGoal: 30,
};

export function emptyDay(date: DateKey): DayRecord {
  return { date, water: 0, sleep: null, exercise: 0, habitsDone: {} };
}

interface AppState {
  settings: Settings;
  habits: Habit[];
  records: Record<DateKey, DayRecord>;
  // actions
  addWater: (ml: number) => void;
  setSleep: (bed: string, wake: string) => void;
  clearSleep: () => void;
  addExercise: (min: number) => void;
  addHabit: (name: string, emoji: string) => void;
  deleteHabit: (id: string) => void;
  toggleHabit: (id: string) => void;
  setSettings: (partial: Partial<Settings>) => void;
  resetAll: () => void;
}

/** 以今天的记录为操作对象：无则先创建空记录 */
function withToday(s: AppState, fn: (day: DayRecord) => DayRecord): AppState {
  const key = todayKey();
  const day = s.records[key] ?? emptyDay(key);
  return { ...s, records: { ...s.records, [key]: fn(day) } };
}

const initialState = {
  settings: DEFAULT_SETTINGS,
  habits: [],
  records: {},
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      ...initialState,

      addWater: (ml) =>
        set((s) =>
          withToday(s, (day) => ({ ...day, water: Math.max(0, day.water + ml) }))
        ),

      setSleep: (bed, wake) =>
        set((s) =>
          withToday(s, (day) => ({
            ...day,
            sleep: { bed, wake, hours: sleepHours(bed, wake) },
          }))
        ),

      clearSleep: () =>
        set((s) => withToday(s, (day) => ({ ...day, sleep: null }))),

      addExercise: (min) =>
        set((s) =>
          withToday(s, (day) => ({
            ...day,
            exercise: Math.max(0, day.exercise + min),
          }))
        ),

      addHabit: (name, emoji) =>
        set((s) => ({
          habits: [
            ...s.habits,
            { id: genId(), name: name.trim(), emoji, createdAt: todayKey() },
          ],
        })),

      deleteHabit: (id) =>
        set((s) => ({ habits: s.habits.filter((h) => h.id !== id) })),

      toggleHabit: (id) =>
        set((s) =>
          withToday(s, (day) => ({
            ...day,
            habitsDone: { ...day.habitsDone, [id]: !day.habitsDone[id] },
          }))
        ),

      setSettings: (partial) =>
        set((s) => ({ settings: { ...s.settings, ...partial } })),

      resetAll: () => set({ ...initialState }),
    }),
    {
      name: "lifeos-store-v1",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// 本地工具函数（避免额外文件依赖）
function genId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
