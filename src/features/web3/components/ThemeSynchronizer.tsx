'use client';

import { useEffect } from 'react';
import { useMantineColorScheme } from '@mantine/core';
import { useAppKitTheme } from '@reown/appkit/react';

/**
 * This component synchronizes the AppKit theme with the Mantine theme.
 * It should be rendered inside a component that's only mounted after AppKit is initialized.
 */
export function ThemeSynchronizer() {
  const { themeMode } = useAppKitTheme();
  const { setColorScheme } = useMantineColorScheme();

  useEffect(() => {
    if (themeMode === 'dark') {
      setColorScheme('dark');
    } else if (themeMode === 'light') {
      setColorScheme('light');
    }
  }, [themeMode, setColorScheme]);

  // This component doesn't render anything
  return null;
}
