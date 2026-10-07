export const designTokens = {
  colors: {
    primary: {
      main: '#2563EB',
      light: '#3B82F6',
      dark: '#1D4ED8',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#EA580C',
      light: '#FB923C',
      dark: '#C2410C',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F8FAFC',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#0F172A',
      secondary: '#475569',
      disabled: '#94A3B8',
    },
    border: '#E2E8F0',
    borderSubtle: '#F1F5F9',
    success: {
      main: '#16A34A',
      light: '#DCFCE7',
      dark: '#15803D',
    },
    warning: {
      main: '#D97706',
      light: '#FEF3C7',
      dark: '#B45309',
    },
    error: {
      main: '#DC2626',
      light: '#FEE2E2',
      dark: '#B91C1C',
    },
    info: {
      main: '#0284C7',
      light: '#E0F2FE',
      dark: '#0369A1',
    },
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  borderRadius: {
    sm: 6,
    md: 10,
    lg: 14,
    full: 9999,
  },
  shadows: {
    subtle: '0 1px 3px 0 rgba(15, 23, 42, 0.06), 0 1px 2px -1px rgba(15, 23, 42, 0.04)',
    card: '0 4px 6px -1px rgba(15, 23, 42, 0.07), 0 2px 4px -2px rgba(15, 23, 42, 0.05)',
    modal: '0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.08)',
  },
} as const;
