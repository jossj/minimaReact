import { useEffect, useState, useCallback } from 'react';
import { getAddress, createAddress, getCoins } from '../api/minimaApi';
import { useAuth } from '../AuthContext';

const addrKey = (username) => `minima_addr_${username}`;

function extractAddrString(addrObj) {
  if (!addrObj) return null;
  if (typeof addrObj === 'string') return addrObj;
  // Minima address objects may use different field names
  return addrObj.miniaddress ?? addrObj.address ?? addrObj.script ?? addrObj.hexaddress ?? null;
}

function tokenLabel(coin) {
  const raw = coin.token ?? coin.tokenname;
  if (raw == null) return coin.tokenid ? `${coin.tokenid.slice(0, 12)}…` : 'Minima';
  if (typeof raw === 'string') return raw;
  return raw.name ?? raw.description ?? JSON.stringify(raw);
}

export default function WalletSummary() {
  const { user } = useAuth();
  const [addrObj, setAddrObj] = useState(null);
  const [tokenMap, setTokenMap] = useState(null); // { tokenid -> { label, count } }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadWallet = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      // Retrieve or create a dedicated address for this user
      let addr;
      const stored = localStorage.getItem(addrKey(user.username));
      if (stored) {
        addr = JSON.parse(stored);
      } else {
        try {
          addr = await getAddress();
        } catch {
          addr = await createAddress();
        }
        localStorage.setItem(addrKey(user.username), JSON.stringify(addr));
      }
      setAddrObj(addr);

      // Check for tokens (UTXOs) at this specific address
      const addrString = extractAddrString(addr);
      if (addrString) {
        const coins = await getCoins({ address: addrString });
        const coinList = Array.isArray(coins) ? coins : (coins?.coins ?? []);
        // Aggregate by tokenid
        const map = {};
        for (const coin of coinList) {
          const tid = coin.tokenid ?? '0x00';
          if (!map[tid]) map[tid] = { label: tokenLabel(coin), count: 0 };
          map[tid].count += 1;
        }
        setTokenMap(map);
      } else {
        setTokenMap({});
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { loadWallet(); }, [loadWallet]);

  const addrString = extractAddrString(addrObj);
  const tokenEntries = tokenMap ? Object.entries(tokenMap) : [];
  const totalTokenTypes = tokenEntries.length;
  const totalCoins = tokenEntries.reduce((sum, [, v]) => sum + v.count, 0);

  return (
    <div className="wallet-summary">
      <div className="ws-inner">
        {loading && (
          <span className="ws-loading muted">Loading wallet…</span>
        )}
        {!loading && error && (
          <div className="ws-error">
            <span className="err-text">{error}</span>
            <button className="btn-sm" onClick={loadWallet}>Retry</button>
          </div>
        )}
        {!loading && !error && (
          <>
            <div className="ws-address-block">
              <span className="ws-label">Minima Address</span>
              <span className="ws-address" title={addrString ?? undefined}>
                {addrString ?? 'Unavailable'}
              </span>
            </div>

            <div className="ws-divider" />

            <div className="ws-tokens-block">
              <span className="ws-label">Tokens at address</span>
              <div className="ws-token-stats">
                <span className="ws-stat">
                  <span className="ws-stat-value">{totalTokenTypes}</span>
                  <span className="ws-stat-label">type{totalTokenTypes !== 1 ? 's' : ''}</span>
                </span>
                <span className="ws-stat">
                  <span className="ws-stat-value">{totalCoins}</span>
                  <span className="ws-stat-label">coin{totalCoins !== 1 ? 's' : ''}</span>
                </span>
              </div>
              {totalTokenTypes > 0 && (
                <div className="ws-token-chips">
                  {tokenEntries.map(([tid, { label, count }]) => (
                    <span key={tid} className="ws-chip" title={`Token ID: ${tid}`}>
                      {label}
                      <span className="ws-chip-count">{count}</span>
                    </span>
                  ))}
                </div>
              )}
              {totalTokenTypes === 0 && (
                <span className="ws-no-tokens muted">No tokens sent to this address yet</span>
              )}
            </div>

            <button className="btn-sm ws-refresh" onClick={loadWallet} title="Refresh wallet data">
              Refresh
            </button>
          </>
        )}
      </div>
    </div>
  );
}
