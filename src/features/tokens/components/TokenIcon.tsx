import { Avatar } from '@mantine/core';
import { TOKENS } from '@/features/web3/constants';

interface TokenIconProps {
  symbol: keyof typeof TOKENS;
  size?: number;
}

export function TokenIcon({ symbol, size = 32 }: TokenIconProps) {
  return (
    <Avatar
      size={size}
      radius="xl"
      src={`/tokens/${symbol.toLowerCase()}.png`}
      alt={`${symbol} icon`}
      color="primary"
    >
      {symbol.substring(0, 2)}
    </Avatar>
  );
}
