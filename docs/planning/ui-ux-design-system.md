# EduSphere — UI/UX Design System Specification

**Specialist:** UI UX PRO MAX — Design System & Quality Specialist  
**Design Persona:** Modern Enterprise SaaS / Higher Education  
**Typography:** Plus Jakarta Sans  
**Theme Foundation:** Material UI (MUI v6) + Custom CSS Variables  
**WCAG Compliance:** Level AA (Minimum 4.5:1 text contrast, accessible focus rings)

---

## 1. Color Palette Tokens

```css
:root {
  /* Brand Primary: Trust & Authority */
  --color-primary: #2563EB;          /* Royal Cobalt */
  --color-primary-hover: #1D4ED8;
  --color-primary-active: #1E40AF;
  --color-on-primary: #FFFFFF;

  /* Secondary & Supporting */
  --color-secondary: #3B82F6;        /* Bright Blue */
  --color-secondary-hover: #2563EB;
  --color-on-secondary: #FFFFFF;

  /* High-Contrast Accent & Conversion */
  --color-accent: #EA580C;           /* Burnt Amber / Vibrant Orange */
  --color-accent-hover: #C2410C;
  --color-on-accent: #FFFFFF;

  /* Surfaces & Backgrounds */
  --color-background: #F8FAFC;       /* Slate 50 */
  --color-surface: #FFFFFF;          /* Pure White */
  --color-surface-elevated: #FFFFFF;
  --color-foreground: #0F172A;       /* Slate 900 */
  --color-foreground-muted: #475569; /* Slate 600 */

  /* Neutral Borders & Dividers */
  --color-border: #E2E8F0;           /* Slate 200 */
  --color-border-subtle: #F1F5F9;    /* Slate 100 */
  --color-divider: #E2E8F0;

  /* Status Tokens */
  --color-success: #16A34A;          /* Emerald 600 */
  --color-success-bg: #DCFCE7;       /* Emerald 50 */
  --color-warning: #D97706;          /* Amber 600 */
  --color-warning-bg: #FEF3C7;       /* Amber 50 */
  --color-error: #DC2626;            /* Red 600 */
  --color-error-bg: #FEE2E2;         /* Red 50 */
  --color-info: #0284C7;             /* Sky 600 */
  --color-info-bg: #E0F2FE;          /* Sky 50 */

  /* Focus & Rings */
  --color-ring: #2563EB;
  --focus-ring-offset: 2px;
}
```

---

## 2. Typography Hierarchy (Plus Jakarta Sans)

Font family imported from Google Fonts:
`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap');`

| Variant | Font Size | Line Height | Weight | Letter Spacing | Use Case |
|:---|:---:|:---:|:---:|:---:|:---|
| **h1** | 2.5rem (40px) | 1.2 | 800 (Bold) | -0.025em | Marketing Hero, Page Main Titles |
| **h2** | 2.0rem (32px) | 1.25 | 700 (Bold) | -0.02em | Section Headings, Top Dashboard Titles |
| **h3** | 1.5rem (24px) | 1.3 | 700 (Bold) | -0.015em | Card Titles, Modal Headers |
| **h4** | 1.25rem (20px) | 1.35 | 600 (SemiBold) | -0.01em | Subsections, Table Category Headers |
| **h5** | 1.0rem (16px) | 1.4 | 600 (SemiBold) | 0 | Widget Headers, Module Group Titles |
| **body1** | 1.0rem (16px) | 1.5 | 400 (Regular) | 0 | Primary Paragraphs, Form Inputs |
| **body2** | 0.875rem (14px) | 1.5 | 400 (Regular) | 0 | Secondary Descriptions, Table Body Cells |
| **caption** | 0.75rem (12px) | 1.4 | 500 (Medium) | +0.02em | Timestamps, Metadata, Helper Text |
| **button** | 0.875rem (14px) | 1.25 | 600 (SemiBold) | +0.01em | Action Buttons, Tabs |

---

## 3. Elevation & Radius Tokens

```css
:root {
  /* Border Radius */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --radius-full: 9999px;

  /* Elevation Shadows (Tailored Soft Enterprise SaaS) */
  --shadow-xs: 0 1px 2px 0 rgba(15, 23, 42, 0.05);
  --shadow-sm: 0 1px 3px 0 rgba(15, 23, 42, 0.08), 0 1px 2px -1px rgba(15, 23, 42, 0.08);
  --shadow-md: 0 4px 6px -1px rgba(15, 23, 42, 0.08), 0 2px 4px -2px rgba(15, 23, 42, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.04);
}
```

---

## 4. Material UI (MUI v6) Theme Overrides Blueprint

```typescript
import { createTheme } from '@mui/material/styles';

export const edusphereTheme = createTheme({
  palette: {
    primary: {
      main: '#2563EB',
      light: '#3B82F6',
      dark: '#1D4ED8',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#EA580C',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F8FAFC',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#0F172A',
      secondary: '#475569',
    },
    divider: '#E2E8F0',
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 18px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)',
          },
        },
        containedPrimary: {
          backgroundColor: '#2563EB',
          '&:hover': {
            backgroundColor: '#1D4ED8',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px 0 rgba(15, 23, 42, 0.05)',
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        size: 'small',
        variant: 'outlined',
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          backgroundColor: '#FFFFFF',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#CBD5E1',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#94A3B8',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#2563EB',
            borderWidth: 2,
          },
        },
      },
    },
  },
});
```

---

## 5. Accessibility & Quality Rules (Strictly Enforced)

1. **No Emojis as Icons:** All interactive icons must use standard SVGs from `@mui/icons-material` or `lucide-react`. Emojis render inconsistently across operating systems and lack screen reader semantics.
2. **Minimum Touch Targets:** All clickable interactive buttons, chips, and table icons must satisfy a minimum boundary of `44px x 44px` on mobile/tablet screens.
3. **Focus Visibility:** Custom focus outlines must never be eliminated (`outline: none` without focus-visible replacement is banned). Keyboard users must see a 2px blue ring (`#2563EB`).
4. **Color Contrast:** All body text must pass the 4.5:1 ratio against backgrounds (verified: `#0F172A` on `#FFFFFF` gives 15.3:1; `#475569` on `#FFFFFF` gives 5.6:1).
5. **No Layout Shifts (CLS < 0.1):** Skeleton loaders must match exact dimensional heights of cards and table rows before data settles.
