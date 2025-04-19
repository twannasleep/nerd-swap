'use client';

import * as React from 'react';
import {
  AlertCircleIcon,
  ArrowDownIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  LoaderCircleIcon,
  RefreshCwIcon,
  SettingsIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { erc20Abi, formatUnits, maxUint256, parseUnits } from 'viem';
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  BNB_TESTNET_CHAIN_ID,
  BaseToken,
  NATIVE_BNB_ADDRESS,
  UNISWAP_V2_ROUTER_ADDRESS,
} from '../constants';
import { useSwapCalculations } from '../hooks/useSwapCalculations';
import { useSwapState } from '../hooks/useSwapState';
import { useSwapTransaction } from '../hooks/useSwapTransaction';
import { useTokenBalances } from '../hooks/useTokenBalances';
import { SlippageSettings } from './SlippageSettings';
import { TokenAmountInput } from './TokenAmountInput';
import { TokenSelectorDialog } from './TokenSelectorDialog';

export function SwapForm() {
  const { address: account } = useAccount();
  const {
    inputAmount,
    setInputAmount,
    outputAmount,
    setOutputAmount,
    selectedInputBase,
    setSelectedInputBase,
    selectedOutputBase,
    setSelectedOutputBase,
    isSwitching,
    handleSwitchTokens,
    swapMode,
    setSwapMode,
    toggleSwapMode,
  } = useSwapState();

  const {
    getBalanceByToken,
    refetchAllBalances,
    isLoading: isLoadingBalances,
  } = useTokenBalances({
    account,
  });

  const {
    derivedOutputAmount,
    derivedInputAmount,
    inputUsdValue,
    outputUsdValue,
    displayRate,
    priceImpact,
    actualInputDecimals,
    actualOutputDecimals,
    error: calculationError,
    isLoading: isLoadingCalculations,
    isLoadingAmountsOut,
    isLoadingAmountsIn,
    isLoadingInitialRate,
  } = useSwapCalculations({
    account,
    inputAmount,
    outputAmount,
    swapMode,
    selectedInputBase,
    selectedOutputBase,
  });

  // Get current token balances
  const currentInputBalance = React.useMemo(
    () => getBalanceByToken(selectedInputBase),
    [getBalanceByToken, selectedInputBase]
  );

  const currentOutputBalance = React.useMemo(
    () => getBalanceByToken(selectedOutputBase),
    [getBalanceByToken, selectedOutputBase]
  );

  const inputBalanceBigInt = React.useMemo(() => {
    try {
      return BigInt(currentInputBalance.value);
    } catch {
      return undefined;
    }
  }, [currentInputBalance.value]);

  const [isSelectingInput, setIsSelectingInput] = React.useState(false);
  const [isSelectingOutput, setIsSelectingOutput] = React.useState(false);
  const [slippage, setSlippage] = React.useState(0.5);
  const [isSlippageDialogOpen, setIsSlippageDialogOpen] = React.useState(false);

  const [lastRefreshTime, setLastRefreshTime] = React.useState<Date>(new Date());

  const handleRefreshPrice = React.useCallback(() => {
    setLastRefreshTime(new Date());
    refetchAllBalances();
    const currentInput = inputAmount;
    setInputAmount(currentInput === '' ? '0' : '');
    setTimeout(() => setInputAmount(currentInput), 100);
  }, [inputAmount, setInputAmount, refetchAllBalances]);

  // Approval flow
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

  // Check allowance
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
      toast.success('Token approval confirmed!', {
        description: `You can now swap ${selectedInputBase.symbol}`,
      });
    }
  }, [isApprovalSuccess, allowance, amountInBigInt, refetchAllowance, selectedInputBase.symbol]);

  // Handle token approval
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
      toast.success('Token approval transaction sent', {
        description: `Approving ${selectedInputBase.symbol} for trading...`,
      });
    } catch (error) {
      console.error('Error approving token:', error);
      toast.error('Failed to send approval transaction', {
        description: (error as Error)?.message,
      });
    }
  };

  // Use the swap transaction hook
  const { handleSwap, isSwapping, isSwapPending, isSwapSuccess, isSwapError } = useSwapTransaction({
    account,
    inputAmount,
    outputAmount,
    derivedInputAmount,
    derivedOutputAmount,
    swapMode,
    selectedInputBase,
    selectedOutputBase,
    slippage,
    inputDecimals: actualInputDecimals,
    outputDecimals: actualOutputDecimals,
    inputBalanceBigInt,
  });

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
    refetchAllBalances(); // Refresh balances when tokens change
  };

  const formError = calculationError;
  const isLoading = isLoadingCalculations || isLoadingInitialRate || isLoadingBalances;

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

  // Show toast on successful swap
  React.useEffect(() => {
    if (isSwapSuccess) {
      toast.success('Swap confirmed successfully!');
      handleRefreshPrice();
      refetchAllBalances(); // Refresh balances after successful swap
      setInputAmount(''); // Clear input after successful swap
    } else if (isSwapError) {
      toast.error('Swap transaction failed');
    }
  }, [isSwapSuccess, isSwapError, handleRefreshPrice, refetchAllBalances, setInputAmount]);

  return (
    <Card className="mx-auto w-full max-w-md overflow-hidden sm:rounded-xl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:p-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">Swap</h2>
          {calculationError && <AlertCircleIcon className="text-destructive h-4 w-4" />}
        </div>
        <div className="flex items-center gap-1">
          <div className="mr-2 flex items-center">
            <Button
              variant={swapMode === 'exactIn' ? 'default' : 'outline'}
              size="sm"
              className="h-7 rounded-r-none px-2"
              onClick={() => setSwapMode('exactIn')}
            >
              Exact In
            </Button>
            <Button
              variant={swapMode === 'exactOut' ? 'default' : 'outline'}
              size="sm"
              className="h-7 rounded-l-none px-2"
              onClick={() => setSwapMode('exactOut')}
            >
              Exact Out
            </Button>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-accent hover:text-accent-foreground text-muted-foreground h-8 w-8 rounded-full"
            onClick={handleRefreshPrice}
            disabled={isLoadingCalculations || isSwapping || isSwapPending}
          >
            <RefreshCwIcon
              className={cn('h-4 w-4', isLoadingCalculations && 'animate-spin')}
              data-state={lastRefreshTime.toISOString()}
            />
            <span className="sr-only">Refresh price</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-accent hover:text-accent-foreground text-muted-foreground h-8 w-8 rounded-full"
            onClick={() => setIsSlippageDialogOpen(true)}
          >
            <SettingsIcon className="h-4 w-4" />
            <span className="sr-only">Settings</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 p-3 sm:p-4">
        {/* From Input Token */}
        <div className="bg-background rounded-lg border p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-xs">From</span>
            <span className="text-muted-foreground text-xs">
              Balance: {currentInputBalance.formatted}
            </span>
          </div>
          <div className="mt-2 flex items-end justify-between gap-2">
            <div className="flex-1">
              <TokenAmountInput
                value={swapMode === 'exactIn' ? inputAmount : derivedInputAmount}
                onChange={swapMode === 'exactIn' ? setInputAmount : () => {}}
                decimals={actualInputDecimals}
                disabled={isSwapping || isSwapPending || swapMode === 'exactOut'}
                placeholder="0"
                className="placeholder:text-muted-foreground h-10 w-full border-none bg-transparent p-0 text-xl focus-visible:ring-0 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 sm:text-2xl"
                maxValue={inputBalanceBigInt}
                showMaxButton={
                  !isSwapping &&
                  !isSwapPending &&
                  swapMode === 'exactIn' &&
                  !!inputBalanceBigInt &&
                  BigInt(inputBalanceBigInt) > 0
                }
                onMaxClick={() => {
                  if (inputBalanceBigInt) {
                    // If BNB, leave some for gas
                    if (
                      selectedInputBase.address === NATIVE_BNB_ADDRESS &&
                      inputBalanceBigInt > parseUnits('0.01', 18)
                    ) {
                      setInputAmount(
                        formatUnits(
                          inputBalanceBigInt - parseUnits('0.01', 18),
                          actualInputDecimals
                        )
                      );
                    } else {
                      setInputAmount(formatUnits(inputBalanceBigInt, actualInputDecimals));
                    }
                  }
                }}
                usdValue={inputUsdValue}
                showUsdValue={true}
                isCalculatingUsd={isLoadingCalculations}
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setIsSelectingInput(true)}
              className="bg-secondary text-secondary-foreground hover:bg-secondary/80 flex h-auto shrink-0 items-center gap-1 rounded-full px-2 py-1.5 text-xs font-medium shadow-sm sm:gap-2 sm:px-3 sm:py-2 sm:text-sm"
            >
              {selectedInputBase.logoURI && (
                <img
                  src={selectedInputBase.logoURI}
                  alt={selectedInputBase.symbol}
                  className="h-5 w-5 rounded-full sm:h-6 sm:w-6"
                />
              )}
              <span className="text-sm sm:text-base">{selectedInputBase.symbol}</span>
              <ChevronDownIcon className="text-muted-foreground h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>

        <div className="relative z-10 my-[-14px] flex justify-center">
          <Button
            variant="outline"
            size="icon"
            onClick={handleSwitchTokens}
            disabled={isSwitching}
            className="border-card bg-background hover:bg-accent h-7 w-7 rounded-full border-2 data-[state=switching]:rotate-180 sm:h-8 sm:w-8"
            data-state={isSwitching ? 'switching' : 'idle'}
          >
            <ArrowDownIcon className="text-muted-foreground h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>

        <div className="bg-background rounded-lg border p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-xs">You receive (estimated)</span>
            <span className="text-muted-foreground text-xs">
              Balance: {currentOutputBalance.formatted}
            </span>
          </div>
          <div className="mt-2 flex items-end justify-between gap-2">
            <div className="flex-1">
              <TokenAmountInput
                value={swapMode === 'exactOut' ? outputAmount : derivedOutputAmount}
                onChange={swapMode === 'exactOut' ? setOutputAmount : () => {}}
                decimals={actualOutputDecimals}
                disabled={isSwapping || isSwapPending || swapMode === 'exactIn'}
                placeholder="0"
                className="placeholder:text-muted-foreground h-10 w-full border-none bg-transparent p-0 text-xl focus-visible:ring-0 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 sm:text-2xl"
                usdValue={outputUsdValue}
                showUsdValue={true}
                isCalculatingUsd={swapMode === 'exactIn' ? isLoadingAmountsOut : isLoadingAmountsIn}
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setIsSelectingOutput(true)}
              className="bg-secondary text-secondary-foreground hover:bg-secondary/80 flex h-auto shrink-0 items-center gap-1 rounded-full px-2 py-1.5 text-xs font-medium shadow-sm sm:gap-2 sm:px-3 sm:py-2 sm:text-sm"
            >
              {selectedOutputBase.logoURI && (
                <img
                  src={selectedOutputBase.logoURI}
                  alt={selectedOutputBase.symbol}
                  className="h-5 w-5 rounded-full sm:h-6 sm:w-6"
                />
              )}
              <span className="text-sm sm:text-base">{selectedOutputBase.symbol}</span>
              <ChevronDownIcon className="text-muted-foreground h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>

        {displayRate && (
          <div className="text-muted-foreground flex items-center justify-between px-2 text-xs">
            <span>Rate</span>
            <span>
              1 {selectedInputBase.symbol} = {displayRate.toFixed(6)} {selectedOutputBase.symbol}
            </span>
          </div>
        )}

        {priceImpact !== null && (
          <div className="flex items-center justify-between px-2 text-xs">
            <span className="text-muted-foreground">Price Impact</span>
            <span
              className={cn(
                priceImpact < 1
                  ? 'text-green-500'
                  : priceImpact < 3
                    ? 'text-yellow-500'
                    : 'text-red-500'
              )}
            >
              {priceImpact.toFixed(2)}%
            </span>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col gap-3 p-3 sm:p-4">
        {/* Transaction Status UI */}
        {(isSwapPending || isSwapSuccess) && (
          <div
            className={cn(
              'flex w-full items-center gap-2 rounded-lg p-2 text-sm',
              isSwapSuccess ? 'bg-green-500/15 text-green-500' : 'bg-blue-500/15 text-blue-500'
            )}
          >
            {isSwapPending ? (
              <>
                <LoaderCircleIcon className="h-4 w-4 shrink-0 animate-spin" />
                <span className="line-clamp-2">
                  Transaction pending. Check your wallet for updates...
                </span>
              </>
            ) : isSwapSuccess ? (
              <>
                <CheckCircleIcon className="h-4 w-4 shrink-0" />
                <span className="line-clamp-2">
                  Transaction successful! Your swap has been completed.
                </span>
              </>
            ) : null}
          </div>
        )}

        {/* Error Display */}
        {(formError || isSwapError) && (
          <div className="bg-destructive/15 text-destructive flex w-full items-center gap-2 rounded-lg p-2 text-sm">
            <AlertCircleIcon className="h-4 w-4 shrink-0" />
            <span className="line-clamp-2">
              {formError || 'Transaction failed. Please try again.'}
            </span>
          </div>
        )}

        {/* Swap Button */}
        {!account ? (
          <Button className="w-full" disabled={!account} asChild>
            <span className="w-full">Connect Wallet</span>
          </Button>
        ) : (
          <Button
            className="w-full"
            disabled={buttonDisabled}
            onClick={buttonAction === 'approve' ? handleApprove : handleSwap}
          >
            {isSwapping ? (
              <>
                <LoaderCircleIcon className="mr-2 h-4 w-4 animate-spin" />
                Swapping...
              </>
            ) : isApproving ? (
              <>
                <LoaderCircleIcon className="mr-2 h-4 w-4 animate-spin" />
                Approving...
              </>
            ) : (
              buttonText
            )}
          </Button>
        )}
      </CardFooter>

      {/* Token selector dialogs */}
      <TokenSelectorDialog
        open={isSelectingInput}
        onOpenChange={setIsSelectingInput}
        onSelectToken={(token: BaseToken) => handleSelectToken(token, 'input')}
      />
      <TokenSelectorDialog
        open={isSelectingOutput}
        onOpenChange={setIsSelectingOutput}
        onSelectToken={(token: BaseToken) => handleSelectToken(token, 'output')}
      />

      {/* Slippage settings dialog */}
      <SlippageSettings
        open={isSlippageDialogOpen}
        onOpenChange={setIsSlippageDialogOpen}
        slippage={slippage}
        onSlippageChange={setSlippage}
      />
    </Card>
  );
}
