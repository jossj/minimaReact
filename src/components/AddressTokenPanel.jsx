import { useState } from 'react';
import { getCoins } from '../api/minimaApi';
import JsonView from './JsonView';

export default function AddressTokenPanel() {
  return (
    <div className="panel-grid">
      <TokenBalanceCard />
    </div>
  );
}

function TokenBalanceCard() {
  const [address, setAddress] = useState('');
  const [tokenid, setTokenid] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function lookup() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const params = { address };
      if (tokenid) params.tokenid = tokenid;
      const raw = await getCoins(params);
      const coins = Array.isArray(raw) ? raw : (raw?.response ?? raw?.coins ?? []);
      const total = coins.reduce((sum, c) => sum + parseFloat(c.amount ?? 0), 0);
      setResult({ total, coinCount: coins.length, coins });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="panel">
      <h2>Token Balance at Address</h2>
      <div className="stacked-form">
        <label>
          Wallet Address
          <input
            placeholder="0x... or Mx..."
            value={address}
            onChange={e => setAddress(e.target.value)}
          />
        </label>
        <label>
          Token ID
          <input
            placeholder="0x00 = Minima (leave blank for all tokens)"
            value={tokenid}
            onChange={e => setTokenid(e.target.value)}
          />
        </label>
        <button className="btn" onClick={lookup} disabled={loading || !address}>
          {loading ? 'Looking up…' : 'Look Up'}
        </button>
      </div>
      {error && <p className="err-text">{error}</p>}
      {result && (
        <>
          <div style={{ display: 'flex', gap: 24, marginTop: 16, padding: '12px 14px', background: '#0f172a', borderRadius: 8, border: '1px solid #334155' }}>
            <div>
              <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Total Balance</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#818cf8' }}>{result.total}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Coins Found</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#94a3b8' }}>{result.coinCount}</div>
            </div>
          </div>
          {result.coins.length > 0 && <JsonView data={result.coins} />}
        </>
      )}
    </div>
  );
}
