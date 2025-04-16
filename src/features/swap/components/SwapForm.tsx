'use client';

import { useState } from 'react';
import {
  Button,
  Card,
  Group,
  Stack,
  Text,
  TextInput,
  Title,
  useMantineColorScheme,
} from '@mantine/core';
import { IconArrowDown, IconMoon, IconSettings, IconSun } from '@tabler/icons-react';
import { useAccount } from 'wagmi';
import { TokenSelect } from '@/features/tokens/components/TokenSelect';
import { useTokenBalance } from '@/features/tokens/hooks/useTokenBalance';
import { ConnectButton } from '@/features/web3/components/ConnectButton';
import { TOKENS } from '@/features/web3/constants';

export function SwapForm() {
  const { isConnected } = useAccount();
  const [fromToken, setFromToken] = useState<keyof typeof TOKENS>('BNB');
  const [toToken, setToToken] = useState<keyof typeof TOKENS>('TEST63');
  const [amount, setAmount] = useState('');
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  const { balance: fromBalance, symbol: fromSymbol } = useTokenBalance(fromToken);
  const { balance: toBalance, symbol: toSymbol } = useTokenBalance(toToken);

  const handleSwapTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
  };

  return (
    <Card withBorder radius="lg" p="xl" maw={440} mx="auto" bg="var(--mantine-color-surface-2)">
      <Stack gap="md">
        <Group justify="space-between" mb="xs">
          <Title order={3} fw={600}>
            Swap
          </Title>
          <Group gap="sm">
            <Button
              variant="subtle"
              color="gray"
              p={8}
              radius="xl"
              onClick={() => toggleColorScheme()}
            >
              {colorScheme === 'dark' ? <IconSun size={20} /> : <IconMoon size={20} />}
            </Button>
            <Button variant="subtle" color="gray" p={8} radius="xl">
              <IconSettings size={20} />
            </Button>
            <ConnectButton />
          </Group>
        </Group>

        <Card withBorder p="md" radius="md" bg="var(--mantine-color-surface-1)">
          <Stack gap="xs">
            <Group justify="space-between">
              <TextInput
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0.0"
                size="lg"
                w={200}
                variant="unstyled"
                styles={{ input: { fontSize: '2rem', fontWeight: 600 } }}
              />
              <TokenSelect value={fromToken} onChange={setFromToken} excludeToken={toToken} />
            </Group>
            <Group justify="end">
              <Text size="sm" c="dimmed">
                Balance: {fromBalance} {fromSymbol}
              </Text>
            </Group>
          </Stack>
        </Card>

        <Group justify="center" my="-0.75rem">
          <Button
            variant="light"
            color="gray"
            size="sm"
            onClick={handleSwapTokens}
            radius="xl"
            p={0}
            w={40}
            h={40}
          >
            <IconArrowDown size={20} />
          </Button>
        </Group>

        <Card withBorder p="md" radius="md" bg="var(--mantine-color-surface-1)">
          <Stack gap="xs">
            <Group justify="space-between">
              <TextInput
                placeholder="0.0"
                size="lg"
                w={200}
                variant="unstyled"
                styles={{ input: { fontSize: '2rem', fontWeight: 600 } }}
                disabled
              />
              <TokenSelect value={toToken} onChange={setToToken} excludeToken={fromToken} />
            </Group>
            <Group justify="end">
              <Text size="sm" c="dimmed">
                Balance: {toBalance} {toSymbol}
              </Text>
            </Group>
          </Stack>
        </Card>

        <Button
          fullWidth
          size="lg"
          radius="xl"
          color={isConnected ? 'primary' : 'gray'}
          disabled={!isConnected}
          h={56}
          mt="sm"
        >
          {isConnected ? 'Swap' : 'Connect Wallet to Swap'}
        </Button>
      </Stack>
    </Card>
  );
}
