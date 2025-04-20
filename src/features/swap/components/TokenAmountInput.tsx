import * as React from 'react';
import { formatUnits, parseUnits } from 'viem';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface TokenAmountInputProps {
  value: string;
  onChange: (value: string) => void;
  decimals: number;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  maxValue?: bigint | undefined;
  showMaxButton?: boolean;
  onMaxClick?: () => void;
  usdValue?: string;
  showUsdValue?: boolean;
  isCalculatingUsd?: boolean;
}

export function TokenAmountInput({
  value,
  onChange,
  decimals,
  placeholder = '0.0',
  disabled = false,
  className,
  maxValue,
  showMaxButton = false,
  onMaxClick,
  usdValue,
  showUsdValue = false,
  isCalculatingUsd = false,
}: TokenAmountInputProps) {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;

    // Don't allow non-numeric characters except decimal point
    if (!/^\d*\.?\d*$/.test(newValue)) {
      return;
    }

    // Don't allow more decimal places than the token supports
    const [, decimal] = newValue.split('.');
    if (decimal && decimal.length > decimals) {
      return;
    }

    // Don't allow leading zeros unless it's a decimal
    if (newValue.length > 1 && newValue[0] === '0' && newValue[1] !== '.') {
      return;
    }

    // Only validate against max value if it's provided and greater than 0
    // This allows input when wallet is not connected (maxValue = 0)
    if (maxValue !== undefined && maxValue > 0 && newValue !== '') {
      try {
        const parsedValue = parseUnits(newValue, decimals);
        if (parsedValue > maxValue) {
          // If exceeds max, set to max
          onChange(formatUnits(maxValue, decimals));
          return;
        }
      } catch {
        // If parsing fails, ignore the validation
      }
    }

    onChange(newValue);
  };

  // Format the display value to preserve zeros while typing
  const displayValue = React.useMemo(() => {
    if (!value) return '';

    // If the user is typing a decimal number, preserve all digits
    if (value.includes('.')) {
      // Remove trailing zeros only if they come after other digits
      // e.g., "1.0000" -> "1.0000", but "1." -> "1."
      if (value.endsWith('.')) return value;

      // Keep all zeros while typing
      const [integer, fraction] = value.split('.');
      if (fraction === '') return `${integer}.`;
      return `${integer}.${fraction}`;
    }

    return value;
  }, [value]);

  const handleMaxClick = React.useCallback(() => {
    if (onMaxClick) {
      onMaxClick();
    } else if (maxValue !== undefined && maxValue > 0) {
      // Only use maxValue if it's greater than 0
      onChange(formatUnits(maxValue, decimals));
    }
  }, [onMaxClick, maxValue, onChange, decimals]);

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <Input
          type="text"
          inputMode="decimal"
          pattern="^[0-9]*[.]?[0-9]*$"
          placeholder={placeholder}
          value={displayValue}
          onChange={handleChange}
          disabled={disabled}
          className={cn(
            'flex-1 text-lg font-semibold',
            showMaxButton && 'rounded-r-none',
            className
          )}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          // Prevent scroll from changing the value
          onWheel={e => e.currentTarget.blur()}
        />
        {showMaxButton && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className={cn('h-full rounded-l-none', disabled && 'cursor-not-allowed opacity-50')}
            onClick={handleMaxClick}
            disabled={disabled || !maxValue || maxValue === BigInt(0)}
          >
            MAX
          </Button>
        )}
      </div>
      {showUsdValue && (
        <div className="text-muted-foreground h-4 text-xs">
          {isCalculatingUsd ? 'Calculating...' : usdValue || '$0.00'}
        </div>
      )}
    </div>
  );
}
