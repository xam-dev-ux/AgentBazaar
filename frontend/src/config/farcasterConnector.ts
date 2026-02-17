import { injected } from 'wagmi/connectors';
import sdk from '@farcaster/miniapp-sdk';

export function farcasterConnector() {
  return injected({
    target() {
      return {
        id: 'farcasterMiniApp',
        name: 'Farcaster Wallet',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        provider: sdk.wallet.ethProvider as any,
      };
    },
  });
}
