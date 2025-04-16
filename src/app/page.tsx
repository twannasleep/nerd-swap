import { Container } from '@mantine/core';
import { SwapForm } from '@/features/swap/components/SwapForm';

export default function HomePage() {
  return (
    <Container size="sm" py="xl">
      <SwapForm />
    </Container>
  );
}
