import { useEffect, useState } from 'react';
import { getScripts, createScript, runScript } from '../api/minimaApi';
import JsonView from './JsonView';

export default function ScriptPanel() {
  return (
    <div className="panel-grid">
      <ScriptListCard />
      <AddScriptCard />
      <RunScriptCard />
    </div>
  );
}

function ScriptListCard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  useEffect(() => { load(); }, []);
  async function load() {
    setLoading(true);
    setError(null);
    try { setData(await getScripts()); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }
  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Scripts</h2>
        <button className="btn-sm" onClick={load} disabled={loading}>{loading ? '…' : 'Refresh'}</button>
      </div>
      {error && <p className="err-text">{error}</p>}
      {data && <JsonView data={data} />}
    </div>
  );
}

function AddScriptCard() {
  const [script, setScript] = useState('');
  const [trackAll, setTrackAll] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try { setResult(await createScript({ script, trackAll })); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }
  return (
    <div className="panel">
      <h2>Add Script</h2>
      <form className="stacked-form" onSubmit={submit}>
        <label>KISSVM Script<textarea required rows={4} value={script} onChange={e => setScript(e.target.value)} /></label>
        <label className="checkbox-label">
          <input type="checkbox" checked={trackAll} onChange={e => setTrackAll(e.target.checked)} />
          Track all coins
        </label>
        <button className="btn" type="submit" disabled={loading}>{loading ? '…' : 'Add'}</button>
      </form>
      {error && <p className="err-text">{error}</p>}
      {result && <JsonView data={result} />}
    </div>
  );
}

function RunScriptCard() {
  const [form, setForm] = useState({ script: '', data: '', prevstate: '', globals: '', state: '' });
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
      const body = { script: form.script };
      if (form.data) body.data = form.data;
      if (form.prevstate) body.prevstate = form.prevstate;
      if (form.globals) body.globals = form.globals;
      if (form.state) body.state = form.state;
      setResult(await runScript(body));
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }
  return (
    <div className="panel">
      <h2>Run Script</h2>
      <form className="stacked-form" onSubmit={submit}>
        <label>Script<textarea required rows={4} value={form.script} onChange={e => set('script', e.target.value)} /></label>
        <label>Data<input placeholder="optional" value={form.data} onChange={e => set('data', e.target.value)} /></label>
        <label>Prevstate<input placeholder="optional" value={form.prevstate} onChange={e => set('prevstate', e.target.value)} /></label>
        <label>Globals<input placeholder="optional" value={form.globals} onChange={e => set('globals', e.target.value)} /></label>
        <label>State<input placeholder="optional" value={form.state} onChange={e => set('state', e.target.value)} /></label>
        <button className="btn" type="submit" disabled={loading}>{loading ? '…' : 'Run'}</button>
      </form>
      {error && <p className="err-text">{error}</p>}
      {result && <JsonView data={result} />}
    </div>
  );
}
