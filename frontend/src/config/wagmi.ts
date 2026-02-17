import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { base, baseSepolia } from 'wagmi/chains';
import { http, fallback } from 'wagmi';
import { Attribution } from 'ox/erc8021';

// Get environment variables
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'default-project-id';
const customRpcUrl = import.meta.env.VITE_BASE_RPC_URL;

// Builder Code for attribution on Base
const DATA_SUFFIX = Attribution.toDataSuffix({
  codes: ['bc_8zokphir'],
});

// Base mainnet transports with fallback to avoid 429 rate limits on the public node
const baseTransport = fallback([
  ...(customRpcUrl && customRpcUrl !== 'https://mainnet.base.org'
    ? [http(customRpcUrl)]
    : []),
  http('https://base.llamarpc.com'),
  http('https://base-rpc.publicnode.com'),
  http('https://1rpc.io/base'),
  http('https://mainnet.base.org'),
]);

// Configure chains
export const config = getDefaultConfig({
  appName: 'AgentBazaar',
  projectId,
  chains: [base, baseSepolia],
  transports: {
    [base.id]: baseTransport,
    [baseSepolia.id]: http(),
  },
  ssr: false,
  dataSuffix: DATA_SUFFIX,
});

// Export chains for easy access
export { base, baseSepolia };
