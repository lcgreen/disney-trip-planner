// Disney Trip Planner Design System
// Design tokens for consistent theming across all components

export const colors = {
  // Disney Brand Colors
  disney: {
    blue: '#003087',
    purple: '#7C3AED',
    gold: '#FFD700',
    orange: '#FFA500',
    pink: '#FF69B4',
    green: '#00B347',
    teal: '#20B2AA',
  },

  // Park-specific Colors
  park: {
    magic: '#4F46E5',      // Magic Kingdom - Blue/Purple
    epcot: '#EC4899',      // EPCOT - Purple/Pink
    hollywood: '#DC2626',  // Hollywood Studios - Red/Orange
    animal: '#059669',     // Animal Kingdom - Green/Teal
    california: '#EA580C', // Disneyland - Orange/Red
    paris: '#6366F1',      // Paris - Purple/Blue
    tokyo: '#F43F5E',      // Tokyo - Pink/Red
    shanghai: '#0891B2',   // Shanghai - Blue/Green
    hongkong: '#16A34A',   // Hong Kong - Green/Blue
  },

  // Semantic Colors
  semantic: {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },

  // Neutral Colors
  neutral: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
} as const

export const gradients = {
  // Primary Disney Gradients
  disney: 'linear-gradient(135deg, #003087 0%, #7C3AED 100%)',
  premium: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',

  // Park Gradients
  magicKingdom: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
  epcot: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
  hollywoodStudios: 'linear-gradient(135deg, #DC2626 0%, #EA580C 100%)',
  animalKingdom: 'linear-gradient(135deg, #059669 0%, #20B2AA 100%)',
  disneyland: 'linear-gradient(135deg, #EA580C 0%, #DC2626 100%)',
  disneylandParis: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)',
  tokyoDisneyland: 'linear-gradient(135deg, #EC4899 0%, #F43F5E 100%)',
  shanghaiDisneyland: 'linear-gradient(135deg, #4F46E5 0%, #059669 100%)',
  hongKongDisneyland: 'linear-gradient(135deg, #059669 0%, #4F46E5 100%)',

  // Background Gradients
  lightBackground: 'linear-gradient(135deg, #F0F9FF 0%, #FAF5FF 50%, #FDF2F8 100%)',
  darkBackground: 'linear-gradient(135deg, #1E3A8A 0%, #7C3AED 50%, #BE185D 100%)',
} as const

export const typography = {
  fontFamily: {
    sans: ['Poppins', 'system-ui', 'sans-serif'],
    display: ['Fredoka One', 'cursive'],
  },

  fontSize: {
    xs: '0.75rem',      // 12px
    sm: '0.875rem',     // 14px
    base: '1rem',       // 16px
    lg: '1.125rem',     // 18px
    xl: '1.25rem',      // 20px
    '2xl': '1.5rem',    // 24px
    '3xl': '1.875rem',  // 30px
    '4xl': '2.25rem',   // 36px
    '5xl': '3rem',      // 48px
    '6xl': '3.75rem',   // 60px
  },

  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },

  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
  },
} as const

export const spacing = {
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
} as const

export const borderRadius = {
  none: '0',
  sm: '0.125rem',   // 2px
  base: '0.25rem',  // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px',
} as const

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',

  // Disney-specific shadows
  disney: '0 0 20px rgba(255, 215, 0, 0.3)',
  premium: '0 0 30px rgba(255, 215, 0, 0.2)',
  magical: '0 0 15px rgba(124, 58, 237, 0.3)',
} as const

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const

export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
} as const

// Component-specific design tokens
export const components = {
  button: {
    sizes: {
      sm: {
        padding: `${spacing[2]} ${spacing[4]}`,
        fontSize: typography.fontSize.sm,
        borderRadius: borderRadius.full,
      },
      md: {
        padding: `${spacing[3]} ${spacing[6]}`,
        fontSize: typography.fontSize.base,
        borderRadius: borderRadius.full,
      },
      lg: {
        padding: `${spacing[4]} ${spacing[8]}`,
        fontSize: typography.fontSize.lg,
        borderRadius: borderRadius.full,
      },
    },

    variants: {
      disney: {
        background: gradients.disney,
        color: '#FFFFFF',
        shadow: shadows.lg,
      },
      premium: {
        background: gradients.premium,
        color: colors.disney.blue,
        shadow: shadows.premium,
      },
      secondary: {
        background: '#FFFFFF',
        color: colors.neutral[700],
        border: `1px solid ${colors.neutral[300]}`,
        shadow: shadows.sm,
      },
    },
  },

  card: {
    variants: {
      default: {
        background: '#FFFFFF',
        borderRadius: borderRadius['2xl'],
        shadow: shadows.lg,
        border: `2px solid transparent`,
      },
      premium: {
        background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
        borderRadius: borderRadius['2xl'],
        shadow: shadows.premium,
        border: `2px solid ${colors.disney.gold}`,
      },
    },
  },
} as const

// Theme configuration
export const theme = {
  colors,
  gradients,
  typography,
  spacing,
  borderRadius,
  shadows,
  breakpoints,
  zIndex,
  components,
} as const

export type Theme = typeof theme
export type Colors = typeof colors
export type Gradients = typeof gradients