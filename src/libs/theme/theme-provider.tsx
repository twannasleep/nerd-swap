'use client';

import { PropsWithChildren } from 'react';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { cssVariablesResolver, theme } from '.';

export function ThemeProvider({ children }: PropsWithChildren) {
  return (
    <MantineProvider
      theme={theme}
      defaultColorScheme="dark"
      cssVariablesResolver={cssVariablesResolver}
    >
      <Notifications position="top-right" limit={5} autoClose={4000} />
      {children}
    </MantineProvider>
  );
}
