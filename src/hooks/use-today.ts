import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { toDateKey } from '@/lib/date';

/** 오늘 날짜. 앱을 켜 둔 채 자정을 넘겼다가 다시 열면 새 날짜로 바뀐다. */
export function useToday(): Date {
  const [today, setToday] = useState(() => new Date());

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active') return;
      setToday((prev) => {
        const now = new Date();
        return toDateKey(now) === toDateKey(prev) ? prev : now;
      });
    });
    return () => subscription.remove();
  }, []);

  return today;
}
