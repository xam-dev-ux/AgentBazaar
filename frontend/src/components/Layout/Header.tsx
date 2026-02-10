import { Link, useLocation } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';

export function Header() {
  const location = useLocation();
  const { isConnected } = useAccount();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#333] bg-[#0A0A0A]/95 backdrop-blur supports-[backdrop-filter]:bg-[#0A0A0A]/80">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">A</span>
            </div>
            <span className="text-xl font-bold gradient-text hidden sm:inline">
              AgentBazaar
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors hover:text-primary-500 ${
                isActive('/') ? 'text-primary-500' : 'text-gray-400'
              }`}
            >
              Home
            </Link>
            <Link
              to="/agents"
              className={`text-sm font-medium transition-colors hover:text-primary-500 ${
                isActive('/agents') ? 'text-primary-500' : 'text-gray-400'
              }`}
            >
              Agents
            </Link>
            <Link
              to="/tasks"
              className={`text-sm font-medium transition-colors hover:text-primary-500 ${
                isActive('/tasks') ? 'text-primary-500' : 'text-gray-400'
              }`}
            >
              Tasks
            </Link>
            {isConnected && (
              <Link
                to="/dashboard"
                className={`text-sm font-medium transition-colors hover:text-primary-500 ${
                  isActive('/dashboard') ? 'text-primary-500' : 'text-gray-400'
                }`}
              >
                Dashboard
              </Link>
            )}
          </nav>

          {/* Connect Button */}
          <div className="flex items-center gap-4">
            <ConnectButton
              chainStatus="icon"
              showBalance={false}
              accountStatus={{
                smallScreen: 'avatar',
                largeScreen: 'full',
              }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
