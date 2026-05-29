import { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { getBalance } from '../api/minimaApi';

export default function WalletSummary() {
  const { user, signOut } = useAuth();
  const [balances, setBalances] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setLoading(true);
    getBalance()
      .then(data => setBalances(Array.isArray(data) ? data : []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const tokenCount = balances ? balances.length : null;

  function copyAddress() {
    navigator.clipboard.writeText(user.minimaAddress).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div className="wallet-summary">
      <div className="wallet-info">
        <div className="wallet-field">
          <span className="wallet-label">Wallet Address</span>
          <div className="wallet-addr-row">
            <code className="wallet-addr">{user?.minimaAddress}</code>
            <button className="btn-copy" onClick={copyAddress} title="Copy to clipboard">
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>
        </div>
        <div className="wallet-field">
          <span className="wallet-label">Token types in wallet</span>
          <span className="wallet-count">
            {loading ? '…' : error ? <span className="err-text" style={{fontSize:13}}>{error}</span> : (tokenCount ?? '—')}
          </span>
        </div>
      </div>
      <div className="wallet-actions">
        <span className="wallet-user">{user?.username}</span>
        <button className="btn-sm btn-danger" onClick={signOut}>Logout</button>
      </div>
    </div>
  );
}
