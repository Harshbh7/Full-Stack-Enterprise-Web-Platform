import { createTheme } from '@mui/material/styles';
import { designTokens } from './tokens.js';

export const theme = createTheme({
  palette: {
    primary: {
      main: designTokens.colors.primary.main,
      light: designTokens.colors.primary.light,
      dark: designTokens.colors.primary.dark,
      contrastText: designTokens.colors.primary.contrastText,
    },
    secondary: {
      main: designTokens.colors.secondary.main,
      light: designTokens.colors.secondary.light,
      dark: designTokens.colors.secondary.dark,
      contrastText: designTokens.colors.secondary.contrastText,
    },
    background: {
      default: designTokens.colors.background.default,
      paper: designTokens.colors.background.paper,
    },
    text: {
      primary: designTokens.colors.text.primary,
      secondary: designTokens.colors.text.secondary,
      disabled: designTokens.colors.text.disabled,
    },
    divider: designTokens.colors.border,
    success: designTokens.colors.success,
    warning: designTokens.colors.warning,
    error: designTokens.colors.error,
    info: designTokens.colors.info,
  },
  typography: {
    fontFamily: designTokens.typography.fontFamily,
    h1: {
      fontWeight: 800,
      letterSpacing: '-0.025em',
    },
    h2: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h3: {
      fontWeight: 700,
      letterSpacing: '-0.015em',
    },
    h4: {
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      letterSpacing: '+0.01em',
    },
  },
  shape: {
    borderRadius: designTokens.borderRadius.md,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: designTokens.borderRadius.sm,
          padding: '8px 20px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: designTokens.borderRadius.lg,
          border: `1px solid ${designTokens.colors.border}`,
          boxShadow: designTokens.shadows.subtle,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiDialog: {
      defaultProps: {
        disableRestoreFocus: true,
      },
    },
    MuiModal: {
      defaultProps: {
        disableRestoreFocus: true,
      },
    },
    MuiPopover: {
      defaultProps: {
        disableRestoreFocus: true,
      },
    },
  },
});
