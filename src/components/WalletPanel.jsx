import { useEffect, useState } from 'react';
import { getBalance, getAddress, createAddress, getCoins, getHistory, sendFunds } from '../api/minimaApi';
import JsonView from './JsonView';

export default function WalletPanel() {
  return (
    <div className="panel-grid">
      <WalletSummary />
      <BalanceCard />
      <AddressCard />
      <CoinsCard />
      <HistoryCard />
      <SendCard />
    </div>
  );
}

function WalletSummary() {
  const [tokenCount, setTokenCount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await getBalance();
      setTokenCount(Array.isArray(data) ? data.length : null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Wallet Summary</h2>
        <button className="btn-sm" onClick={load} disabled={loading}>{loading ? '…' : 'Refresh'}</button>
      </div>
      {error && <p className="err-text">{error}</p>}
      {tokenCount !== null && (
        <p><strong>Token types in wallet:</strong> {tokenCount}</p>
      )}
    </div>
  );
}

// Minima stores custom token names as objects e.g. {name:'redToken'}.
// The balance response may use `name` instead of `token`, and `total`
// instead of `confirmed`/`unconfirmed`/`sendable` depending on version.
function tokenLabel(b) {
  const raw = b.token ?? b.name;
  if (raw == null) return b.tokenid ? `${b.tokenid.slice(0, 14)}…` : 'Unknown';
  if (typeof raw === 'string') return raw;
  // object e.g. {name:'redToken', description:'...'}
  return raw.name ?? raw.description ?? JSON.stringify(raw);
}

function BalanceCard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try { setData(await getBalance()); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  const hasBalanceFields = Array.isArray(data) && data.length > 0 && data[0].confirmed != null;

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Balance</h2>
        <button className="btn-sm" onClick={load} disabled={loading}>{loading ? '…' : 'Refresh'}</button>
      </div>
      {error && <p className="err-text">{error}</p>}
      {loading && !data && <p className="muted">Loading…</p>}
      {Array.isArray(data) && data.length === 0 && <p className="muted">No balance data</p>}
      {Array.isArray(data) && data.length > 0 && (
        <table className="data-table">
          <thead>
            <tr>
              <th>Token</th>
              {hasBalanceFields ? (
                <><th>Confirmed</th><th>Unconfirmed</th><th>Sendable</th></>
              ) : (
                <th>Total</th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.map((b, i) => (
              <tr key={i}>
                <td title={b.tokenid}>{tokenLabel(b)}</td>
                {hasBalanceFields ? (
                  <><td>{b.confirmed}</td><td>{b.unconfirmed}</td><td>{b.sendable}</td></>
                ) : (
                  <td>{b.total ?? '—'}</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {data && !Array.isArray(data) && <JsonView data={data} />}
    </div>
  );
}

function AddressCard() {
  const [address, setAddress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  useEffect(() => { load(); }, []);
  async function load() {
    try { setAddress(await getAddress()); }
    catch (e) { setError(e.message); }
  }
  async function newAddr() {
    setLoading(true);
    setError(null);
    try { setAddress(await createAddress()); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }
  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Address</h2>
        <button className="btn-sm" onClick={load}>Refresh</button>
      </div>
      {error && <p className="err-text">{error}</p>}
      {address && <JsonView data={address} />}
      <button className="btn" onClick={newAddr} disabled={loading} style={{ marginTop: 12 }}>
        {loading ? '…' : 'New Address'}
      </button>
    </div>
  );
}

function CoinsCard() {
  const [data, setData] = useState(null);
  const [addr, setAddr] = useState('');
  const [tid, setTid] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  async function load() {
    setLoading(true);
    setError(null);
    try {
      const p = {};
      if (addr) p.address = addr;
      if (tid) p.tokenid = tid;
      setData(await getCoins(p));
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }
  return (
    <div className="panel">
      <h2>Coins (UTXOs)</h2>
      <div className="form-row">
        <input placeholder="Address (optional)" value={addr} onChange={e => setAddr(e.target.value)} />
        <input placeholder="Token ID (optional)" value={tid} onChange={e => setTid(e.target.value)} />
        <button className="btn-sm" onClick={load} disabled={loading}>{loading ? '…' : 'Fetch'}</button>
      </div>
      {error && <p className="err-text">{error}</p>}
      {data && <JsonView data={data} />}
    </div>
  );
}

function HistoryCard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  async function load() {
    setLoading(true);
    setError(null);
    try { setData(await getHistory()); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }
  return (
    <div className="panel">
      <div className="panel-header">
        <h2>History</h2>
        <button className="btn-sm" onClick={load} disabled={loading}>{loading ? '…' : 'Load'}</button>
      </div>
      {error && <p className="err-text">{error}</p>}
      {data && <JsonView data={data} />}
    </div>
  );
}

function SendCard() {
  const [form, setForm] = useState({ address: '', amount: '', tokenid: '', burn: '', state: '' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }
  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const body = { address: form.address, amount: form.amount };
      if (form.tokenid) body.tokenid = form.tokenid;
      if (form.burn) body.burn = form.burn;
      if (form.state) body.state = form.state;
      setResult(await sendFunds(body));
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }
  return (
    <div className="panel">
      <h2>Send</h2>
      <form className="stacked-form" onSubmit={submit}>
        <label>To Address<input required value={form.address} onChange={e => set('address', e.target.value)} /></label>
        <label>Amount<input required value={form.amount} onChange={e => set('amount', e.target.value)} /></label>
        <label>Token ID<input placeholder="0x00 = Minima" value={form.tokenid} onChange={e => set('tokenid', e.target.value)} /></label>
        <label>Burn<input placeholder="optional" value={form.burn} onChange={e => set('burn', e.target.value)} /></label>
        <label>State<input placeholder="optional JSON" value={form.state} onChange={e => set('state', e.target.value)} /></label>
        <button className="btn" type="submit" disabled={loading}>{loading ? 'Sending…' : 'Send'}</button>
      </form>
      {error && <p className="err-text">{error}</p>}
      {result && <JsonView data={result} />}
    </div>
  );
}
