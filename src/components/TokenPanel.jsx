import { useEffect, useState } from 'react';
import { getTokens, createToken, validateToken } from '../api/minimaApi';
import JsonView from './JsonView';

export default function TokenPanel() {
  return (
    <div className="panel-grid">
      <TokenListCard />
      <CreateTokenCard />
      <ValidateTokenCard />
    </div>
  );
}

function TokenListCard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  useEffect(() => { load(); }, []);
  async function load() {
    setLoading(true);
    setError(null);
    try { setData(await getTokens()); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }
  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Tokens</h2>
        <button className="btn-sm" onClick={load} disabled={loading}>{loading ? '…' : 'Refresh'}</button>
      </div>
      {error && <p className="err-text">{error}</p>}
      {data && <JsonView data={data} />}
    </div>
  );
}

function CreateTokenCard() {
  const [form, setForm] = useState({ name: '', amount: '', decimals: '', description: '', script: '', burn: '' });
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
      const body = { name: form.name, amount: form.amount };
      if (form.decimals) body.decimals = form.decimals;
      if (form.description) body.description = form.description;
      if (form.script) body.script = form.script;
      if (form.burn) body.burn = form.burn;
      setResult(await createToken(body));
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }
  return (
    <div className="panel">
      <h2>Create Token</h2>
      <form className="stacked-form" onSubmit={submit}>
        <label>Name<input required value={form.name} onChange={e => set('name', e.target.value)} /></label>
        <label>Amount<input required value={form.amount} onChange={e => set('amount', e.target.value)} /></label>
        <label>Decimals<input placeholder="optional" value={form.decimals} onChange={e => set('decimals', e.target.value)} /></label>
        <label>Description<input placeholder="optional" value={form.description} onChange={e => set('description', e.target.value)} /></label>
        <label>Script<input placeholder="optional KISSVM" value={form.script} onChange={e => set('script', e.target.value)} /></label>
        <label>Burn<input placeholder="optional" value={form.burn} onChange={e => set('burn', e.target.value)} /></label>
        <button className="btn" type="submit" disabled={loading}>{loading ? '…' : 'Create'}</button>
      </form>
      {error && <p className="err-text">{error}</p>}
      {result && <JsonView data={result} />}
    </div>
  );
}

function ValidateTokenCard() {
  const [tid, setTid] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  async function validate() {
    if (!tid) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try { setResult(await validateToken(tid)); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }
  return (
    <div className="panel">
      <h2>Validate Token</h2>
      <div className="form-row">
        <input placeholder="Token ID" value={tid} onChange={e => setTid(e.target.value)} />
        <button className="btn-sm" onClick={validate} disabled={loading || !tid}>{loading ? '…' : 'Validate'}</button>
      </div>
      {error && <p className="err-text">{error}</p>}
      {result && <JsonView data={result} />}
    </div>
  );
}
