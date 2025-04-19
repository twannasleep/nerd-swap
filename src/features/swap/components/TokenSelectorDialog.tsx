'use client';

import * as React from 'react';
import { AlertCircleIcon, ImportIcon, SearchIcon, XIcon } from 'lucide-react';
import { toast } from 'sonner';
import { erc20Abi } from 'viem';
import { useAccount, useReadContract } from 'wagmi';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { BNB_TESTNET_CHAIN_ID, BaseToken, NATIVE_BNB_ADDRESS } from '../constants';
import { useTokenBalances } from '../hooks/useTokenBalances';

interface TokenSelectorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectToken: (token: BaseToken) => void;
  selectedTokenAddress?: `0x${string}`;
}

// Placeholder token list - in a real app, this would come from a token list API
const DEFAULT_TOKENS: BaseToken[] = [
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
  const [tokens, setTokens] = React.useState<BaseToken[]>(DEFAULT_TOKENS);
  const [importAddress, setImportAddress] = React.useState<string>('');
  const [isImportMode, setIsImportMode] = React.useState(false);
  const [importData, setImportData] = React.useState<{
    address: `0x${string}`;
    name: string;
    symbol: string;
    decimals: number;
    loading: boolean;
    error: string | null;
  } | null>(null);

  const { address: account } = useAccount();

  const { getBalanceByToken, isLoading: isLoadingBalances } = useTokenBalances({
    account,
  });

  // Clear search when dialog opens
  React.useEffect(() => {
    if (open) {
      setSearchTerm('');
      setIsImportMode(false);
      setImportAddress('');
      setImportData(null);
    }
  }, [open]);

  // Token import contract reads
  const isValidAddress = React.useMemo(() => {
    return /^0x[a-fA-F0-9]{40}$/.test(importAddress);
  }, [importAddress]);

  const { data: tokenSymbol, isLoading: isLoadingSymbol } = useReadContract({
    address: isValidAddress ? (importAddress as `0x${string}`) : undefined,
    abi: erc20Abi,
    functionName: 'symbol',
    chainId: BNB_TESTNET_CHAIN_ID,
    query: {
      enabled: isImportMode && isValidAddress,
    },
  });

  const { data: tokenName, isLoading: isLoadingName } = useReadContract({
    address: isValidAddress ? (importAddress as `0x${string}`) : undefined,
    abi: erc20Abi,
    functionName: 'name',
    chainId: BNB_TESTNET_CHAIN_ID,
    query: {
      enabled: isImportMode && isValidAddress,
    },
  });

  const { data: tokenDecimals, isLoading: isLoadingDecimals } = useReadContract({
    address: isValidAddress ? (importAddress as `0x${string}`) : undefined,
    abi: erc20Abi,
    functionName: 'decimals',
    chainId: BNB_TESTNET_CHAIN_ID,
    query: {
      enabled: isImportMode && isValidAddress,
    },
  });

  // Update import data when contract reads complete
  React.useEffect(() => {
    if (isImportMode && isValidAddress) {
      const isLoading = isLoadingSymbol || isLoadingName || isLoadingDecimals;

      if (!isLoading && tokenSymbol && tokenName && tokenDecimals !== undefined) {
        setImportData({
          address: importAddress as `0x${string}`,
          name: tokenName.toString(),
          symbol: tokenSymbol.toString(),
          decimals: Number(tokenDecimals),
          loading: false,
          error: null,
        });
      } else if (!isLoading && (!tokenSymbol || !tokenName || tokenDecimals === undefined)) {
        setImportData({
          address: importAddress as `0x${string}`,
          name: '',
          symbol: '',
          decimals: 18,
          loading: false,
          error: 'Not a valid ERC20 token',
        });
      } else {
        setImportData({
          address: importAddress as `0x${string}`,
          name: '',
          symbol: '',
          decimals: 18,
          loading: isLoading,
          error: null,
        });
      }
    }
  }, [
    isImportMode,
    isValidAddress,
    importAddress,
    tokenSymbol,
    tokenName,
    tokenDecimals,
    isLoadingSymbol,
    isLoadingName,
    isLoadingDecimals,
  ]);

  // Filter logic (now includes address)
  const filteredTokens = React.useMemo(() => {
    if (!searchTerm) return tokens;

    const lowerSearchTerm = searchTerm.toLowerCase();
    const filtered = tokens.filter(
      token =>
        token.symbol.toLowerCase().includes(lowerSearchTerm) ||
        token.name.toLowerCase().includes(lowerSearchTerm) ||
        token.address.toLowerCase().includes(lowerSearchTerm)
    );

    // If no tokens found and search looks like an address, show import option
    if (filtered.length === 0 && /^0x[a-fA-F0-9]{40}$/.test(searchTerm)) {
      // Check if already in the token list
      const existingToken = tokens.find(
        token => token.address.toLowerCase() === searchTerm.toLowerCase()
      );

      if (!existingToken) {
        setImportAddress(searchTerm);
        return [];
      }
    }

    return filtered;
  }, [searchTerm, tokens]);

  const handleImportToken = () => {
    if (importData && !importData.error && !importData.loading) {
      const newToken: BaseToken = {
        address: importData.address,
        name: importData.name,
        symbol: importData.symbol,
        decimals: importData.decimals,
        // Use a generic token icon
        logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1.png',
      };

      // Add to tokens list
      setTokens(prevTokens => {
        // Check if token already exists
        if (
          prevTokens.some(token => token.address.toLowerCase() === newToken.address.toLowerCase())
        ) {
          return prevTokens;
        }
        return [...prevTokens, newToken];
      });

      toast.success(`Imported ${newToken.symbol} token`, {
        description: `${newToken.name} has been added to your token list.`,
      });

      // Select the imported token
      onSelectToken(newToken);
      onOpenChange(false);
    }
  };

  const handleAddressSearch = () => {
    if (importAddress && /^0x[a-fA-F0-9]{40}$/.test(importAddress)) {
      setIsImportMode(true);
    }
  };

  const handleSelect = (token: BaseToken) => {
    onSelectToken(token);
    onOpenChange(false); // Close dialog on selection
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  const handleBackToSearch = () => {
    setIsImportMode(false);
    setImportData(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        {!isImportMode ? (
          <>
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
                    {isValidAddress ? (
                      <div className="w-full text-center">
                        <p className="text-muted-foreground mb-3 text-sm">
                          Token not found in the list
                        </p>
                        <Button
                          variant="outline"
                          className="mx-auto flex items-center gap-2"
                          onClick={handleAddressSearch}
                        >
                          <ImportIcon className="h-4 w-4" />
                          <span>Import Token</span>
                        </Button>
                      </div>
                    ) : (
                      <>
                        <p className="text-muted-foreground text-center text-sm">
                          No tokens found.
                        </p>
                        <Button
                          variant="link"
                          className="mt-2 h-auto p-0"
                          onClick={handleClearSearch}
                        >
                          Clear search
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </ScrollArea>
            <DialogFooter className="flex-col sm:flex-col">
              <Label className="mb-2">Don't see your token?</Label>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="0x..."
                  value={importAddress}
                  onChange={e => setImportAddress(e.target.value)}
                  className="flex-1"
                />
                <Button variant="outline" disabled={!isValidAddress} onClick={handleAddressSearch}>
                  Import
                </Button>
              </div>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Import Token</DialogTitle>
              <DialogDescription>Add a custom token to your list</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {importData?.loading ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Skeleton className="mb-2 h-12 w-12 rounded-full" />
                  <Skeleton className="mb-1 h-5 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ) : importData?.error ? (
                <div className="bg-destructive/15 text-destructive flex items-center gap-2 rounded-lg p-3">
                  <AlertCircleIcon className="h-5 w-5" />
                  <div className="flex flex-col">
                    <span className="font-medium">Invalid Token</span>
                    <span className="text-sm">{importData.error}</span>
                  </div>
                </div>
              ) : importData ? (
                <div className="flex flex-col items-center justify-center space-y-3">
                  <div className="bg-muted flex h-16 w-16 items-center justify-center rounded-full">
                    <span className="text-2xl font-bold">{importData.symbol?.[0] || '?'}</span>
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-medium">{importData.symbol || 'Unknown Token'}</h3>
                    <p className="text-muted-foreground text-sm">
                      {importData.name || 'Unknown Name'}
                    </p>
                  </div>
                  <div className="bg-muted/50 w-full rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-sm">Address</span>
                      <span className="font-mono text-xs">
                        {truncateAddress(importData.address)}
                      </span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-sm">Decimals</span>
                      <span>{importData.decimals}</span>
                    </div>
                  </div>
                  <div className="flex w-full items-center gap-2 rounded-lg bg-amber-500/15 p-3 text-amber-600">
                    <AlertCircleIcon className="h-5 w-5" />
                    <p className="text-sm">
                      This token isn't traded on major DEXes. Always conduct your own research
                      before trading.
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
            <DialogFooter className="flex-col gap-2 sm:flex-col">
              {importData && !importData.loading && !importData.error && (
                <Button className="w-full" onClick={handleImportToken}>
                  Import Token
                </Button>
              )}
              <Button variant="outline" className="w-full" onClick={handleBackToSearch}>
                Back to Search
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Helper function to truncate addresses
function truncateAddress(address: string): string {
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}
