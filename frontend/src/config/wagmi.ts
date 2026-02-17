import { createConfig, http, fallback } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { getDefaultWallets, connectorsForWallets } from '@rainbow-me/rainbowkit';
import { Attribution } from 'ox/erc8021';
import { farcasterConnector } from './farcasterConnector';

// Get environment variables
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'default-project-id';
const customRpcUrl = import.meta.env.VITE_BASE_RPC_URL;

// Builder Code for attribution on Base
const DATA_SUFFIX = Attribution.toDataSuffix({
  codes: ['bc_8zokphir'],
});

// Base mainnet transports with fallback — only CORS-compatible endpoints for browser use
const baseTransport = fallback([
  ...(customRpcUrl && customRpcUrl !== 'https://mainnet.base.org'
    ? [http(customRpcUrl)]
    : []),
  http('https://rpc.ankr.com/base'),
  http('https://base-rpc.publicnode.com'),
  http('https://mainnet.base.org'),
]);

// RainbowKit default wallets (MetaMask, Coinbase, WalletConnect, Rainbow...)
const { wallets } = getDefaultWallets();
const rbkConnectors = connectorsForWallets(wallets, {
  appName: 'AgentBazaar',
  projectId,
});

export const config = createConfig({
  chains: [base, baseSepolia],
  connectors: [...rbkConnectors, farcasterConnector()],
  transports: {
    [base.id]: baseTransport,
    [baseSepolia.id]: http(),
  },
  ssr: false,
  dataSuffix: DATA_SUFFIX,
});

// Export chains for easy access
export { base, baseSepolia };
