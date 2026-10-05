import { Check } from 'phosphor-react-native';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

import { PressableScale } from '@/components/pressable-scale';
import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  checked: boolean;
  onPress: () => void;
  label: string;
};

const SIZE = 44;

export function CheckButton({ checked, onPress, label }: Props) {
  const theme = useTheme();
  const progress = useSharedValue(checked ? 1 : 0);

  useEffect(() => {
    // 채워질 때는 살짝 튀는 스프링, 비워질 때는 빠르게 사라지게.
    progress.set(
      checked ? withSpring(1, { duration: 350, dampingRatio: 0.6 }) : withTiming(0, { duration: 140 })
    );
  }, [checked, progress]);

  const fillStyle = useAnimatedStyle(() => ({
    opacity: Math.min(progress.value * 1.5, 1),
    transform: [{ scale: 0.6 + progress.value * 0.4 }],
  }));

  return (
    <PressableScale
      onPress={onPress}
      pressedScale={0.92}
      hitSlop={8}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={label}
      style={[styles.ring, { borderColor: checked ? theme.accent : theme.track }]}>
      <Animated.View style={[styles.fill, { backgroundColor: theme.accent }, fillStyle]}>
        <Check size={22} weight="bold" color={theme.onAccent} />
      </Animated.View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  ring: {
    width: SIZE,
    height: SIZE,
    borderRadius: Radius.pill,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fill: {
    position: 'absolute',
    top: -2,
    left: -2,
    width: SIZE,
    height: SIZE,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
