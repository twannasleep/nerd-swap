'use client';

import Link from 'next/link';
import { AppLayout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ContractStatus } from '@/features/web3/components/ContractStatus';
import { NetworkStatus } from '@/features/web3/components/NetworkStatus';

export default function Web3TestPage() {
  return (
    <AppLayout>
      <div className="container mx-auto max-w-2xl space-y-4 py-8">
        <div className="mb-8 flex flex-col items-center">
          <h1 className="mb-2 text-center text-3xl font-bold">Web3 Configuration Test</h1>
          <p className="text-muted-foreground mb-4 text-center">
            This page verifies the BNB Testnet configuration and contract integration.
          </p>
        </div>

        <NetworkStatus />
        <ContractStatus />

        <Card>
          <CardHeader>
            <CardTitle>BNB Testnet Resources</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col space-y-2">
              <div className="text-sm font-medium">Need BNB Testnet tokens?</div>
              <Button asChild variant="outline" className="w-full">
                <Link href="https://testnet.bnbchain.org/faucet-smart" target="_blank">
                  BNB Testnet Faucet
                </Link>
              </Button>
            </div>

            <div className="flex flex-col space-y-2">
              <div className="text-sm font-medium">Explore transactions</div>
              <Button asChild variant="outline" className="w-full">
                <Link href="https://testnet.bscscan.com" target="_blank">
                  BscScan Testnet
                </Link>
              </Button>
            </div>

            <div className="flex flex-col space-y-2">
              <div className="mt-4 text-sm font-medium">Proceed to Swap</div>
              <Button asChild className="w-full">
                <Link href="/">Return to Swap</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
