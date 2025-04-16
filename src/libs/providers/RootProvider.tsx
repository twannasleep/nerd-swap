import { Web3Provider } from '@/features/web3/context';
import { ThemeProvider } from '../theme/theme-provider';

interface RootProviderProps {
  children: React.ReactNode;
  cookies: string | null;
}

export const RootProvider = ({ children, cookies }: RootProviderProps) => {
  return (
    <ThemeProvider>
      <Web3Provider cookies={cookies}>{children}</Web3Provider>
    </ThemeProvider>
  );
};
