import { useSyncExternalStore } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

const noopSubscribe = () => () => {};

/**
 * 웹 정적 렌더링에서는 서버 결과와 맞추려고 첫 렌더를 'light'로 두고,
 * 클라이언트에서 다시 계산한다.
 */
export function useColorScheme() {
  const hasHydrated = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  );
  const colorScheme = useRNColorScheme();

  return hasHydrated ? colorScheme : 'light';
}
