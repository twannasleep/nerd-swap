import * as React from 'react';
import { formatUnits, parseUnits } from 'viem';
import { Input } from '@/components/ui/input';

interface TokenAmountInputProps {
  value: string;
  onChange: (value: string) => void;
  decimals: number;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  maxValue?: bigint | undefined;
}

export function TokenAmountInput({
  value,
  onChange,
  decimals,
  placeholder = '0.0',
  disabled = false,
  className,
  maxValue,
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

    // Validate against max value if provided
    if (maxValue !== undefined && newValue !== '') {
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

  // Format the display value to remove trailing zeros after decimal
  const displayValue = React.useMemo(() => {
    if (!value) return '';
    if (!value.includes('.')) return value;
    return value.replace(/\.?0+$/, '');
  }, [value]);

  return (
    <Input
      type="text"
      inputMode="decimal"
      pattern="^[0-9]*[.]?[0-9]*$"
      placeholder={placeholder}
      value={displayValue}
      onChange={handleChange}
      disabled={disabled}
      className={className}
      autoComplete="off"
      autoCorrect="off"
      spellCheck={false}
      // Prevent scroll from changing the value
      onWheel={e => e.currentTarget.blur()}
    />
  );
}
