'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

// Slippage presets
const SLIPPAGE_PRESETS = [0.1, 0.5, 1.0];

interface SlippageSettingsProps {
  slippage: number;
  onSlippageChange: (newSlippage: number) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function SlippageSettings({
  slippage,
  onSlippageChange,
  open,
  onOpenChange,
}: SlippageSettingsProps) {
  const [customSlippageInput, setCustomSlippageInput] = React.useState<string>(
    SLIPPAGE_PRESETS.includes(slippage) ? '' : slippage.toString()
  );
  const [isCustomSelected, setIsCustomSelected] = React.useState(
    !SLIPPAGE_PRESETS.includes(slippage)
  );
  // Use internal state only if open/onOpenChange aren't provided
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);
  const [isValidCustom, setIsValidCustom] = React.useState(true);

  // Determine if we're using controlled or uncontrolled state
  const isControlled = open !== undefined && onOpenChange !== undefined;
  const isOpen = isControlled ? open : isPopoverOpen;
  const setIsOpen = isControlled ? onOpenChange : setIsPopoverOpen;

  React.useEffect(() => {
    // Sync input value if slippage changes externally and it's not a preset
    if (!SLIPPAGE_PRESETS.includes(slippage)) {
      setCustomSlippageInput(slippage.toString());
      setIsCustomSelected(true);
      setIsValidCustom(slippage > 0 && slippage < 100);
    } else {
      // If a preset is selected externally, clear custom input
      if (isCustomSelected) {
        setCustomSlippageInput('');
        setIsCustomSelected(false);
        setIsValidCustom(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slippage]); // Only run when slippage prop changes

  const handlePresetSelect = (preset: number) => {
    onSlippageChange(preset);
    setCustomSlippageInput('');
    setIsCustomSelected(false);
    setIsValidCustom(true);
    setIsOpen(false);
    toast.success(`Slippage tolerance set to ${preset}%`);
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomSlippageInput(value);
    setIsCustomSelected(true);
    const numericValue = parseFloat(value);
    const valid = !isNaN(numericValue) && numericValue > 0 && numericValue < 100;
    setIsValidCustom(valid);
    if (valid) {
      onSlippageChange(numericValue);
    }
  };

  const handleCustomFocus = () => {
    setIsCustomSelected(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const numericValue = parseFloat(customSlippageInput);
      const valid = !isNaN(numericValue) && numericValue > 0 && numericValue < 100;
      if (valid) {
        onSlippageChange(numericValue);
        setIsOpen(false);
        toast.success(`Slippage tolerance set to ${numericValue}%`);
      } else {
        toast.error('Invalid slippage value. Please enter between 0.1 and 99.');
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Slippage Settings</DialogTitle>
          <DialogDescription>
            Your transaction will revert if the price changes unfavorably by more than this
            percentage.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-3 gap-2">
            {SLIPPAGE_PRESETS.map(preset => (
              <Button
                key={preset}
                variant={slippage === preset && !isCustomSelected ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => handlePresetSelect(preset)}
              >
                {preset}%
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              step="0.1"
              min="0.1"
              max="99"
              placeholder="Custom"
              value={customSlippageInput}
              onChange={handleCustomChange}
              onFocus={handleCustomFocus}
              onKeyDown={handleKeyDown}
              className={cn(
                'flex-1',
                isCustomSelected && (!isValidCustom ? 'border-destructive' : 'border-primary')
              )}
            />
            <span>%</span>
          </div>
          {/* Optional: Add warning for high/low slippage */}
          {!isValidCustom && isCustomSelected && (
            <p className="text-destructive text-xs">Enter a valid slippage percentage (0.1-99)</p>
          )}
          {((slippage > 5 && !isCustomSelected) ||
            (slippage > 5 && isCustomSelected && isValidCustom)) && (
            <p className="text-destructive text-xs">Your transaction may fail or be frontrun</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
