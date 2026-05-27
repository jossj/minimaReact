import { useState } from 'react';
import { useApi } from './ApiContext';
import NodePanel from './components/NodePanel';
import WalletPanel from './components/WalletPanel';
import TokenPanel from './components/TokenPanel';
import TransactionPanel from './components/TransactionPanel';
import MaximaPanel from './components/MaximaPanel';
import ScriptPanel from './components/ScriptPanel';
import WebhookPanel from './components/WebhookPanel';
import ProductPanel from './components/ProductPanel';
import RawPanel from './components/RawPanel';
import './App.css';

const TABS = [
  { id: 'node',         label: 'Node'         },
  { id: 'wallet',       label: 'Wallet'       },
  { id: 'tokens',       label: 'Tokens'       },
  { id: 'transactions', label: 'Transactions' },
  { id: 'maxima',       label: 'Maxima'       },
  { id: 'scripts',      label: 'Scripts'      },
  { id: 'webhooks',     label: 'Webhooks'     },
  { id: 'products',     label: 'Products'     },
  { id: 'raw',          label: 'Raw CMD'      },
];

export default function App() {
  const { nodeReady, backendReachable } = useApi();
  const [tab, setTab] = useState('node');

  return (
    <div className="app">
      <header className="app-header">
        <h1>Minima Dashboard</h1>
        <div className="status-badges">
          <StatusBadge label="Backend" ok={backendReachable} />
          <StatusBadge label="Node" ok={nodeReady} />
        </div>
      </header>

      {!backendReachable && (
        <div className="banner">
          Cannot reach backend. Make sure minimaBackend is running on port 8080.
        </div>
      )}

      <nav className="tab-nav">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`tab-btn${tab === t.id ? ' active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <main className="app-main">
        {tab === 'node'         && <NodePanel />}
        {tab === 'wallet'       && <WalletPanel />}
        {tab === 'tokens'       && <TokenPanel />}
        {tab === 'transactions' && <TransactionPanel />}
        {tab === 'maxima'       && <MaximaPanel />}
        {tab === 'scripts'      && <ScriptPanel />}
        {tab === 'webhooks'     && <WebhookPanel />}
        {tab === 'products'     && <ProductPanel />}
        {tab === 'raw'          && <RawPanel />}
      </main>
    </div>
  );
}

function StatusBadge({ label, ok }) {
  return (
    <span className={`status-badge${ok ? ' ok' : ' err'}`}>
      <span className="dot" />
      {label}
    </span>
  );
}
