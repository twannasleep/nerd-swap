'use client';

import * as React from 'react';
import { SearchIcon, XIcon } from 'lucide-react';
import { useAccount } from 'wagmi';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { NATIVE_BNB_ADDRESS } from '../constants';
import { useTokenBalances } from '../hooks/useTokenBalances';
import { BaseToken } from '../types';

interface TokenSelectorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectToken: (token: BaseToken) => void;
  selectedTokenAddress?: `0x${string}`;
}

// Placeholder token list - in a real app, this would come from a token list API
const TOKENS: BaseToken[] = [
  {
    address: NATIVE_BNB_ADDRESS,
    symbol: 'BNB',
    name: 'BNB',
    decimals: 18,
    logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png',
  },
  {
    address: '0xfe113952C81D14520a8752C87c47f79564892bA3' as `0x${string}`,
    symbol: 'TEST63',
    name: 'Test Token 63',
    decimals: 18,
    logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/825.png', // Using USDC logo as placeholder
  },
  {
    address: '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd' as `0x${string}`,
    symbol: 'USDT',
    name: 'USDT Token (Testnet)',
    decimals: 18,
    logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/825.png',
  },
  {
    address: '0xeD24FC36d5Ee211Ea25A80239Fb8C4Cfd80f12Ee' as `0x${string}`,
    symbol: 'BUSD',
    name: 'BUSD Token (Testnet)',
    decimals: 18,
    logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/4687.png',
  },
  {
    address: '0xae13d989dac2f0debff460ac112a837c89baa7cd' as `0x${string}`,
    symbol: 'WBNB',
    name: 'Wrapped BNB (Testnet)',
    decimals: 18,
    logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png',
  },
  // Add more test tokens if needed
];

export function TokenSelectorDialog({
  open,
  onOpenChange,
  onSelectToken,
  selectedTokenAddress,
}: TokenSelectorDialogProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const { address: account } = useAccount();

  const { getBalanceByToken, isLoading: isLoadingBalances } = useTokenBalances({
    account,
  });

  // Clear search when dialog opens
  React.useEffect(() => {
    if (open) {
      setSearchTerm('');
    }
  }, [open]);

  // Filter logic (now includes address)
  const filteredTokens = React.useMemo(() => {
    if (!searchTerm) return TOKENS;

    const lowerSearchTerm = searchTerm.toLowerCase();
    return TOKENS.filter(
      token =>
        token.symbol.toLowerCase().includes(lowerSearchTerm) ||
        token.name.toLowerCase().includes(lowerSearchTerm) ||
        token.address.toLowerCase().includes(lowerSearchTerm)
    );
  }, [searchTerm]);

  const handleSelect = (token: BaseToken) => {
    onSelectToken(token);
    onOpenChange(false); // Close dialog on selection
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Select a token</DialogTitle>
          <DialogDescription>Search for a token by name, symbol, or address.</DialogDescription>
        </DialogHeader>
        <div className="relative">
          <div className="relative">
            <SearchIcon className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Search name, symbol, or address..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pr-9 pl-9"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-1/2 right-1 h-6 w-6 -translate-y-1/2 rounded-full p-0"
                onClick={handleClearSearch}
              >
                <XIcon className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        <ScrollArea className="max-h-[300px] overflow-y-auto">
          <div className="space-y-1 p-1">
            {filteredTokens.length > 0 ? (
              filteredTokens.map(token => {
                const balance = getBalanceByToken(token);
                const isSelected = selectedTokenAddress === token.address;

                return (
                  <Button
                    key={token.address}
                    variant="ghost"
                    className={cn(
                      'h-auto w-full justify-between px-3 py-3',
                      isSelected && 'bg-secondary'
                    )}
                    onClick={() => handleSelect(token)}
                  >
                    <div className="flex items-center gap-3">
                      {token.logoURI ? (
                        <img
                          src={token.logoURI}
                          alt={token.symbol}
                          className="h-8 w-8 rounded-full"
                        />
                      ) : (
                        <div className="bg-muted h-8 w-8 rounded-full" />
                      )}
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{token.symbol}</span>
                        <span className="text-muted-foreground text-xs">{token.name}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      {isLoadingBalances ? (
                        <Skeleton className="h-5 w-16" />
                      ) : (
                        <span className="text-sm">{balance?.formatted ?? '0.00'}</span>
                      )}
                    </div>
                  </Button>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <p className="text-muted-foreground text-center text-sm">No tokens found.</p>
                <Button variant="link" className="mt-2 h-auto p-0" onClick={handleClearSearch}>
                  Clear search
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
