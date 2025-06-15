/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['api.flowfit.io', 'ipfs.io'],
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
  env: {
    FLOW_NETWORK: process.env.FLOW_NETWORK || 'testnet',
    FLOW_ACCESS_NODE_API: process.env.FLOW_ACCESS_NODE_API || 'https://rest-testnet.onflow.org',
    FLOW_DISCOVERY_WALLET: process.env.FLOW_DISCOVERY_WALLET || 'https://fcl-discovery.onflow.org/testnet/authn',
    FLOWSCAN_URL: process.env.FLOWSCAN_URL || 'https://testnet.flowscan.org',
  },
}

module.exports = nextConfig 