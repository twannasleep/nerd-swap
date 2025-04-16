import { Group, Select, Text } from '@mantine/core';
import { TOKENS } from '@/features/web3/constants';
import { TokenIcon } from './TokenIcon';

interface TokenSelectProps {
  value: keyof typeof TOKENS;
  onChange: (value: keyof typeof TOKENS) => void;
  excludeToken?: keyof typeof TOKENS;
}

interface TokenOption {
  value: keyof typeof TOKENS;
  label: string;
  name: string;
  decimals: number;
  isNative: boolean;
  address?: string;
}

export function TokenSelect({ value, onChange, excludeToken }: TokenSelectProps) {
  const tokenList = Object.entries(TOKENS)
    .filter(([symbol]) => symbol !== excludeToken)
    .map(([symbol, token]) => ({
      value: symbol,
      label: symbol,
      ...token,
    })) as TokenOption[];

  return (
    <Select
      value={value}
      onChange={newValue => newValue && onChange(newValue as keyof typeof TOKENS)}
      data={tokenList}
      size="lg"
      radius="md"
      placeholder="Select token"
      comboboxProps={{ withinPortal: true }}
      renderOption={({ option }) => (
        <Group gap="sm">
          <TokenIcon symbol={option.value as keyof typeof TOKENS} size={24} />
          <div>
            <Text size="sm" fw={500}>
              {option.label}
            </Text>
            <Text size="xs" c="dimmed">
              {option.value}
            </Text>
          </div>
        </Group>
      )}
    />
  );
}
