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
      fontFamily: designTokens.typography.fontSerif,
      fontWeight: 600,
      letterSpacing: '-0.01em',
      color: designTokens.colors.text.primary,
      lineHeight: 1.15,
    },
    h2: {
      fontFamily: designTokens.typography.fontSerif,
      fontWeight: 600,
      letterSpacing: '-0.01em',
      color: designTokens.colors.text.primary,
      lineHeight: 1.2,
    },
    h3: {
      fontFamily: designTokens.typography.fontSerif,
      fontWeight: 600,
      letterSpacing: '-0.01em',
      color: designTokens.colors.text.primary,
      lineHeight: 1.25,
    },
    h4: {
      fontFamily: designTokens.typography.fontSerif,
      fontWeight: 600,
      letterSpacing: '0em',
      color: designTokens.colors.text.primary,
      lineHeight: 1.3,
    },
    h5: {
      fontFamily: designTokens.typography.fontSerif,
      fontWeight: 600,
      letterSpacing: '0.01em',
      color: designTokens.colors.text.primary,
    },
    h6: {
      fontFamily: designTokens.typography.fontFamily,
      fontWeight: 700,
      letterSpacing: '0.01em',
      color: designTokens.colors.text.primary,
    },
    subtitle1: {
      fontFamily: designTokens.typography.fontFamily,
      color: designTokens.colors.text.secondary,
      lineHeight: 1.6,
    },
    subtitle2: {
      fontFamily: designTokens.typography.fontFamily,
      color: designTokens.colors.text.secondary,
      lineHeight: 1.5,
    },
    body1: {
      fontFamily: designTokens.typography.fontFamily,
      color: designTokens.colors.text.primary,
      lineHeight: 1.6,
    },
    body2: {
      fontFamily: designTokens.typography.fontFamily,
      color: designTokens.colors.text.secondary,
      lineHeight: 1.55,
    },
    button: {
      fontFamily: designTokens.typography.fontFamily,
      textTransform: 'uppercase',
      fontWeight: 700,
      letterSpacing: '0.14em',
      fontSize: '0.78rem',
    },
  },
  shape: {
    borderRadius: designTokens.borderRadius.sm,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: designTokens.colors.background.default,
          color: designTokens.colors.text.primary,
          '::selection': {
            backgroundColor: '#DCE7CE',
            color: '#2A361D',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 22px',
          textTransform: 'uppercase',
          fontWeight: 700,
          letterSpacing: '0.14em',
          fontSize: '0.76rem',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        },
        containedPrimary: {
          backgroundColor: designTokens.colors.primary.main,
          color: '#FFFFFF',
          boxShadow: '0 4px 14px rgba(72, 90, 50, 0.22)',
          '&:hover': {
            backgroundColor: designTokens.colors.primary.glow,
            boxShadow: '0 6px 20px rgba(72, 90, 50, 0.32)',
            transform: 'translateY(-1px)',
          },
        },
        outlinedPrimary: {
          borderColor: designTokens.colors.primary.main,
          color: designTokens.colors.primary.main,
          '&:hover': {
            borderColor: designTokens.colors.primary.dark,
            backgroundColor: 'rgba(72, 90, 50, 0.06)',
          },
        },
        textPrimary: {
          color: designTokens.colors.primary.main,
          '&:hover': {
            backgroundColor: 'rgba(72, 90, 50, 0.06)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          border: `1px solid ${designTokens.colors.border}`,
          boxShadow: designTokens.shadows.card,
          backgroundColor: '#FFFFFF',
          transition: 'box-shadow 0.3s cubic-bezier(0.16, 1, 0.3, 1), transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#FFFFFF',
        },
        elevation1: {
          boxShadow: designTokens.shadows.subtle,
          border: `1px solid ${designTokens.colors.border}`,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          backgroundColor: '#FFFFFF',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: designTokens.colors.border,
            transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: designTokens.colors.primary.light,
          },
          '&.Mui-focused': {
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: designTokens.colors.primary.main,
              borderWidth: 1.5,
              boxShadow: '0 0 0 3px rgba(72, 90, 50, 0.12)',
            },
          },
        },
        input: {
          padding: '11px 14px',
          fontSize: '0.92rem',
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontSize: '0.88rem',
          color: designTokens.colors.text.secondary,
          '&.Mui-focused': {
            color: designTokens.colors.primary.main,
            fontWeight: 600,
          },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          transition: 'all 0.2s ease',
          '&.Mui-selected': {
            backgroundColor: designTokens.colors.primary.main,
            color: '#FFFFFF !important',
            '& .MuiListItemText-primary': {
              color: '#FFFFFF !important',
              fontWeight: 700,
            },
            '& .MuiListItemIcon-root': {
              color: '#FFFFFF !important',
            },
            '&:hover': {
              backgroundColor: designTokens.colors.primary.dark,
              color: '#FFFFFF !important',
              '& .MuiListItemText-primary': {
                color: '#FFFFFF !important',
              },
              '& .MuiListItemIcon-root': {
                color: '#FFFFFF !important',
              },
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 600,
          letterSpacing: '0.04em',
          '&.MuiChip-filled': {
            backgroundColor: designTokens.colors.accent.oliveForest,
            color: designTokens.colors.primary.dark,
            border: `1px solid ${designTokens.colors.accent.oliveBorder}`,
          },
          '&.MuiChip-outlined': {
            borderColor: designTokens.colors.border,
            color: designTokens.colors.text.secondary,
          },
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: designTokens.colors.border,
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
