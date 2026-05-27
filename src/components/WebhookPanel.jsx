import { useEffect, useState } from 'react';
import { getWebhooks, addWebhook, removeWebhook } from '../api/minimaApi';
import JsonView from './JsonView';

export default function WebhookPanel() {
  const [webhooks, setWebhooks] = useState(null);
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try { setWebhooks(await getWebhooks()); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  async function add(e) {
    e.preventDefault();
    if (!url) return;
    setLoading(true);
    setError(null);
    try { await addWebhook(url); setUrl(''); await load(); }
    catch (e) { setError(e.message); setLoading(false); }
  }

  async function remove(hookUrl) {
    setLoading(true);
    setError(null);
    try { await removeWebhook(hookUrl); await load(); }
    catch (e) { setError(e.message); setLoading(false); }
  }

  const list = Array.isArray(webhooks?.hooks ?? webhooks) ? (webhooks?.hooks ?? webhooks) : null;

  return (
    <div className="panel-grid">
      <div className="panel" style={{ gridColumn: '1 / -1' }}>
        <div className="panel-header">
          <h2>Webhooks</h2>
          <button className="btn-sm" onClick={load} disabled={loading}>{loading ? '…' : 'Refresh'}</button>
        </div>
        {error && <p className="err-text">{error}</p>}
        {list ? (
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
            {list.length === 0 && <li className="muted">No webhooks registered</li>}
            {list.map((h, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <code style={{ fontSize: 12, color: '#7dd3fc', wordBreak: 'break-all' }}>{typeof h === 'string' ? h : JSON.stringify(h)}</code>
                <button className="btn-sm btn-danger" onClick={() => remove(typeof h === 'string' ? h : h.url)}>Remove</button>
              </li>
            ))}
          </ul>
        ) : webhooks && <JsonView data={webhooks} />}
        <form className="form-row" onSubmit={add}>
          <input placeholder="https://…" value={url} onChange={e => setUrl(e.target.value)} />
          <button className="btn-sm" type="submit" disabled={loading || !url}>Add</button>
        </form>
      </div>
    </div>
  );
}
