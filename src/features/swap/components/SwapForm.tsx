'use client';

import * as React from 'react';
import {
  AlertCircleIcon,
  ArrowDownIcon,
  ChevronDownIcon,
  LoaderCircleIcon,
  RefreshCwIcon,
  SettingsIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatUnits, maxUint256, parseUnits } from 'viem';
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  BNB_TESTNET_CHAIN_ID,
  NATIVE_BNB_ADDRESS,
  UNISWAP_V2_ROUTER_ADDRESS,
  WBNB_ADDRESS,
  erc20Abi,
  uniswapV2RouterAbi,
} from '../constants';
import { useSwapCalculations } from '../hooks/useSwapCalculations';
import { useSwapState } from '../hooks/useSwapState';
import { BaseToken } from '../types';
import { SlippageSettings } from './SlippageSettings';
import { TokenAmountInput } from './TokenAmountInput';
import { TokenSelectorDialog } from './TokenSelectorDialog';

export function SwapForm() {
  const { address: account } = useAccount();
  const {
    inputAmount,
    setInputAmount,
    selectedInputBase,
    setSelectedInputBase,
    selectedOutputBase,
    setSelectedOutputBase,
    isSwitching,
    handleSwitchTokens,
  } = useSwapState();

  const {
    derivedOutputAmount,
    inputBalance,
    inputBalanceBigInt,
    inputUsdValue,
    outputUsdValue,
    displayRate,
    priceImpact,
    actualInputDecimals,
    actualOutputDecimals,
    error: calculationError,
    isLoading: isLoadingCalculations,
    isLoadingAmountsOut,
    isLoadingInitialRate,
  } = useSwapCalculations({
    account,
    inputAmount,
    selectedInputBase,
    selectedOutputBase,
  });

  const [isSelectingInput, setIsSelectingInput] = React.useState(false);
  const [isSelectingOutput, setIsSelectingOutput] = React.useState(false);
  const [slippage, setSlippage] = React.useState(0.5);
  const [isSlippageDialogOpen, setIsSlippageDialogOpen] = React.useState(false);

  const [isSwapPending, setIsSwapPending] = React.useState(false);
  const [lastRefreshTime, setLastRefreshTime] = React.useState<Date>(new Date());

  const handleRefreshPrice = React.useCallback(() => {
    setLastRefreshTime(new Date());
    const currentInput = inputAmount;
    setInputAmount(currentInput === '' ? '0' : '');
    setTimeout(() => setInputAmount(currentInput), 100);
  }, [inputAmount, setInputAmount]);

  const { writeContract: approveToken } = useWriteContract();
  const { data: approveWriteHash, isPending: isApprovingTx } = useWriteContract();
  const {
    data: approveReceipt,
    isLoading: isWaitingForApproval,
    isSuccess: isApprovalSuccess,
  } = useWaitForTransactionReceipt({
    hash: approveWriteHash,
  });

  const isApproving = isApprovingTx || isWaitingForApproval;

  const amountInBigInt = React.useMemo(() => {
    try {
      return parseUnits(inputAmount || '0', actualInputDecimals);
    } catch {
      return 0n;
    }
  }, [inputAmount, actualInputDecimals]);

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: selectedInputBase?.address as `0x${string}`,
    abi: erc20Abi,
    functionName: 'allowance',
    args: [account ?? '0x', UNISWAP_V2_ROUTER_ADDRESS],
    chainId: BNB_TESTNET_CHAIN_ID,
    query: {
      enabled:
        !!account &&
        selectedInputBase?.address !== NATIVE_BNB_ADDRESS &&
        !!selectedInputBase?.address,
      refetchInterval: query => (isApprovalSuccess ? 1000 : false),
    },
  });

  React.useEffect(() => {
    if (
      isApprovalSuccess &&
      typeof allowance === 'bigint' &&
      amountInBigInt > 0n &&
      allowance >= amountInBigInt
    ) {
      refetchAllowance();
    }
  }, [isApprovalSuccess, allowance, amountInBigInt, refetchAllowance]);

  const handleApprove = async () => {
    if (selectedInputBase.address === NATIVE_BNB_ADDRESS) {
      toast.error('Cannot approve native BNB');
      return;
    }
    if (!approveToken || !selectedInputBase?.address || isApproving) return;

    try {
      const hash = await approveToken({
        address: selectedInputBase.address as `0x${string}`,
        abi: erc20Abi,
        functionName: 'approve',
        args: [UNISWAP_V2_ROUTER_ADDRESS as `0x${string}`, maxUint256],
        chainId: BNB_TESTNET_CHAIN_ID,
      });
      toast.success('Token approval transaction sent');
    } catch (error) {
      console.error('Error approving token:', error);
      toast.error('Failed to send approval transaction', {
        description: (error as Error)?.message,
      });
    }
  };

  const {
    data: swapWriteHash,
    isPending: isSwapTxPending,
    writeContractAsync: swapAsync,
  } = useWriteContract();

  const {
    data: swapReceipt,
    isLoading: isWaitingForSwapConfirmation,
    isSuccess: isSwapSuccess,
    isError: isSwapError,
  } = useWaitForTransactionReceipt({
    hash: swapWriteHash,
  });

  const isSwapping = isSwapTxPending || isWaitingForSwapConfirmation;

  const handleSwap = async () => {
    if (
      !account ||
      !inputAmount ||
      !derivedOutputAmount ||
      typeof slippage !== 'number' ||
      isSwapping ||
      !swapAsync
    )
      return;

    const amountIn = amountInBigInt;
    if (amountIn <= 0n) {
      toast.error('Enter an amount to swap');
      return;
    }
    if (inputBalanceBigInt !== undefined && amountIn > inputBalanceBigInt) {
      toast.error('Insufficient balance');
      return;
    }

    let minAmountOut: bigint;
    try {
      minAmountOut = parseUnits(
        (parseFloat(derivedOutputAmount) * (1 - slippage / 100)).toFixed(actualOutputDecimals),
        actualOutputDecimals
      );
      if (minAmountOut <= 0n) throw new Error('Min amount out is zero or negative');
    } catch (calcError) {
      console.error('Error calculating minAmountOut:', calcError);
      toast.error('Invalid derived output amount for slippage calculation.');
      return;
    }

    try {
      setIsSwapPending(true);
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 20);

      const inputIsNative = selectedInputBase.address === NATIVE_BNB_ADDRESS;
      const outputIsNative = selectedOutputBase.address === NATIVE_BNB_ADDRESS;

      const path = [
        inputIsNative ? WBNB_ADDRESS : selectedInputBase.address,
        outputIsNative ? WBNB_ADDRESS : selectedOutputBase.address,
      ];

      let txHash: `0x${string}` | undefined;

      if (inputIsNative) {
        txHash = await swapAsync({
          address: UNISWAP_V2_ROUTER_ADDRESS,
          abi: uniswapV2RouterAbi,
          functionName: 'swapExactETHForTokens',
          args: [minAmountOut, path, account, deadline],
          value: amountIn,
          chainId: BNB_TESTNET_CHAIN_ID,
        });
      } else if (outputIsNative) {
        txHash = await swapAsync({
          address: UNISWAP_V2_ROUTER_ADDRESS,
          abi: uniswapV2RouterAbi,
          functionName: 'swapTokensForExactETH',
          args: [amountIn, minAmountOut, path, account, deadline],
          chainId: BNB_TESTNET_CHAIN_ID,
        });
      } else {
        txHash = await swapAsync({
          address: UNISWAP_V2_ROUTER_ADDRESS as `0x${string}`,
          abi: uniswapV2RouterAbi,
          functionName: 'swapExactTokensForTokens',
          args: [amountIn, minAmountOut, path, account, deadline],
          chainId: BNB_TESTNET_CHAIN_ID,
        });
      }

      if (txHash) {
        toast.success('Swap transaction sent');
        setInputAmount('');
      } else {
        toast.error('Swap initiation failed');
      }
    } catch (error) {
      console.error('Swap error:', error);
      toast.error('Failed to execute swap', { description: (error as Error)?.message });
    } finally {
      setIsSwapPending(false);
    }
  };

  const handleSelectToken = (token: BaseToken, type: 'input' | 'output') => {
    if (type === 'input') {
      if (token.address === selectedOutputBase.address) {
        setSelectedOutputBase(selectedInputBase);
      }
      setSelectedInputBase(token);
      setIsSelectingInput(false);
    } else {
      if (token.address === selectedInputBase.address) {
        setSelectedInputBase(selectedOutputBase);
      }
      setSelectedOutputBase(token);
      setIsSelectingOutput(false);
    }
    setInputAmount('');
  };

  const formError = calculationError;
  const isLoading = isLoadingCalculations || isLoadingInitialRate;

  const isInputTokenNative = selectedInputBase.address === NATIVE_BNB_ADDRESS;
  const requiresApproval = React.useMemo(() => {
    if (
      isInputTokenNative ||
      typeof allowance !== 'bigint' ||
      !amountInBigInt ||
      amountInBigInt <= 0n
    )
      return false;
    return allowance < amountInBigInt;
  }, [allowance, amountInBigInt, isInputTokenNative]);

  let buttonAction:
    | 'connect'
    | 'selectToken'
    | 'enterAmount'
    | 'insufficientBalance'
    | 'approve'
    | 'swap'
    | 'loading'
    | 'error' = 'connect';
  let buttonText = 'Connect Wallet';
  let buttonDisabled = false;

  if (account) {
    if (!selectedInputBase.address || !selectedOutputBase.address) {
      buttonAction = 'selectToken';
      buttonText = 'Select Tokens';
      buttonDisabled = true;
    } else if (isLoading) {
      buttonAction = 'loading';
      buttonText = 'Loading...';
      buttonDisabled = true;
    } else if (formError) {
      buttonAction = 'error';
      buttonText = formError;
      buttonDisabled = true;
    } else if (!inputAmount || amountInBigInt <= 0n) {
      buttonAction = 'enterAmount';
      buttonText = 'Enter Amount';
      buttonDisabled = true;
    } else if (inputBalanceBigInt !== undefined && amountInBigInt > inputBalanceBigInt) {
      buttonAction = 'insufficientBalance';
      buttonText = 'Insufficient Balance';
      buttonDisabled = true;
    } else if (requiresApproval) {
      buttonAction = 'approve';
      buttonText = `Approve ${selectedInputBase.symbol}`;
      buttonDisabled = isApproving;
    } else {
      buttonAction = 'swap';
      buttonText = 'Swap';
      buttonDisabled = isSwapping;
    }
  }

  React.useEffect(() => {
    if (isSwapSuccess) {
      toast.success('Swap confirmed successfully!');
      handleRefreshPrice();
    } else if (isSwapError) {
      toast.error('Swap transaction failed');
    }
  }, [isSwapSuccess, isSwapError, handleRefreshPrice]);

  return (
    <Card className="bg-card text-card-foreground w-full max-w-md rounded-xl border shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between border-b">
        <h2 className="text-lg font-semibold">Swap</h2>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              handleRefreshPrice();
              refetchAllowance();
            }}
            className="text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            title={`Refresh price (last refreshed: ${lastRefreshTime.toLocaleTimeString()})`}
            disabled={isLoading || isSwapping || isApproving}
          >
            {isLoading ? (
              <LoaderCircleIcon className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCwIcon className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSlippageDialogOpen(true)}
            className="text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          >
            <SettingsIcon className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-1 p-3 sm:p-4">
        <div className="bg-background rounded-lg border p-3">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-xs">You pay</span>
            <button
              className="text-muted-foreground hover:text-foreground text-xs disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => {
                if (inputBalanceBigInt !== undefined) {
                  setInputAmount(formatUnits(inputBalanceBigInt, actualInputDecimals));
                }
              }}
              disabled={inputBalanceBigInt === undefined || !account}
            >
              Balance: {inputBalance}
            </button>
          </div>
          <div className="mt-2 flex items-end justify-between gap-2">
            <div className="flex-1">
              <TokenAmountInput
                value={inputAmount}
                onChange={setInputAmount}
                decimals={actualInputDecimals}
                disabled={!account || isSwapPending || isApproving}
                placeholder="0"
                className="placeholder:text-muted-foreground h-10 w-full border-none bg-transparent p-0 text-2xl focus-visible:ring-0 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <div className="text-muted-foreground mt-1 h-4 text-xs">{inputUsdValue}</div>
            </div>
            <Button
              variant="outline"
              onClick={() => setIsSelectingInput(true)}
              className="bg-secondary text-secondary-foreground hover:bg-secondary/80 flex h-auto shrink-0 items-center gap-2 rounded-full px-3 py-2 text-sm font-medium shadow-sm"
            >
              {selectedInputBase.logoURI && (
                <img
                  src={selectedInputBase.logoURI}
                  alt={selectedInputBase.symbol}
                  className="h-6 w-6 rounded-full"
                />
              )}
              <span className="text-base">{selectedInputBase.symbol}</span>
              <ChevronDownIcon className="text-muted-foreground h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="relative z-10 my-[-14px] flex justify-center">
          <Button
            variant="outline"
            size="icon"
            onClick={handleSwitchTokens}
            disabled={isSwitching}
            className="border-card bg-background hover:bg-accent h-8 w-8 rounded-full border-2 data-[state=switching]:rotate-180"
            data-state={isSwitching ? 'switching' : 'idle'}
          >
            <ArrowDownIcon className="text-muted-foreground h-4 w-4" />
          </Button>
        </div>

        <div className="bg-background rounded-lg border p-3">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-xs">You receive (estimated)</span>
          </div>
          <div className="mt-2 flex items-end justify-between gap-2">
            <div className="flex-1">
              <TokenAmountInput
                value={derivedOutputAmount}
                onChange={() => {}}
                decimals={actualOutputDecimals}
                disabled={true}
                placeholder="0"
                className="placeholder:text-muted-foreground h-10 w-full border-none bg-transparent p-0 text-2xl focus-visible:ring-0 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <div className="text-muted-foreground mt-1 h-4 text-xs">
                {isLoadingAmountsOut ? (
                  <span className="italic">Fetching amount...</span>
                ) : (
                  outputUsdValue
                )}
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => setIsSelectingOutput(true)}
              className="bg-secondary text-secondary-foreground hover:bg-secondary/80 flex h-auto shrink-0 items-center gap-2 rounded-full px-3 py-2 text-sm font-medium shadow-sm"
            >
              {selectedOutputBase.logoURI && (
                <img
                  src={selectedOutputBase.logoURI}
                  alt={selectedOutputBase.symbol}
                  className="h-6 w-6 rounded-full"
                />
              )}
              <span className="text-base">{selectedOutputBase.symbol}</span>
              <ChevronDownIcon className="text-muted-foreground h-4 w-4" />
            </Button>
          </div>
        </div>

        {(displayRate || priceImpact !== null) && (
          <div className="text-muted-foreground flex h-6 items-center justify-between px-1 pt-2 text-xs">
            {displayRate ? (
              <span>{`1 ${selectedInputBase.symbol} ≈ ${displayRate.toFixed(4)} ${selectedOutputBase.symbol}`}</span>
            ) : isLoading ? (
              <span className="italic">Loading rate...</span>
            ) : (
              <span>&nbsp;</span>
            )}

            {priceImpact !== null && (
              <span
                className={cn(
                  'flex items-center gap-1',
                  Math.abs(priceImpact) > 5
                    ? 'text-destructive'
                    : Math.abs(priceImpact) > 2
                      ? 'text-warning-foreground'
                      : 'text-success-foreground'
                )}
                title="Price Impact"
              >
                {Math.abs(priceImpact) > 0.01 && <AlertCircleIcon className="h-3 w-3" />}
                {priceImpact.toFixed(2)}%
              </span>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="border-t p-4">
        <Button
          className="w-full text-lg font-semibold"
          size="lg"
          disabled={buttonDisabled || isApproving || isSwapping}
          onClick={() => {
            if (buttonAction === 'approve') {
              handleApprove();
            } else if (buttonAction === 'swap') {
              handleSwap();
            }
          }}
        >
          {(isApproving || isSwapping) && (
            <LoaderCircleIcon className="mr-2 h-4 w-4 animate-spin" />
          )}
          {buttonAction === 'approve' && isApproving
            ? `Approving ${selectedInputBase.symbol}...`
            : buttonAction === 'swap' && isSwapping
              ? 'Processing Swap...'
              : buttonText}
        </Button>
      </CardFooter>

      <TokenSelectorDialog
        open={isSelectingInput}
        onOpenChange={setIsSelectingInput}
        onSelectToken={(token: BaseToken) => {
          handleSelectToken(token, 'input');
        }}
      />
      <TokenSelectorDialog
        open={isSelectingOutput}
        onOpenChange={setIsSelectingOutput}
        onSelectToken={(token: BaseToken) => {
          handleSelectToken(token, 'output');
        }}
      />

      <SlippageSettings
        open={isSlippageDialogOpen}
        onOpenChange={setIsSlippageDialogOpen}
        slippage={slippage}
        onSlippageChange={setSlippage}
      />
    </Card>
  );
}
