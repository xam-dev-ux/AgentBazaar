/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BASE_CHAIN_ID: string
  readonly VITE_BASE_RPC_URL: string
  readonly VITE_WALLETCONNECT_PROJECT_ID: string
  readonly VITE_IDENTITY_REGISTRY: string
  readonly VITE_REPUTATION_REGISTRY: string
  readonly VITE_VALIDATION_REGISTRY: string
  readonly VITE_AGENT_BAZAAR: string
  readonly VITE_TASK_MANAGER: string
  readonly VITE_USDC_ADDRESS: string
  readonly VITE_IPFS_GATEWAY: string
  readonly VITE_PINATA_API_KEY: string
  readonly VITE_PINATA_SECRET_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
