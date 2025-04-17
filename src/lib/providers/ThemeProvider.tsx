'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { ThemeProviderProps } from 'next-themes';

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // Set attribute='class' to control the theme via the class on the html tag
  // Set defaultTheme='dark' to make dark the default
  // disableTransitionOnChange stops theme changes causing flashes
  return (
    <NextThemesProvider attribute="class" defaultTheme="dark" disableTransitionOnChange {...props}>
      {children}
    </NextThemesProvider>
  );
}
