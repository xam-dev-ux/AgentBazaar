import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { base, baseSepolia } from 'wagmi/chains';
import { Attribution } from 'ox/erc8021';

// Get environment variables
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'default-project-id';

// Builder Code for attribution on Base
const DATA_SUFFIX = Attribution.toDataSuffix({
  codes: ['bc_8zokphir'],
});

// Configure chains
export const config = getDefaultConfig({
  appName: 'AgentBazaar',
  projectId,
  chains: [base, baseSepolia],
  ssr: false,
  dataSuffix: DATA_SUFFIX,
});

// Export chains for easy access
export { base, baseSepolia };
