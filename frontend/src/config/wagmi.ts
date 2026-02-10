import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { base, baseSepolia } from 'wagmi/chains';

// Get environment variables
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'default-project-id';

// Configure chains
export const config = getDefaultConfig({
  appName: 'AgentBazaar',
  projectId,
  chains: [base, baseSepolia],
  ssr: false,
});

// Export chains for easy access
export { base, baseSepolia };
