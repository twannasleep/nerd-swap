'use client';

import { RefreshCw, Settings } from 'lucide-react';
import { Button } from '@/lib/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/lib/components/ui/card';

// Using lucide-react icons

export function SwapBox() {
  return (
    <Card className="bg-card/80 border-border/40 mx-auto w-full max-w-md backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-foreground text-lg font-semibold">Swap</CardTitle>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
          >
            <Settings className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* TokenInput components will go here */}
        <div className="text-muted-foreground py-8 text-center">[Token Inputs Placeholder]</div>

        {/* Connect Wallet / Swap Button will go here */}
        <Button
          size="lg"
          className="bg-primary hover:bg-primary/90 text-primary-foreground mt-2 w-full text-lg font-semibold"
        >
          Connect Wallet
        </Button>
      </CardContent>
    </Card>
  );
}
