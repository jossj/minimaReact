import { useState } from 'react';
import { runRaw } from '../api/minimaApi';
import JsonView from './JsonView';

export default function RawPanel() {
  const [cmd, setCmd] = useState('status');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function run(e) {
    e?.preventDefault();
    if (!cmd.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try { setResult(await runRaw(cmd.trim())); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  return (
    <div className="panel-grid">
      <div className="panel" style={{ gridColumn: '1 / -1' }}>
        <h2>Raw Command</h2>
        <p className="muted" style={{ marginBottom: 12 }}>Execute any Minima command via POST /api/minima/cmd</p>
        <form className="form-row" onSubmit={run}>
          <input
            value={cmd}
            onChange={e => setCmd(e.target.value)}
            placeholder="e.g. status"
            spellCheck={false}
            style={{ fontFamily: 'monospace' }}
          />
          <button className="btn" type="submit" disabled={loading}>{loading ? 'Running…' : 'Run'}</button>
        </form>
        {error && <p className="err-text" style={{ marginTop: 8 }}>{error}</p>}
        {result && <JsonView data={result} />}
      </div>
    </div>
  );
}
