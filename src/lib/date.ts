/** 기기 현지 시간 기준 'YYYY-MM-DD' 키. 체크 기록을 날짜별로 저장할 때 쓴다. */
export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function addDays(date: Date, amount: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

/** 오늘을 마지막으로 하는 최근 n일 (오래된 날부터). */
export function lastDays(today: Date, n: number): Date[] {
  return Array.from({ length: n }, (_, i) => addDays(today, i - (n - 1)));
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

export function weekdayLabel(date: Date): string {
  return WEEKDAYS[date.getDay()];
}

export function formatToday(date: Date): string {
  return `${date.getMonth() + 1}월 ${date.getDate()}일 ${WEEKDAYS[date.getDay()]}요일`;
}
