export const LightTheme = {
  colors: {
    primary: '#B96A4A',
    background: '#F9F6F1',
    surface: '#ffffff',
    textPrimary: '#2D2D2D',
    textSecondary: '#495057',
    textMuted: '#868e96',
    border: '#E8E2D9',
    divider: '#f1f3f5',
    danger: '#fa5252',
    success: '#40c057',
    primaryLight: '#fdede5',
    star: '#f1c40f',
    card: '#ffffff',
    input: '#ffffff',
    bubble: '#2D2D2D',
  }
};

export const DarkTheme = {
  colors: {
    primary: '#D98E70',
    background: '#121212',
    surface: '#1E1E1E',
    textPrimary: '#F1F1F1',
    textSecondary: '#CED4DA',
    textMuted: '#adb5bd',
    border: '#2C2C2C',
    divider: '#2C2C2C',
    danger: '#ff6b6b',
    success: '#51cf66',
    primaryLight: '#2C1B14',
    star: '#fcc419',
    card: '#1E1E1E',
    input: '#252525',
    bubble: '#D98E70',
  }
};

// Mantenemos esto por compatibilidad temporal mientras migramos
export const Theme = LightTheme;

export const commonTheme = {
  spacing: {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32
  },
  borderRadius: {
    small: 8,
    medium: 12,
    large: 16,
    round: 9999
  }
};
