'use client';

import * as React from 'react';
import { ArrowDownUpIcon, ChevronDownIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { SlippageSettings } from './SlippageSettings';
import { TokenSelectorDialog } from './TokenSelectorDialog';

// Define Token type (should match the one in TokenSelectorDialog)
interface Token {
  address: string;
  symbol: string;
  name: string;
  logoURI?: string;
}

// Define initial tokens based on requirements
const BNB: Token = {
  address: '0xNative',
  symbol: 'BNB',
  name: 'BNB',
};
const TEST63: Token = {
  address: '0xfe113952C81D14520a8752C87c47f79564892bA3',
  symbol: 'TEST63',
  name: 'Test Token 63',
};

// Remove Slippage presets from here
const DEFAULT_SLIPPAGE = 0.5;

export function SwapForm() {
  const [inputAmount, setInputAmount] = React.useState('');
  const [outputAmount, setOutputAmount] = React.useState('');
  const [inputToken, setInputToken] = React.useState<Token | null>(BNB);
  const [outputToken, setOutputToken] = React.useState<Token | null>(TEST63);
  const [isSelectingInput, setIsSelectingInput] = React.useState(false);
  const [isSelectingOutput, setIsSelectingOutput] = React.useState(false);
  const [isSwitching, setIsSwitching] = React.useState(false);

  // Keep only the main slippage state here
  const [slippage, setSlippage] = React.useState(DEFAULT_SLIPPAGE);

  const handleSwitchTokens = () => {
    setIsSwitching(true);
    setInputToken(outputToken);
    setOutputToken(inputToken);
    setInputAmount(outputAmount);
    setOutputAmount(inputAmount);
    setTimeout(() => {
      setIsSwitching(false);
    }, 300);
  };

  const handleSelectInputToken = (token: Token) => {
    if (outputToken?.address === token.address) {
      setOutputToken(inputToken);
    }
    setInputToken(token);
  };

  const handleSelectOutputToken = (token: Token) => {
    if (inputToken?.address === token.address) {
      setInputToken(outputToken);
    }
    setOutputToken(token);
  };

  const handleSwap = () => {
    console.log(`Initiating swap with slippage: ${slippage}% ...`);
    // Swap logic will go here, using the `slippage` value from state
  };

  const inputBalance = '--';
  const outputBalance = '--';

  return (
    <>
      <Card className="mx-auto w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Swap Tokens</CardTitle>
          {/* Use the new SlippageSettings component */}
          <SlippageSettings slippage={slippage} onSlippageChange={setSlippage} />
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Input Token Section */}
          <div className="grid gap-2 rounded-md border p-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">From</span>
              <span className="text-muted-foreground text-sm">Balance: {inputBalance}</span>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="0.0"
                value={inputAmount}
                onChange={e => setInputAmount(e.target.value)}
                className="flex-1 border-0 bg-transparent text-lg font-semibold focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSelectingInput(true)}
                className="gap-1.5"
              >
                {inputToken?.symbol ?? 'Select Token'}
                <ChevronDownIcon className="text-muted-foreground size-4" />
              </Button>
            </div>
          </div>

          {/* Switch Button */}
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="icon"
              className="bg-background hover:bg-muted rounded-full"
              onClick={handleSwitchTokens}
              disabled={isSwitching}
            >
              <ArrowDownUpIcon className={cn('size-4 transition-transform ease-in-out')} />
            </Button>
          </div>

          {/* Output Token Section */}
          <div className="grid gap-2 rounded-md border p-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">To</span>
              <span className="text-muted-foreground text-sm">Balance: {outputBalance}</span>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="0.0"
                value={outputAmount}
                readOnly
                className="flex-1 border-0 bg-transparent text-lg font-semibold focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSelectingOutput(true)}
                className="gap-1.5"
              >
                {outputToken?.symbol ?? 'Select Token'}
                <ChevronDownIcon className="text-muted-foreground size-4" />
              </Button>
            </div>
          </div>

          {/* Rate Display Placeholder */}
          <div className="text-muted-foreground text-center text-sm">
            Slippage: {slippage}% | Rate: 1 TokenA = X TokenB
          </div>
        </CardContent>
        <CardFooter>
          <Button size="lg" className="w-full" onClick={handleSwap}>
            Swap
          </Button>
        </CardFooter>
      </Card>

      {/* Token Selector Dialogs */}
      <TokenSelectorDialog
        open={isSelectingInput}
        onOpenChange={setIsSelectingInput}
        onSelectToken={handleSelectInputToken}
      />
      <TokenSelectorDialog
        open={isSelectingOutput}
        onOpenChange={setIsSelectingOutput}
        onSelectToken={handleSelectOutputToken}
      />
    </>
  );
}
