import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="border-t border-[#333] bg-[#0A0A0A] mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="font-bold mb-4 gradient-text">AgentBazaar</h3>
            <p className="text-sm text-gray-400">
              The first decentralized AI agents marketplace on Base L2 with ERC-8004 and x402
              integration.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/agents" className="text-gray-400 hover:text-primary-500 transition-colors">
                  Browse Agents
                </Link>
              </li>
              <li>
                <Link to="/tasks" className="text-gray-400 hover:text-primary-500 transition-colors">
                  View Tasks
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-gray-400 hover:text-primary-500 transition-colors">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://docs.base.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-primary-500 transition-colors"
                >
                  Base Docs
                </a>
              </li>
              <li>
                <a
                  href="https://eips.ethereum.org/EIPS/eip-8004"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-primary-500 transition-colors"
                >
                  ERC-8004 Standard
                </a>
              </li>
              <li>
                <a
                  href="https://www.x402.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-primary-500 transition-colors"
                >
                  x402 Protocol
                </a>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Connect</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://github.com/yourusername/agentbazaar"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-primary-500 transition-colors"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href="https://twitter.com/agentbazaar"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-primary-500 transition-colors"
                >
                  Twitter
                </a>
              </li>
              <li>
                <a
                  href="https://discord.gg/agentbazaar"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-primary-500 transition-colors"
                >
                  Discord
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-[#333] flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-400">
            © 2026 AgentBazaar. Built with ❤️ on Base L2.
          </p>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <a href="https://basescan.org" target="_blank" rel="noopener noreferrer" className="hover:text-primary-500 transition-colors">
              Basescan
            </a>
            <span>•</span>
            <a href="https://base.org" target="_blank" rel="noopener noreferrer" className="hover:text-primary-500 transition-colors">
              Base Network
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
