import { useEffect, useState } from 'react';
import { getStatus, getBlock, getNetwork, getPeers, getMempool } from '../api/minimaApi';
import JsonView from './JsonView';

function FetchCard({ title, fetcher, autoLoad }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => { if (autoLoad) load(); }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try { setData(await fetcher()); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>{title}</h2>
        <button className="btn-sm" onClick={load} disabled={loading}>
          {loading ? '…' : 'Refresh'}
        </button>
      </div>
      {error && <p className="err-text">{error}</p>}
      {data && <JsonView data={data} />}
    </div>
  );
}

export default function NodePanel() {
  return (
    <div className="panel-grid">
      <FetchCard title="Status" fetcher={getStatus} autoLoad />
      <FetchCard title="Block" fetcher={getBlock} />
      <FetchCard title="Network" fetcher={getNetwork} />
      <FetchCard title="Peers" fetcher={getPeers} />
      <FetchCard title="Mempool" fetcher={getMempool} />
    </div>
  );
}
