'use client';

import * as React from 'react';
import { ArrowDownUpIcon, ChevronDownIcon, LoaderCircleIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useDebounce } from 'use-debounce';
import { Address, formatUnits, maxUint256, parseUnits } from 'viem';
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  BNB_TESTNET_CHAIN_ID,
  TEST63_TOKEN_ADDRESS,
  UNISWAP_V2_ROUTER_ADDRESS,
  WBNB_ADDRESS,
  erc20Abi,
  uniswapV2RouterAbi,
} from '../constants';
import { SlippageSettings } from './SlippageSettings';
import { TokenSelectorDialog } from './TokenSelectorDialog';

interface BaseToken {
  address: string;
  symbol: string;
  name: string;
  logoURI?: string;
}

interface Token extends BaseToken {
  decimals: number;
}

const BNB_BASE: BaseToken = { address: '0xNative', symbol: 'BNB', name: 'Binance Coin' };
const TEST63_BASE: BaseToken = {
  address: TEST63_TOKEN_ADDRESS,
  symbol: 'TEST63',
  name: 'Test Token 63',
};
const DEFAULT_SLIPPAGE = 0.5;

const getTokenWithDecimals = (
  baseToken: BaseToken,
  decimals?: number | bigint | null
): Token | null => {
  const dec = decimals !== undefined && decimals !== null ? Number(decimals) : undefined;
  if (dec !== undefined && !isNaN(dec)) {
    return { ...baseToken, decimals: dec };
  }
  if (baseToken.address === '0xNative') {
    return { ...baseToken, decimals: 18 };
  }
  return null;
};

