'use client';

import { useTheme } from 'next-themes';
import { Toaster as Sonner, ToasterProps } from 'sonner';

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();

  // Ensure theme is not undefined with type narrowing
  const safeTheme: 'system' | 'light' | 'dark' =
    theme === 'light' || theme === 'dark' || theme === 'system' ? theme : 'system';

  return (
    <Sonner
      theme={safeTheme}
      className="toaster group"
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
