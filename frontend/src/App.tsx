import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useConnect } from 'wagmi';
import { Layout } from './components/Layout';
import {
  HomePage,
  AgentsPage,
  AgentDetailPage,
  TasksPage,
  DashboardPage,
} from './pages';

function App() {
  const { connect, connectors } = useConnect();

  useEffect(() => {
    const initFarcaster = async () => {
      try {
        const { default: sdk } = await import('@farcaster/miniapp-sdk');
        const context = await Promise.race([
          sdk.context,
          new Promise<null>((resolve) => setTimeout(() => resolve(null), 1500)),
        ]);
        if (context?.client) {
          await sdk.actions.ready();
          const farcasterConn = connectors.find((c) => c.id === 'farcasterMiniApp');
          if (farcasterConn) {
            connect({ connector: farcasterConn });
          }
        }
      } catch {
        // Not in Farcaster context, use normal wallet connection
      }
    };
    initFarcaster();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/agents" element={<AgentsPage />} />
        <Route path="/agents/:id" element={<AgentDetailPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </Layout>
  );
}

export default App;
