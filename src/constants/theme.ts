export const Colors = {
  light: {
    background: '#F4F4F5',
    surface: '#FCFCFC',
    text: '#18181B',
    textSecondary: '#5F5F67',
    border: '#E4E4E7',
    track: '#CFCFD4',
    accent: '#C9471F',
    accentSoft: '#F6DDD3',
    onAccent: '#FFF8F5',
  },
  dark: {
    background: '#111113',
    surface: '#1C1C1F',
    text: '#F4F4F5',
    textSecondary: '#A1A1AA',
    border: '#2C2C31',
    track: '#4A4A52',
    accent: '#F0703F',
    accentSoft: '#3A2219',
    onAccent: '#1E0D06',
  },
} as const;

export type ThemeColors = (typeof Colors)['light' | 'dark'];

export const Radius = {
  card: 16,
  pill: 999,
} as const;

export const Spacing = {
  one: 4,
  two: 8,
  three: 12,
  four: 16,
  five: 24,
  six: 32,
} as const;
