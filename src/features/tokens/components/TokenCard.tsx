'use client';

import { Card, Group, Stack, Text } from '@mantine/core';
import { TOKENS } from '@/features/web3/constants';
import { TokenIcon } from './TokenIcon';

interface TokenCardProps {
  symbol: keyof typeof TOKENS;
  balance?: string;
  value?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function TokenCard({ symbol, balance, value, size = 'md' }: TokenCardProps) {
  const token = TOKENS[symbol];
  const iconSize = size === 'sm' ? 28 : size === 'md' ? 36 : 48;
  const fontSize = size === 'sm' ? 'sm' : size === 'md' ? 'md' : 'lg';

  return (
    <Card
      withBorder
      p={size === 'sm' ? 'xs' : 'sm'}
      radius="md"
      bg="var(--mantine-color-surface-1)"
    >
      <Group>
        <TokenIcon symbol={symbol} size={iconSize} />
        <Stack gap={2}>
          <Text size={fontSize} fw={600}>
            {symbol}
          </Text>
          <Text size="xs" c="dimmed">
            {token.name}
          </Text>
        </Stack>
        {(balance || value) && (
          <Stack gap={2} ml="auto">
            {balance && (
              <Text size={fontSize} fw={500}>
                {balance}
              </Text>
            )}
            {value && (
              <Text size="xs" c="dimmed">
                {value}
              </Text>
            )}
          </Stack>
        )}
      </Group>
    </Card>
  );
}
