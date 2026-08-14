/** 日期工具：所有记录以 "YYYY-MM-DD" 字符串为键，与 store 的 records 对齐。 */

export type DateKey = string; // "YYYY-MM-DD"

const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];
const WEEKDAYS_SHORT = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

export function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/** Date -> "YYYY-MM-DD" */
export function dateKey(d: Date): DateKey {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/** "YYYY-MM-DD" -> Date（本地时区零点） */
export function parseKey(key: DateKey): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function todayKey(): DateKey {
  return dateKey(new Date());
}

/** "YYYY-MM" -> 当月 1 号 */
export function monthKeyOf(key: DateKey): string {
  return key.slice(0, 7);
}

export function currentMonthKey(): string {
  return monthKeyOf(todayKey());
}

/** key 偏移 offset 天（正数未来，负数过去） */
export function shiftKey(key: DateKey, offset: number): DateKey {
  const d = parseKey(key);
  d.setDate(d.getDate() + offset);
  return dateKey(d);
}

/** 近 n 天（含今天），升序。用于周聚合。 */
export function lastNDays(n: number): DateKey[] {
  const today = todayKey();
  const out: DateKey[] = [];
  for (let i = n - 1; i >= 0; i--) out.push(shiftKey(today, -i));
  return out;
}

/** 当月日历网格：null 为月首前的补位空格，其余为当月 "YYYY-MM-DD"。周日起始。 */
export function monthCalendar(monthKey: string): (DateKey | null)[] {
  const [y, m] = monthKey.split("-").map(Number);
  const first = new Date(y, m - 1, 1);
  const daysInMonth = new Date(y, m, 0).getDate();
  const cells: (DateKey | null)[] = [];
  for (let i = 0; i < first.getDay(); i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(`${monthKey}-${pad2(d)}`);
  }
  return cells;
}

/** "8月10日 周一" */
export function formatDisplay(d: Date): string {
  return `${d.getMonth() + 1}月${d.getDate()}日 ${WEEKDAYS_SHORT[d.getDay()]}`;
}

export function formatToday(): string {
  return formatDisplay(new Date());
}

/** 按小时返回问候语 */
export function greeting(): string {
  const h = new Date().getHours();
  if (h < 6) return "夜深了";
  if (h < 12) return "Good Morning 👋";
  if (h < 18) return "Good Afternoon 👋";
  return "Good Evening 👋";
}

/** 计算睡眠时长（小时，一位小数）。跨天自动 +24h。 */
export function sleepHours(bed: string, wake: string): number {
  const [bh, bm] = bed.split(":").map(Number);
  const [wh, wm] = wake.split(":").map(Number);
  if ([bh, bm, wh, wm].some((n) => Number.isNaN(n))) return 0;
  let minutes = wh * 60 + wm - (bh * 60 + bm);
  if (minutes < 0) minutes += 24 * 60;
  return Math.round((minutes / 60) * 10) / 10;
}
