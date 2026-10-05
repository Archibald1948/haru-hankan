import { useSyncExternalStore } from 'react';

import { addDays, toDateKey } from '@/lib/date';
import { readItem, writeItem } from '@/lib/storage';

export type Habit = {
  id: string;
  name: string;
  createdAt: string;
  /** 체크한 날짜 키 목록 ('YYYY-MM-DD') */
  doneDates: string[];
};

const STORAGE_KEY = 'habits:v1';

let habits: Habit[] | null = null;
const listeners = new Set<() => void>();

function load(): Habit[] {
  if (habits) return habits;
  try {
    const raw = readItem(STORAGE_KEY);
    habits = raw ? (JSON.parse(raw) as Habit[]) : [];
  } catch {
    habits = [];
  }
  return habits;
}

function commit(next: Habit[]) {
  habits = next;
  writeItem(STORAGE_KEY, JSON.stringify(next));
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useHabits(): Habit[] {
  return useSyncExternalStore(subscribe, load, load);
}

export function addHabit(name: string) {
  const habit: Habit = {
    id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    name: name.trim(),
    createdAt: toDateKey(new Date()),
    doneDates: [],
  };
  commit([...load(), habit]);
}

export function removeHabit(id: string) {
  commit(load().filter((habit) => habit.id !== id));
}

/** 해당 날짜의 체크를 뒤집고, 체크된 상태가 되었는지 돌려준다. */
export function toggleHabit(id: string, dateKey: string): boolean {
  let checked = false;
  commit(
    load().map((habit) => {
      if (habit.id !== id) return habit;
      const has = habit.doneDates.includes(dateKey);
      checked = !has;
      return {
        ...habit,
        doneDates: has
          ? habit.doneDates.filter((key) => key !== dateKey)
          : [...habit.doneDates, dateKey],
      };
    })
  );
  return checked;
}

/** 연속 달성 일수. 오늘 아직 안 했으면 어제까지의 기록으로 센다. */
export function getStreak(habit: Habit, today: Date): number {
  const done = new Set(habit.doneDates);
  let cursor = done.has(toDateKey(today)) ? today : addDays(today, -1);
  let count = 0;
  while (done.has(toDateKey(cursor))) {
    count += 1;
    cursor = addDays(cursor, -1);
  }
  return count;
}
