'use client';

// Need client component for layout and swap box
import { AppLayout } from '@/components/Layout';
// Assuming Layout is in src/components
import { SwapBox } from '@/features/swap/components/SwapBox';

export default function HomePage() {
  return (
    <AppLayout>
      <SwapBox />
    </AppLayout>
  );
}
