export const designTokens = {
  colors: {
    primary: {
      main: '#485A32',        // Rich New Zealand Olive (The Boundary signature)
      light: '#5E7542',       // Accent Sage Olive
      dark: '#2A361D',        // Deep Forest Olive
      glow: '#384725',        // Hover Deep Olive Glow
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#8C7355',        // Warm Artisan Bronze / Taupe Accent
      light: '#B6A085',       // Soft Taupe
      dark: '#5B4732',        // Deep Umber Bronze
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#FAF8F5',     // Warm Linen (Base Page Background)
      surface: '#F3EFE6',     // Rich Cream (Secondary Section Surface)
      paper: '#FFFFFF',       // Crisp White Card Background
      elevated: '#FCFBF8',    // Subtle Raised Surface
    },
    text: {
      primary: '#1A2218',     // Deep Forest Charcoal Headings
      secondary: '#515C4C',   // Muted Moss-Sage Body Text
      disabled: '#8F998A',
      pitch: '#141A12',       // Pitch High-Contrast
    },
    accent: {
      oliveForest: '#E5ECDC', // Soft Sage Pill / Badge Background
      oliveBorder: '#D5DEC9', // Sage Pill Border
      goldGradient: 'linear-gradient(135deg, #1A2218 0%, #485A32 60%, #688248 100%)',
      warmGlow: 'radial-gradient(ellipse at 50% 0%, rgba(72, 90, 50, 0.08) 0%, transparent 70%)',
      oliveGlow: '0 4px 14px rgba(72, 90, 50, 0.25)',
      oliveGlowHover: '0 6px 20px rgba(72, 90, 50, 0.35)',
    },
    border: '#DCD6C8',        // The Boundary Architectural Border
    borderSubtle: '#EAE5DB',  // Soft Hairline Divider
    success: {
      main: '#3E6B48',
      light: '#E6EFE8',
      dark: '#26472E',
      contrastText: '#FFFFFF',
    },
    warning: {
      main: '#B87A28',
      light: '#FBF3E6',
      dark: '#855214',
      contrastText: '#FFFFFF',
    },
    error: {
      main: '#A83A32',
      light: '#F9ECEB',
      dark: '#7D2620',
      contrastText: '#FFFFFF',
    },
    info: {
      main: '#3B6878',
      light: '#E7F0F3',
      dark: '#234450',
      contrastText: '#FFFFFF',
    },
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSerif: '"Cormorant Garamond", Georgia, serif',
  },
  borderRadius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },
  shadows: {
    subtle: '0 2px 8px rgba(26, 34, 24, 0.04), 0 1px 3px rgba(26, 34, 24, 0.03)',
    card: '0 8px 30px rgba(26, 34, 24, 0.05), 0 1px 3px rgba(26, 34, 24, 0.04)',
    elevated: '0 16px 40px rgba(26, 34, 24, 0.08), 0 4px 12px rgba(26, 34, 24, 0.04)',
    modal: '0 24px 60px rgba(26, 34, 24, 0.16), 0 8px 24px rgba(26, 34, 24, 0.08)',
  },
} as const;
