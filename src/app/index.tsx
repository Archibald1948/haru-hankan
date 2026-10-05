import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { Plant, Plus } from 'phosphor-react-native';
import { Alert, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut, LayoutAnimationConfig, LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HabitRow } from '@/components/habit-row';
import { PressableScale } from '@/components/pressable-scale';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useToday } from '@/hooks/use-today';
import { formatToday, toDateKey } from '@/lib/date';
import { removeHabit, toggleHabit, useHabits, type Habit } from '@/lib/habits';

export default function TodayScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const today = useToday();
  const habits = useHabits();
  const todayKey = toDateKey(today);
  const doneCount = habits.filter((habit) => habit.doneDates.includes(todayKey)).length;

  const handleToggle = (habit: Habit) => {
    const checked = toggleHabit(habit.id, todayKey);
    if (Platform.OS === 'web') return;
    if (checked) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleLongPress = (habit: Habit) => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(`'${habit.name}' 삭제`, '지금까지의 기록도 함께 사라져요.', [
      { text: '취소', style: 'cancel' },
      { text: '삭제', style: 'destructive', onPress: () => removeHabit(habit.id) },
    ]);
  };

  const summary =
    habits.length === 0
      ? null
      : doneCount === habits.length
        ? '오늘 할 일을 모두 마쳤어요'
        : `${habits.length}개 중 ${doneCount}개 완료`;

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + Spacing.six, paddingBottom: insets.bottom + 120 },
        ]}>
        <View style={styles.header}>
          <Text style={[styles.date, { color: theme.textSecondary }]}>{formatToday(today)}</Text>
          <Text style={[styles.title, { color: theme.text }]}>오늘의 습관</Text>
          {summary && <Text style={[styles.summary, { color: theme.textSecondary }]}>{summary}</Text>}
        </View>

        {habits.length === 0 ? (
          <Animated.View entering={FadeIn.duration(200)} style={styles.empty}>
            <View style={[styles.emptyIcon, { backgroundColor: theme.accentSoft }]}>
              <Plant size={32} weight="duotone" color={theme.accent} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>첫 습관을 추가해 보세요</Text>
            <Text style={[styles.emptyBody, { color: theme.textSecondary }]}>
              {'물 한 잔, 10분 걷기처럼\n작게 시작할수록 오래 이어져요.'}
            </Text>
          </Animated.View>
        ) : (
          // 앱을 열 때는 바로 보여 주고, 새로 추가한 습관에만 등장 애니메이션을 준다.
          <LayoutAnimationConfig skipEntering>
            <View style={styles.list}>
              {habits.map((habit) => (
                <Animated.View
                  key={habit.id}
                  entering={FadeIn.duration(220)}
                  exiting={FadeOut.duration(160)}
                  layout={LinearTransition.duration(220)}>
                  <HabitRow
                    habit={habit}
                    today={today}
                    onToggle={() => handleToggle(habit)}
                    onLongPress={() => handleLongPress(habit)}
                  />
                </Animated.View>
              ))}
            </View>
          </LayoutAnimationConfig>
        )}
      </ScrollView>

      <View style={[styles.fabWrap, { bottom: insets.bottom + Spacing.five }]}>
        <PressableScale
          onPress={() => router.push('/new')}
          accessibilityRole="button"
          style={[styles.fab, { backgroundColor: theme.accent }]}>
          <Plus size={20} weight="bold" color={theme.onAccent} />
          <Text style={[styles.fabLabel, { color: theme.onAccent }]}>습관 추가</Text>
        </PressableScale>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.four,
    gap: Spacing.five,
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
  },
  header: {
    paddingHorizontal: Spacing.two,
    gap: Spacing.one,
  },
  date: {
    fontSize: 14,
    fontWeight: '500',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.8,
  },
  summary: {
    fontSize: 15,
    marginTop: Spacing.one,
  },
  list: {
    gap: Spacing.three,
  },
  empty: {
    alignItems: 'center',
    paddingTop: Spacing.six * 2,
    paddingHorizontal: Spacing.five,
    gap: Spacing.two,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.two,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  emptyBody: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  fabWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    pointerEvents: 'box-none',
  },
  fab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    height: 52,
    paddingHorizontal: Spacing.five,
    borderRadius: Radius.pill,
  },
  fabLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
});
