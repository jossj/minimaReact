import { useState } from 'react';
import { listTxns, createTxn, viewTxn, deleteTxn, autoTxn, signTxn, postTxn, getTxPow } from '../api/minimaApi';
import JsonView from './JsonView';

export default function TransactionPanel() {
  return (
    <div className="panel-grid">
      <TxnListCard />
      <TxnBuilderCard />
      <TxPowCard />
    </div>
  );
}

function TxnListCard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  async function load() {
    setLoading(true);
    setError(null);
    try { setData(await listTxns()); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }
  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Offline Transactions</h2>
        <button className="btn-sm" onClick={load} disabled={loading}>{loading ? '…' : 'List'}</button>
      </div>
      {error && <p className="err-text">{error}</p>}
      {data && <JsonView data={data} />}
    </div>
  );
}

function TxnBuilderCard() {
  const [id, setId] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [autoForm, setAutoForm] = useState({ address: '', amount: '', tokenid: '' });

  function setAf(k, v) { setAutoForm(f => ({ ...f, [k]: v })); }

  async function act(fn) {
    if (!id) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try { setResult(await fn()); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  return (
    <div className="panel">
      <h2>Transaction Builder</h2>
      <div className="form-row" style={{ marginBottom: 10 }}>
        <input placeholder="Transaction ID" value={id} onChange={e => setId(e.target.value)} />
      </div>
      <div className="form-row">
        <button className="btn-sm" onClick={() => act(() => createTxn(id))} disabled={loading || !id}>Create</button>
        <button className="btn-sm" onClick={() => act(() => viewTxn(id))} disabled={loading || !id}>View</button>
        <button className="btn-sm" onClick={() => act(() => signTxn(id))} disabled={loading || !id}>Sign</button>
        <button className="btn-sm" onClick={() => act(() => postTxn(id))} disabled={loading || !id}>Post</button>
        <button className="btn-sm btn-danger" onClick={() => act(() => deleteTxn(id))} disabled={loading || !id}>Delete</button>
      </div>
      <div className="sub-section">
        <h3>Auto-build</h3>
        <div className="form-row">
          <input placeholder="To address" value={autoForm.address} onChange={e => setAf('address', e.target.value)} />
          <input placeholder="Amount" value={autoForm.amount} onChange={e => setAf('amount', e.target.value)} />
          <input placeholder="Token ID (opt)" value={autoForm.tokenid} onChange={e => setAf('tokenid', e.target.value)} />
          <button className="btn-sm" onClick={() => act(() => autoTxn(id, autoForm))} disabled={loading || !id}>Auto</button>
        </div>
      </div>
      {error && <p className="err-text">{error}</p>}
      {result && <JsonView data={result} />}
    </div>
  );
}

function TxPowCard() {
  const [id, setId] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  async function lookup() {
    if (!id) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try { setResult(await getTxPow(id)); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }
  return (
    <div className="panel">
      <h2>TxPoW Lookup</h2>
      <div className="form-row">
        <input placeholder="TxPoW ID" value={id} onChange={e => setId(e.target.value)} />
        <button className="btn-sm" onClick={lookup} disabled={loading || !id}>{loading ? '…' : 'Lookup'}</button>
      </div>
      {error && <p className="err-text">{error}</p>}
      {result && <JsonView data={result} />}
    </div>
  );
}
