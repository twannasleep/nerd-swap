import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { cookies } from 'next/headers';
import { RootProvider } from '@/lib/providers/RootProvider';
import { ThemeProvider } from '@/lib/providers/ThemeProvider';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Nerd Swap',
  description: 'Swap your NFTs',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const appKitCookies = cookieStore.get('wagmi.store')?.value ?? null;

  return (
    <html suppressHydrationWarning lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider>
          <RootProvider cookies={appKitCookies}>{children}</RootProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
