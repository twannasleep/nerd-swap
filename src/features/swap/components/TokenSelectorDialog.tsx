'use client';

import * as React from 'react';
// Assuming Input component exists
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
// Assuming Dialog components exist
import { Input } from '@/components/ui/input';

// Assuming Button component exists

// Define a basic token type (expand later)
interface Token {
  address: string;
  symbol: string;
  name: string;
  logoURI?: string;
}

interface TokenSelectorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectToken: (token: Token) => void;
  // Add other necessary props like chainId, existing selection, etc.
}

// Placeholder token list - replace with actual data/fetching
const TOKENS: Token[] = [
  {
    address: '0xNative', // Placeholder for native token (e.g., BNB)
    symbol: 'BNB',
    name: 'BNB',
  },
  {
    address: '0xfe113952C81D14520a8752C87c47f79564892bA3', // TEST63 address
    symbol: 'TEST63',
    name: 'Test Token 63',
  },
  // Add more tokens if needed
];

export function TokenSelectorDialog({
  open,
  onOpenChange,
  onSelectToken,
}: TokenSelectorDialogProps) {
  const [searchTerm, setSearchTerm] = React.useState('');

  // Filter logic (basic example)
  const filteredTokens = TOKENS.filter(
    token =>
      token.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      token.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (token: Token) => {
    onSelectToken(token);
    onOpenChange(false); // Close dialog on selection
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Select a token</DialogTitle>
          <DialogDescription>Search for a token by name or symbol.</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Input
            placeholder="Search name or symbol..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="mb-4"
          />
          <div className="max-h-[300px] space-y-2 overflow-y-auto">
            {filteredTokens.length > 0 ? (
              filteredTokens.map(token => (
                <Button
                  key={token.address}
                  variant="ghost"
                  className="h-auto w-full justify-start px-3 py-2"
                  onClick={() => handleSelect(token)}
                >
                  {/* Basic Token Display - Enhance later with logo */}
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{token.symbol}</span>
                    <span className="text-muted-foreground text-xs">{token.name}</span>
                  </div>
                </Button>
              ))
            ) : (
              <p className="text-muted-foreground py-4 text-center text-sm">No tokens found.</p>
            )}
          </div>
        </div>
        {/* Footer could be used for managing custom tokens later */}
        {/* <DialogFooter>
          <Button variant="outline">Manage Token Lists</Button>
        </DialogFooter> */}
      </DialogContent>
    </Dialog>
  );
}
