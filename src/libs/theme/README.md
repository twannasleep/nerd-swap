# NerdSwap Theme Documentation

This directory contains the custom Chakra UI theme for the NerdSwap token swap application.

## Overview

The theme is built using Chakra UI's theming system, powered by Panda CSS. It provides a comprehensive set of design tokens, semantic tokens, and component recipes tailored for a token swap interface.

## Files

- `theme.ts` - Main theme configuration with tokens, semantic tokens, and recipes
- `theme-provider.tsx` - Provider component for applying the theme
- `color-mode.tsx` - Dark/light mode implementation
- `tooltip.tsx` - Custom tooltip component
- `toaster.tsx` - Custom toast notifications

## Usage

### Theme Provider

The theme is automatically applied throughout the application via the `ThemeProvider` component:

```tsx
import { ThemeProvider } from '@/libs/theme/theme-provider';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
```

### Design Tokens

The theme includes tokens for colors, spacing, typography, and more:

```tsx
import { Box, Text } from '@chakra-ui/react';

export function Component() {
  return (
    <Box bg="primary.500" p="4" borderRadius="lg">
      <Text color="white">Hello World</Text>
    </Box>
  );
}
```

### Semantic Tokens

Semantic tokens automatically adapt to light/dark mode:

```tsx
import { Box, Text } from '@chakra-ui/react';

export function Component() {
  return (
    <Box bg="bg.surface" p="4" borderRadius="lg" boxShadow="card">
      <Text color="text.default">This adapts to light/dark mode</Text>
    </Box>
  );
}
```

### Text Styles

Use predefined text styles for consistent typography:

```tsx
import { Text } from '@chakra-ui/react';

export function Component() {
  return <Text textStyle="h1">Heading</Text>;
}
```

### Layer Styles

Apply consistent styling patterns:

```tsx
import { Box } from '@chakra-ui/react';

export function Component() {
  return <Box layerStyle="card">Card content</Box>;
}
```

### Component Recipes

Use the custom component recipes for specific UI patterns:

```tsx
import { Button } from '@chakra-ui/react';

export function Component() {
  return (
    <Button variant="solid" size="lg">
      Swap Tokens
    </Button>
  );
}
```

### Slot Recipes for Compound Components

The theme includes slot-based recipes for complex components like the swap form:

```tsx
import { Box, Button, Icon } from '@chakra-ui/react';
import { swapForm } from '@/libs/theme/recipes';

export function SwapForm() {
  const styles = swapForm();

  return (
    <Box {...styles.container}>
      <Box {...styles.fromSection}>{/* From token input */}</Box>
      <Box {...styles.arrow}>
        <Icon />
      </Box>
      <Box {...styles.toSection}>{/* To token input */}</Box>
      <Button {...styles.submitButton}>Swap</Button>
    </Box>
  );
}
```

### Dark Mode

The theme automatically supports dark mode. You can use the `ColorModeButton` component to toggle between light and dark:

```tsx
import { ColorModeButton } from '@/libs/theme/color-mode';

export function Header() {
  return (
    <header>
      <ColorModeButton />
    </header>
  );
}
```

## Customization

To modify the theme, edit the `theme.ts` file. After making changes, regenerate the TypeScript types:

```bash
npx @chakra-ui/cli typegen ./src/libs/theme/theme.ts
```
