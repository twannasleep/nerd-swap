import { Web3Provider } from '@/features/web3/context';

interface RootProviderProps {
  children: React.ReactNode;
  cookies: string | null;
}

export const RootProvider = ({ children, cookies }: RootProviderProps) => {
  return <Web3Provider cookies={cookies}>{children}</Web3Provider>;
};
