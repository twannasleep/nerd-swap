import { NextConfig } from 'next';

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ['@mantine/core', '@mantine/hooks', '@mantine/notifications'],
  },
};

export default withBundleAnalyzer(nextConfig);
