import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PressableScale } from '@/components/pressable-scale';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { addHabit } from '@/lib/habits';

const SUGGESTIONS = ['물 두 잔 마시기', '10분 걷기', '책 10쪽 읽기', '스트레칭', '일기 세 줄 쓰기'];
const MAX_LENGTH = 30;

export default function NewHabitScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const canSave = name.trim().length > 0;

  const close = () => (router.canGoBack() ? router.back() : router.replace('/'));

  const save = () => {
    if (!canSave) return;
    addHabit(name);
    close();
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.background, paddingTop: insets.top + Spacing.two }]}>
      <View style={styles.bar}>
        <Pressable onPress={close} hitSlop={12} accessibilityRole="button" style={styles.barSide}>
          <Text style={[styles.barText, { color: theme.textSecondary }]}>취소</Text>
        </Pressable>
        <Text style={[styles.barTitle, { color: theme.text }]}>새 습관</Text>
        <Pressable
          onPress={save}
          disabled={!canSave}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityState={{ disabled: !canSave }}
          style={[styles.barSide, styles.barRight]}>
          <Text
            style={[
              styles.barText,
              styles.barSave,
              { color: canSave ? theme.accent : theme.textSecondary, opacity: canSave ? 1 : 0.5 },
            ]}>
            저장
          </Text>
        </Pressable>
      </View>

      <View style={styles.form}>
        <Text style={[styles.label, { color: theme.text }]}>습관 이름</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          onSubmitEditing={save}
          autoFocus
          maxLength={MAX_LENGTH}
          returnKeyType="done"
          placeholder="예: 아침에 물 한 잔"
          placeholderTextColor={theme.textSecondary}
          selectionColor={theme.accent}
          cursorColor={theme.accent}
          style={[
            styles.input,
            { color: theme.text, backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        />
        <Text style={[styles.helper, { color: theme.textSecondary }]}>
          {name.length}/{MAX_LENGTH}
        </Text>
      </View>

      <View style={styles.suggestions}>
        <Text style={[styles.label, { color: theme.text }]}>이런 건 어때요</Text>
        <View style={styles.chips}>
          {SUGGESTIONS.map((suggestion) => {
            const selected = suggestion === name;
            return (
              <PressableScale
                key={suggestion}
                onPress={() => setName(suggestion)}
                accessibilityRole="button"
                style={[
                  styles.chip,
                  selected
                    ? { backgroundColor: theme.accentSoft, borderColor: theme.accent }
                    : { backgroundColor: theme.surface, borderColor: theme.border },
                ]}>
                <Text style={[styles.chipText, { color: selected ? theme.accent : theme.text }]}>
                  {suggestion}
                </Text>
              </PressableScale>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    gap: Spacing.five,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
  },
  barSide: {
    flex: 1,
  },
  barRight: {
    alignItems: 'flex-end',
  },
  barTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  barText: {
    fontSize: 16,
  },
  barSave: {
    fontWeight: '600',
  },
  form: {
    gap: Spacing.two,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: Spacing.one,
  },
  input: {
    height: 52,
    borderRadius: Radius.card,
    borderWidth: 1,
    paddingHorizontal: Spacing.four,
    fontSize: 17,
  },
  helper: {
    fontSize: 12,
    alignSelf: 'flex-end',
    paddingHorizontal: Spacing.one,
  },
  suggestions: {
    gap: Spacing.three,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  chip: {
    paddingHorizontal: Spacing.four,
    paddingVertical: 10,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 15,
  },
});
