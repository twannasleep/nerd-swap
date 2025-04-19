import * as React from 'react';
import { BNB_BASE, BaseToken, TEST63_BASE } from '../constants';

export type SwapMode = 'exactIn' | 'exactOut';

export function useSwapState() {
  const [inputAmount, setInputAmount] = React.useState('');
  const [outputAmount, setOutputAmount] = React.useState(''); // Keep output amount for now, might move later
  const [selectedInputBase, setSelectedInputBase] = React.useState<BaseToken>(BNB_BASE);
  const [selectedOutputBase, setSelectedOutputBase] = React.useState<BaseToken>(TEST63_BASE);
  const [isSwitching, setIsSwitching] = React.useState(false); // State for swap animation
  const [swapMode, setSwapMode] = React.useState<SwapMode>('exactIn');

  const handleSwitchTokens = React.useCallback(() => {
    setIsSwitching(true);
    setSelectedInputBase(selectedOutputBase);
    setSelectedOutputBase(selectedInputBase);
    // Reset amounts or swap them? For now, reset might be simpler.
    setInputAmount('');
    setOutputAmount('');
    // Trigger animation end after a short delay
    setTimeout(() => setIsSwitching(false), 300); // Adjust timing as needed
  }, [selectedInputBase, selectedOutputBase]);

  // Toggle between exact input and exact output modes
  const toggleSwapMode = React.useCallback(() => {
    setSwapMode(prevMode => {
      const newMode = prevMode === 'exactIn' ? 'exactOut' : 'exactIn';

      // Swap the input/output amounts when changing modes
      if (inputAmount || outputAmount) {
        if (newMode === 'exactIn') {
          setInputAmount(outputAmount);
          setOutputAmount('');
        } else {
          setOutputAmount(inputAmount);
          setInputAmount('');
        }
      }

      return newMode;
    });
  }, [inputAmount, outputAmount]);

  return {
    inputAmount,
    setInputAmount,
    outputAmount,
    setOutputAmount, // Keep setter for now
    selectedInputBase,
    setSelectedInputBase,
    selectedOutputBase,
    setSelectedOutputBase,
    isSwitching,
    handleSwitchTokens,
    swapMode,
    setSwapMode,
    toggleSwapMode,
  };
}
