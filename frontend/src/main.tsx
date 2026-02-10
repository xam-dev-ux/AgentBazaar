import React from 'react';
import ReactDOM from 'react-dom/client';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { config } from './config/wagmi';
import App from './App';
import './index.css';
import '@rainbow-me/rainbowkit/styles.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30000, // 30 seconds
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider
            theme={darkTheme({
              accentColor: '#0052FF',
              accentColorForeground: 'white',
              borderRadius: 'medium',
            })}
          >
            <App />
            <Toaster
              position="bottom-right"
              toastOptions={{
                duration: 5000,
                style: {
                  background: '#1A1A1A',
                  color: '#fff',
                  border: '1px solid #333',
                },
                success: {
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#fff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </BrowserRouter>
  </React.StrictMode>
);
