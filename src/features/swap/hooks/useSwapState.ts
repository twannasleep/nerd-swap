import * as React from 'react';
import { BNB_BASE, TEST63_BASE } from '../constants';
import type { BaseToken } from '../types';

export function useSwapState() {
  const [inputAmount, setInputAmount] = React.useState('');
  const [outputAmount, setOutputAmount] = React.useState(''); // Keep output amount for now, might move later
  const [selectedInputBase, setSelectedInputBase] = React.useState<BaseToken>(BNB_BASE);
  const [selectedOutputBase, setSelectedOutputBase] = React.useState<BaseToken>(TEST63_BASE);
  const [isSwitching, setIsSwitching] = React.useState(false); // State for swap animation

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
  };
}
