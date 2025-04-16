import { createTheme, rem } from '@mantine/core';
import type { MantineThemeOverride } from '@mantine/core';
import {
  accentColor,
  darkColor,
  errorColor,
  neutralColor,
  primaryColor,
  successColor,
  warmColor,
} from './colors';
import { components } from './components';

// Create and export the theme configuration with compact sizing by default
export const theme: MantineThemeOverride = createTheme({
  // Basic theme configuration - compact by default
  defaultRadius: 'md',
  primaryColor: 'primary',
  fontFamily:
    'Inter, var(--font-geist-sans), -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
  fontFamilyMonospace: 'var(--font-geist-mono), Monaco, Courier, monospace',
  defaultGradient: { from: 'primary', to: 'primary', deg: 45 },

  // Colors configuration
  colors: {
    primary: primaryColor,
    dark: darkColor,
    accent: accentColor,
    success: successColor,
    error: errorColor,
    neutral: neutralColor,
    warm: warmColor,
  },

  // Global settings
  autoContrast: true,
  fontSmoothing: true,
  primaryShade: {
    light: 6,
    dark: 6,
  },

  // Size configuration - compact spacing
  spacing: {
    xs: rem(8),
    sm: rem(12),
    md: rem(16),
    lg: rem(24),
    xl: rem(32),
  },

  // Font size configuration - compact sizing
  fontSizes: {
    xs: rem(11),
    sm: rem(13),
    md: rem(15),
    lg: rem(17),
    xl: rem(19),
  },

  // Radius configuration - slightly reduced for compact UI
  radius: {
    xs: rem(2),
    sm: rem(3),
    md: rem(5),
    lg: rem(7),
    xl: rem(9),
  },

  // Shadows configuration - refined for depth and dimension
  shadows: {
    xs: '0 1px 3px rgba(0, 0, 0, 0.4), 0 1px 2px rgba(0, 0, 0, 0.2)',
    sm: '0 3px 6px rgba(0, 0, 0, 0.45), 0 2px 4px rgba(0, 0, 0, 0.25)',
    md: '0 6px 10px rgba(0, 0, 0, 0.5), 0 3px 5px rgba(0, 0, 0, 0.3)',
    lg: '0 10px 20px rgba(0, 0, 0, 0.55), 0 6px 6px rgba(0, 0, 0, 0.35)',
    xl: '0 14px 28px rgba(0, 0, 0, 0.6), 0 10px 10px rgba(0, 0, 0, 0.4)',
  },

  // Other global settings
  cursorType: 'pointer',

  // Breakpoints for responsive design
  breakpoints: {
    xs: '36em', // 576px
    sm: '48em', // 768px
    md: '62em', // 992px
    lg: '75em', // 1200px
    xl: '88em', // 1408px
  },

  // Component-specific configurations
  components,
});

// CSS variables resolver for custom properties
export const cssVariablesResolver = (theme: MantineThemeOverride) => ({
  variables: {},
  light: {},
  dark: {
    // Custom design system variables optimized for #FF990A primary
    '--mantine-color-bright': '#FFFFFF',
    '--mantine-color-text': '#F7F7F7',
    '--mantine-color-body': theme.colors?.dark?.[9] || '#141414',
    '--mantine-color-dimmed': '#BDBDBD',
    '--mantine-color-placeholder': '#9E9E9E',
    '--mantine-color-anchor': theme.colors?.primary?.[6] || '#FF990A',
    '--mantine-color-accent': theme.colors?.accent?.[5] || '#0091FF',
    '--mantine-color-success': theme.colors?.success?.[5] || '#1ABD65',
    '--mantine-color-error': theme.colors?.error?.[5] || '#FF5C5C',
    '--mantine-color-neutral': theme.colors?.neutral?.[5] || '#525252',
    '--mantine-color-warm': theme.colors?.warm?.[5] || '#FF6E00',
    '--mantine-color-surface-1': '#1A1A1A',
    '--mantine-color-surface-2': '#212121',
    '--mantine-color-surface-3': '#282828',
  },
});