export function SwapForm() {
  const { address: account, chain } = useAccount();
  const [inputAmount, setInputAmount] = React.useState('');
  const [outputAmount, setOutputAmount] = React.useState('');
  const [selectedInputBase, setSelectedInputBase] = React.useState<BaseToken>(BNB_BASE);
  const [selectedOutputBase, setSelectedOutputBase] = React.useState<BaseToken>(TEST63_BASE);
  const [inputToken, setInputToken] = React.useState<Token | null>(
    getTokenWithDecimals(BNB_BASE, 18)
  );
  const [outputToken, setOutputToken] = React.useState<Token | null>(null);
  const [isSelectingInput, setIsSelectingInput] = React.useState(false);
  const [isSelectingOutput, setIsSelectingOutput] = React.useState(false);
  const [isSwitching, setIsSwitching] = React.useState(false);
  const [slippage, setSlippage] = React.useState(DEFAULT_SLIPPAGE);
  const [debouncedInputAmount] = useDebounce(inputAmount, 500);
  const [isCheckingAllowance, setIsCheckingAllowance] = React.useState(false);
  const [needsApproval, setNeedsApproval] = React.useState(false);
  const [isApproving, setIsApproving] = React.useState(false);

  const { data: fetchedOutputDecimals, isLoading: isLoadingOutputDecimals } = useReadContract({
    abi: erc20Abi,
    address: selectedOutputBase.address === TEST63_TOKEN_ADDRESS ? TEST63_TOKEN_ADDRESS : undefined,
    functionName: 'decimals',
    chainId: BNB_TESTNET_CHAIN_ID,
    query: { enabled: selectedOutputBase.address === TEST63_TOKEN_ADDRESS },
  });

  const { data: fetchedInputDecimals, isLoading: isLoadingInputDecimals } = useReadContract({
    abi: erc20Abi,
    address: selectedInputBase.address === TEST63_TOKEN_ADDRESS ? TEST63_TOKEN_ADDRESS : undefined,
    functionName: 'decimals',
    chainId: BNB_TESTNET_CHAIN_ID,
    query: { enabled: selectedInputBase.address === TEST63_TOKEN_ADDRESS },
  });

  React.useEffect(() => {
    if (selectedInputBase.address === TEST63_TOKEN_ADDRESS) {
      setInputToken(getTokenWithDecimals(selectedInputBase, fetchedInputDecimals as number | null));
    } else if (selectedInputBase.address === '0xNative') {
      setInputToken(getTokenWithDecimals(selectedInputBase, 18));
    }
  }, [selectedInputBase, fetchedInputDecimals]);

  React.useEffect(() => {
    if (selectedOutputBase.address === TEST63_TOKEN_ADDRESS) {
      setOutputToken(
        getTokenWithDecimals(selectedOutputBase, fetchedOutputDecimals as number | null)
      );
    } else if (selectedOutputBase.address === '0xNative') {
      setOutputToken(getTokenWithDecimals(selectedOutputBase, 18));
    }
  }, [selectedOutputBase, fetchedOutputDecimals]);

  const inputTokenDecimals = inputToken?.decimals;
  const outputTokenDecimals = outputToken?.decimals;
  const isLoadingDecimals =
    (selectedInputBase.address === TEST63_TOKEN_ADDRESS && isLoadingInputDecimals) ||
    (selectedOutputBase.address === TEST63_TOKEN_ADDRESS && isLoadingOutputDecimals);

  const isMissingDecimals =
    (selectedInputBase.address !== '0xNative' && inputToken?.decimals === undefined) ||
    (selectedOutputBase.address !== '0xNative' && outputToken?.decimals === undefined);

  const amountInWei = React.useMemo(() => {
    try {
      return debouncedInputAmount && inputTokenDecimals !== undefined
        ? parseUnits(debouncedInputAmount, inputTokenDecimals)
        : BigInt(0);
    } catch {
      return BigInt(0);
    }
  }, [debouncedInputAmount, inputTokenDecimals]);

  const swapPath = React.useMemo((): Address[] => {
    const inputAddr =
      selectedInputBase.address === '0xNative'
        ? WBNB_ADDRESS
        : (selectedInputBase.address as Address);
    const outputAddr =
      selectedOutputBase.address === '0xNative'
        ? WBNB_ADDRESS
        : (selectedOutputBase.address as Address);
    if (inputAddr && outputAddr && inputAddr !== outputAddr) {
      return [inputAddr, outputAddr];
    }
    return [];
  }, [selectedInputBase, selectedOutputBase]);

  const { data: amountsOutData, isLoading: isLoadingAmountsOut } = useReadContract({
    abi: uniswapV2RouterAbi,
    address: UNISWAP_V2_ROUTER_ADDRESS,
    functionName: 'getAmountsOut',
    args: [amountInWei, swapPath],
    chainId: BNB_TESTNET_CHAIN_ID,
    query: {
      enabled:
        amountInWei > BigInt(0) &&
        swapPath.length === 2 &&
        inputTokenDecimals !== undefined &&
        outputTokenDecimals !== undefined &&
        chain?.id === BNB_TESTNET_CHAIN_ID &&
        !isMissingDecimals,
      staleTime: 10_000,
      refetchInterval: 15_000,
    },
  });

  React.useEffect(() => {
    if (amountsOutData && amountsOutData.length > 1 && outputTokenDecimals !== undefined) {
      const outputAmountWei = amountsOutData[1];
      if (typeof outputAmountWei === 'bigint') {
        const formattedAmount = formatUnits(outputAmountWei, outputTokenDecimals);
        if (formattedAmount !== outputAmount) {
          setOutputAmount(formattedAmount);
        }
      } else {
        setOutputAmount('');
      }
    } else if (debouncedInputAmount === '0' || debouncedInputAmount === '') {
      setOutputAmount('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amountsOutData, outputTokenDecimals, debouncedInputAmount]);

  const {
    data: currentAllowance,
    refetch: refetchAllowance,
    isLoading: isLoadingAllowance,
  } = useReadContract({
    abi: erc20Abi,
    address: inputToken?.address as Address,
    functionName: 'allowance',
    args: [account as Address, UNISWAP_V2_ROUTER_ADDRESS],
    chainId: BNB_TESTNET_CHAIN_ID,
    query: {
      enabled:
        !!account &&
        !!inputToken &&
        inputToken.address !== '0xNative' &&
        amountInWei > BigInt(0) &&
        chain?.id === BNB_TESTNET_CHAIN_ID &&
        !isMissingDecimals,
    },
  });

  React.useEffect(() => {
    setIsCheckingAllowance(isLoadingAllowance);
    if (
      inputToken &&
      inputToken.address !== '0xNative' &&
      amountInWei > BigInt(0) &&
      typeof currentAllowance === 'bigint' &&
      currentAllowance < amountInWei
    ) {
      setNeedsApproval(true);
    } else {
      setNeedsApproval(false);
    }
  }, [currentAllowance, amountInWei, inputToken, isLoadingAllowance]);

  const {
    data: approveTxHash,
    writeContractAsync: approveWrite,
    isPending: isApprovingWrite,
    error: approveError,
  } = useWriteContract();

  const { isLoading: isConfirmingApproval, isSuccess: isApprovalSuccess } =
    useWaitForTransactionReceipt({
      hash: approveTxHash,
      chainId: BNB_TESTNET_CHAIN_ID,
      query: { enabled: !!approveTxHash },
    });

  React.useEffect(() => {
    setIsApproving(isApprovingWrite || isConfirmingApproval);

    if (isApprovalSuccess) {
      toast.success('Approval successful!');
      refetchAllowance();
      setNeedsApproval(false);
      setIsApproving(false);
    }
    if (approveError) {
      toast.error(approveError.message || 'Approval failed');
      console.error('Approval Error:', approveError);
      setIsApproving(false);
    }
  }, [isApprovingWrite, isConfirmingApproval, isApprovalSuccess, approveError, refetchAllowance]);

  const handleSwitchTokens = () => {
    setIsSwitching(true);
    const currentInputBase = selectedInputBase;
    const currentOutputBase = selectedOutputBase;
    const currentInputAmount = inputAmount;
    const currentOutputAmount = outputAmount;
    setSelectedInputBase(currentOutputBase);
    setSelectedOutputBase(currentInputBase);
    setInputToken(null);
    setOutputToken(null);
    setInputAmount(currentOutputAmount);
    setOutputAmount(currentInputAmount);
    setNeedsApproval(false);
    setTimeout(() => {
      setIsSwitching(false);
    }, 300);
  };

  const handleSelectInputToken = (token: BaseToken) => {
    if (selectedOutputBase.address === token.address) {
      setSelectedOutputBase(selectedInputBase);
      setOutputToken(null);
    }
    setSelectedInputBase(token);
    setInputToken(null);
    setOutputAmount('');
    setNeedsApproval(false);
  };

  const handleSelectOutputToken = (token: BaseToken) => {
    if (selectedInputBase.address === token.address) {
      setSelectedInputBase(selectedOutputBase);
      setInputToken(null);
    }
    setSelectedOutputBase(token);
    setOutputToken(null);
    setOutputAmount('');
  };

  const handleApprove = async () => {
    if (!inputToken || inputToken.address === '0xNative' || !approveWrite) return;

    toast.info('Requesting approval...');
    try {
      await approveWrite({
        address: inputToken.address as Address,
        abi: erc20Abi,
        functionName: 'approve',
        args: [UNISWAP_V2_ROUTER_ADDRESS, maxUint256],
        chainId: BNB_TESTNET_CHAIN_ID,
      });
    } catch (err) {
      console.error('Approve call failed:', err);
    }
  };

  const handleSwap = () => {
    if (needsApproval) {
      toast.warning('Please approve the token first.');
      return;
    }
    console.log(`Initiating swap with slippage: ${slippage}% ...`);
    toast.info('Swap function not implemented yet.');
  };

  const inputBalance = '--';
  const outputBalance = '--';

  const displayRate = React.useMemo(() => {
    if (
      inputToken &&
      outputToken &&
      inputToken.decimals !== undefined &&
      outputToken.decimals !== undefined &&
      Number(inputAmount) > 0 &&
      Number(outputAmount) > 0
    ) {
      try {
        const rate = parseFloat(outputAmount) / parseFloat(inputAmount);
        if (!isNaN(rate) && rate > 0) {
          const precision = rate < 0.0001 ? 8 : 4;
          return `1 ${inputToken.symbol} = ${rate.toFixed(precision)} ${outputToken.symbol}`;
        }
      } catch {}
    }
    return null;
  }, [inputAmount, outputAmount, inputToken, outputToken]);

  const getButtonLabel = () => {
    if (!account) return 'Connect Wallet';
    if (chain?.id !== BNB_TESTNET_CHAIN_ID) return `Switch to BNB Testnet`;
    if (isMissingDecimals) return 'Loading token data...';
    if (!inputAmount || parseFloat(inputAmount) <= 0) return 'Enter amount';
    if (isLoadingAmountsOut) return 'Fetching rate...';
    if (isCheckingAllowance || isApproving)
      return (
        <>
          <LoaderCircleIcon className="mr-2 size-4 animate-spin" /> Approving...
        </>
      );
    if (needsApproval) return `Approve ${inputToken?.symbol}`;
    return 'Swap';
  };

  const isButtonDisabled =
    !account ||
    chain?.id !== BNB_TESTNET_CHAIN_ID ||
    isMissingDecimals ||
    (!needsApproval && (!inputAmount || parseFloat(inputAmount) <= 0 || !outputAmount)) ||
    isLoadingAmountsOut ||
    isCheckingAllowance ||
    isApproving;

  return (
    <>
      <Card className="mx-auto w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Swap Tokens</CardTitle>
          <SlippageSettings slippage={slippage} onSlippageChange={setSlippage} />
        </CardHeader>
        <CardContent className="space-y-4">
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
                disabled={!inputToken || !outputToken || isMissingDecimals || isApproving}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSelectingInput(true)}
                className="min-w-[120px] justify-between gap-1.5"
                disabled={isLoadingDecimals || isApproving}
              >
                {isLoadingInputDecimals && selectedInputBase.address === TEST63_TOKEN_ADDRESS
                  ? '...'
                  : selectedInputBase.symbol}
                <ChevronDownIcon className="text-muted-foreground size-4" />
              </Button>
            </div>
          </div>

          <div className="flex justify-center">
            <Button
              variant="outline"
              size="icon"
              className="bg-background hover:bg-muted rounded-full disabled:opacity-50"
              onClick={handleSwitchTokens}
              disabled={
                isSwitching ||
                !inputToken ||
                !outputToken ||
                isMissingDecimals ||
                isLoadingDecimals ||
                isApproving
              }
            >
              <ArrowDownUpIcon
                className={cn(
                  'size-4 transition-transform ease-in-out',
                  isSwitching && 'rotate-180'
                )}
              />
            </Button>
          </div>

          <div className="grid gap-2 rounded-md border p-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">To</span>
              <span className="text-muted-foreground text-sm">Balance: {outputBalance}</span>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="0.0"
                value={isLoadingAmountsOut ? 'Loading...' : outputAmount}
                readOnly
                className="flex-1 border-0 bg-transparent text-lg font-semibold focus-visible:ring-0 focus-visible:ring-offset-0 disabled:opacity-75"
                disabled={isLoadingAmountsOut || isMissingDecimals || isApproving}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSelectingOutput(true)}
                className="min-w-[120px] justify-between gap-1.5"
                disabled={isLoadingDecimals || isApproving}
              >
                {isLoadingOutputDecimals && selectedOutputBase.address === TEST63_TOKEN_ADDRESS
                  ? '...'
                  : selectedOutputBase.symbol}
                <ChevronDownIcon className="text-muted-foreground size-4" />
              </Button>
            </div>
          </div>

          <div className="text-muted-foreground h-5 text-center text-sm">
            {isMissingDecimals && 'Loading token data...'}
            {!isMissingDecimals &&
              isLoadingAmountsOut &&
              inputAmount &&
              parseFloat(inputAmount) > 0 &&
              'Fetching rate...'}
            {!isMissingDecimals && !isLoadingAmountsOut && displayRate && (
              <span>{displayRate}</span>
            )}
            {!isMissingDecimals && !isLoadingAmountsOut && !displayRate && (
              <span>Slippage: {slippage}%</span>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button
            size="lg"
            className="w-full"
            onClick={needsApproval ? handleApprove : handleSwap}
            disabled={isButtonDisabled}
          >
            {getButtonLabel()}
          </Button>
        </CardFooter>
      </Card>

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
