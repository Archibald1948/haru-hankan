import { StyleSheet, Text, View } from 'react-native';

import { CheckButton } from '@/components/check-button';
import { PressableScale } from '@/components/pressable-scale';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { lastDays, toDateKey, weekdayLabel } from '@/lib/date';
import { getStreak, type Habit } from '@/lib/habits';

type Props = {
  habit: Habit;
  today: Date;
  onToggle: () => void;
  onLongPress: () => void;
};

export function HabitRow({ habit, today, onToggle, onLongPress }: Props) {
  const theme = useTheme();
  const done = new Set(habit.doneDates);
  const checkedToday = done.has(toDateKey(today));
  const streak = getStreak(habit, today);
  const week = lastDays(today, 7);

  return (
    <PressableScale
      onLongPress={onLongPress}
      delayLongPress={400}
      pressedScale={0.985}
      accessibilityHint="길게 누르면 삭제할 수 있어요"
      style={[styles.row, { backgroundColor: theme.surface }]}>
      <View style={styles.body}>
        <Text style={[styles.name, { color: theme.text }]} numberOfLines={2}>
          {habit.name}
        </Text>
        <Text style={[styles.meta, { color: streak > 0 ? theme.accent : theme.textSecondary }]}>
          {streak > 0 ? `${streak}일 연속` : '오늘부터 시작해요'}
        </Text>

        <View style={styles.week} accessibilityLabel="최근 7일 기록">
          {week.map((day) => {
            const isDone = done.has(toDateKey(day));
            const isToday = day === week[week.length - 1];
            return (
              <View key={toDateKey(day)} style={styles.day}>
                <Text
                  style={[
                    styles.dayLabel,
                    { color: isToday ? theme.text : theme.textSecondary },
                    isToday && styles.dayLabelToday,
                  ]}>
                  {weekdayLabel(day)}
                </Text>
                <View
                  style={[
                    styles.dot,
                    isDone
                      ? { backgroundColor: theme.accent }
                      : { backgroundColor: 'transparent', borderColor: theme.track, borderWidth: 1.5 },
                  ]}
                />
              </View>
            );
          })}
        </View>
      </View>

      <CheckButton
        checked={checkedToday}
        onPress={onToggle}
        label={`${habit.name} 오늘 완료`}
      />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.four,
    padding: Spacing.four,
    paddingLeft: Spacing.five,
    borderRadius: Radius.card,
  },
  body: {
    flex: 1,
    gap: Spacing.one,
  },
  name: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  meta: {
    fontSize: 13,
    fontWeight: '500',
  },
  week: {
    flexDirection: 'row',
    gap: Spacing.three,
    marginTop: Spacing.three,
  },
  day: {
    alignItems: 'center',
    gap: 6,
  },
  dayLabel: {
    fontSize: 11,
  },
  dayLabelToday: {
    fontWeight: '700',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: Radius.pill,
  },
});
