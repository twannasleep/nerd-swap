import { defineConfig } from '@chakra-ui/react';
import { createSystem, defaultConfig } from '@chakra-ui/react';

const config = defineConfig({
  cssVarsRoot: ':where(:root, :host)',
  cssVarsPrefix: 'ck',
  theme: {
    breakpoints: {
      sm: '40em',
      md: '52em',
      lg: '64em',
      xl: '80em',
      '2xl': '96em',
    },
  },
  strictTokens: true,
});

const theme = createSystem(defaultConfig, config);

export default theme;
