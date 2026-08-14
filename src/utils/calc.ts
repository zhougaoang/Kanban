import { lastNDays, shiftKey, todayKey, type DateKey } from "@/utils/date";
import type { DayRecord, Habit, Settings } from "@/store/useAppStore";

/**
 * 今日完成度（百分比 0-100）：
 * 已达标项 / 应计项。应计项 = 习惯总数 + 3（水、睡眠、运动）。
 */
export function calcCompletion(
  day: DayRecord | undefined,
  habits: Habit[],
  settings: Settings
): number {
  const total = habits.length + 3;
  if (total === 0) return 0;
  if (!day) return 0;

  let done = 0;
  done += habits.filter((h) => day.habitsDone[h.id]).length;
  if (day.water >= settings.waterGoal) done += 1;
  if (day.sleep && day.sleep.hours >= settings.sleepGoal) done += 1;
  if (day.exercise >= settings.exerciseGoal) done += 1;
  return Math.round((done / total) * 100);
}

/** 单个习惯的连续完成天数（今天未打卡但从昨天有连续则从昨天起算）。 */
export function streakDays(
  habitId: string,
  records: Record<DateKey, DayRecord>
): number {
  const today = todayKey();
  const doneToday = records[today]?.habitsDone[habitId] === true;
  const doneYesterday = records[shiftKey(today, -1)]?.habitsDone[habitId] === true;

  // 今天没完成：若昨天也没完成则连续为 0
  if (!doneToday && !doneYesterday) return 0;

  let cursor = doneToday ? today : shiftKey(today, -1);
  let count = 0;
  while (records[cursor]?.habitsDone[habitId] === true) {
    count += 1;
    cursor = shiftKey(cursor, -1);
  }
  return count;
}

/** 当月（日历）已打卡的日期集合：任意习惯完成即算当天有打卡。 */
export function monthDoneDays(
  monthKey: string,
  records: Record<DateKey, DayRecord>
): Set<DateKey> {
  const set = new Set<DateKey>();
  for (const key of Object.keys(records)) {
    if (!key.startsWith(monthKey)) continue;
    const day = records[key];
    if (day && Object.values(day.habitsDone).some(Boolean)) set.add(key);
  }
  return set;
}

export interface WeekStats {
  days: DateKey[]; // 近 7 天，升序
  sleepAvg: number; // 小时，一位小数；无记录为 0
  waterAvg: number; // ml 取整
  exerciseCount: number; // 有运动的次数
  exerciseMin: number; // 运动总分钟
  completionAvg: number; // 每天完成度均值
}

/** 近 7 天聚合（Analysis 页）。 */
export function weekStats(
  records: Record<DateKey, DayRecord>,
  habits: Habit[],
  settings: Settings
): WeekStats {
  const days = lastNDays(7);
  let sleepSum = 0;
  let sleepDays = 0;
  let waterSum = 0;
  let waterDays = 0;
  let exerciseCount = 0;
  let exerciseMin = 0;
  let completionSum = 0;

  for (const key of days) {
    const day = records[key];
    if (!day) continue;
    if (day.sleep && day.sleep.hours > 0) {
      sleepSum += day.sleep.hours;
      sleepDays += 1;
    }
    if (day.water > 0) {
      waterSum += day.water;
      waterDays += 1;
    }
    if (day.exercise > 0) {
      exerciseCount += 1;
      exerciseMin += day.exercise;
    }
    completionSum += calcCompletion(day, habits, settings);
  }

  return {
    days,
    sleepAvg: sleepDays > 0 ? Math.round((sleepSum / sleepDays) * 10) / 10 : 0,
    waterAvg: waterDays > 0 ? Math.round(waterSum / waterDays) : 0,
    exerciseCount,
    exerciseMin,
    completionAvg: Math.round(completionSum / 7),
  };
}

/** 近 7 天每天完成度（条形图数据，与 days 对齐）。 */
export function dailyCompletions(
  records: Record<DateKey, DayRecord>,
  habits: Habit[],
  settings: Settings
): number[] {
  return lastNDays(7).map((key) =>
    calcCompletion(records[key], habits, settings)
  );
}

/** 格式化分钟为 "x小时y分" 或 "y分"（大数字展示用）。 */
export function formatMinutes(min: number): string {
  if (min <= 0) return "0分";
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m}分钟`;
  if (m === 0) return `${h}小时`;
  return `${h}小时${m}分`;
}


