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

// Create and export the theme configuration with Uniswap-like styling
export const theme: MantineThemeOverride = createTheme({
  // Basic theme configuration
  defaultRadius: 'md',
  primaryColor: 'primary',
  fontFamily:
    'Inter, var(--font-geist-sans), -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
  fontFamilyMonospace: 'var(--font-geist-mono), Monaco, Courier, monospace',
  defaultGradient: { from: 'primary', to: 'primary', deg: 45 },

  // Colors configuration - Uniswap-like palette
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

  // Size configuration - compact spacing for trading UI
  spacing: {
    xs: rem(8),
    sm: rem(12),
    md: rem(16),
    lg: rem(24),
    xl: rem(32),
  },

  // Font size configuration
  fontSizes: {
    xs: rem(11),
    sm: rem(13),
    md: rem(15),
    lg: rem(17),
    xl: rem(19),
  },

  // Radius configuration - more rounded for modern UI
  radius: {
    xs: rem(3),
    sm: rem(5),
    md: rem(8),
    lg: rem(12),
    xl: rem(16),
  },

  // Shadows configuration - subtle for depth
  shadows: {
    xs: '0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2)',
    sm: '0 3px 6px rgba(0, 0, 0, 0.35), 0 2px 4px rgba(0, 0, 0, 0.25)',
    md: '0 6px 10px rgba(0, 0, 0, 0.4), 0 3px 5px rgba(0, 0, 0, 0.3)',
    lg: '0 10px 20px rgba(0, 0, 0, 0.45), 0 6px 6px rgba(0, 0, 0, 0.35)',
    xl: '0 14px 28px rgba(0, 0, 0, 0.5), 0 10px 10px rgba(0, 0, 0, 0.4)',
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
  light: {
    '--mantine-color-body': '#FFFFFF',
    '--mantine-color-text': '#1F2937',
    '--mantine-color-dimmed': '#6B7280',
    '--mantine-color-anchor': theme.colors?.primary?.[6] || '#DB89F6',
    '--mantine-color-bright': '#FFFFFF',
    '--mantine-color-surface-1': '#F5F7FA',
    '--mantine-color-surface-2': '#E5E7EB',
    '--mantine-color-surface-3': '#D1D5DB',
  },
  dark: {
    // Custom design system variables optimized for Uniswap-like dark theme
    '--mantine-color-bright': '#FFFFFF',
    '--mantine-color-text': '#F9FAFB',
    '--mantine-color-body': theme.colors?.dark?.[8] || '#131519',
    '--mantine-color-dimmed': '#9CA3AF',
    '--mantine-color-placeholder': '#6B7280',
    '--mantine-color-anchor': theme.colors?.primary?.[6] || '#DB89F6',
    '--mantine-color-accent': theme.colors?.accent?.[5] || '#0073FF',
    '--mantine-color-success': theme.colors?.success?.[5] || '#1ABD65',
    '--mantine-color-error': theme.colors?.error?.[5] || '#FF5C5C',
    '--mantine-color-neutral': theme.colors?.neutral?.[5] || '#525252',
    '--mantine-color-warm': theme.colors?.warm?.[5] || '#FF6E00',
    '--mantine-color-surface-1': '#1E1F25', // Slightly lighter than body
    '--mantine-color-surface-2': '#252731', // Cards, dropdowns
    '--mantine-color-surface-3': '#2E303B', // Elevated surfaces
  },
});
