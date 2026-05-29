import { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { getCoins } from '../api/minimaApi';

export default function WalletSummary() {
  const { user, signOut } = useAuth();
  const [coins, setCoins] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user?.minimaAddress) return;
    setLoading(true);
    getCoins({ address: user.minimaAddress })
      .then(data => setCoins(Array.isArray(data) ? data : []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [user?.minimaAddress]);

  // count distinct token types at this address
  const tokenCount = coins
    ? new Set(coins.map(c => c.tokenid ?? c.tokenID).filter(Boolean)).size
    : null;

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
          <span className="wallet-label">Token types at this address</span>
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
