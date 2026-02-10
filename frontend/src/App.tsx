import { Routes, Route } from 'react-router-dom';
import { Layout } from '@components/Layout';
import {
  HomePage,
  AgentsPage,
  AgentDetailPage,
  TasksPage,
  DashboardPage,
} from './pages';

function App() {
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
