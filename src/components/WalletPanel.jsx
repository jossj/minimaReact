import { useEffect, useState } from 'react';
import { getBalance, getAddress, createAddress, getCoins, getHistory, sendFunds } from '../api/minimaApi';
import JsonView from './JsonView';

export default function WalletPanel() {
  return (
    <div className="panel-grid">
      <BalanceCard />
      <AddressCard />
      <CoinsCard />
      <HistoryCard />
      <SendCard />
    </div>
  );
}

function BalanceCard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => { load(); }, []);
  async function load() {
    try { setData(await getBalance()); }
    catch (e) { setError(e.message); }
  }
  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Balance</h2>
        <button className="btn-sm" onClick={load}>Refresh</button>
      </div>
      {error && <p className="err-text">{error}</p>}
      {Array.isArray(data) ? (
        <table className="data-table">
          <thead>
            <tr><th>Token</th><th>Confirmed</th><th>Unconfirmed</th><th>Sendable</th></tr>
          </thead>
          <tbody>
            {data.map((b, i) => (
              <tr key={i}>
                <td title={b.tokenid}>{b.token ?? (b.tokenid?.slice(0, 12) + '…')}</td>
                <td>{b.confirmed}</td>
                <td>{b.unconfirmed}</td>
                <td>{b.sendable}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : data && <JsonView data={data} />}
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
