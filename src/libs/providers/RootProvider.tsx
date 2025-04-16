import { ThemeProvider } from '../theme/theme-provider';

export const RootProvider = ({ children }: { children: React.ReactNode }) => {
  return <ThemeProvider>{children}</ThemeProvider>;
};
