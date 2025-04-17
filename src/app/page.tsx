'use client';

// Need client component for layout and swap box
import { AppLayout } from '@/components/Layout';
import { SwapForm } from '@/features/swap/components/SwapForm';

// Assuming Layout is in src/components

export default function HomePage() {
  return (
    <AppLayout>
      <SwapForm />
    </AppLayout>
  );
}
