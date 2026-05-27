import { useEffect, useState } from 'react';
import { getMaxima, getMaximaContacts, sendMaxima, createMaxima } from '../api/minimaApi';
import JsonView from './JsonView';

export default function MaximaPanel() {
  return (
    <div className="panel-grid">
      <MaximaStatusCard />
      <MaximaContactsCard />
      <MaximaSendCard />
    </div>
  );
}

function MaximaStatusCard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  useEffect(() => { load(); }, []);
  async function load() {
    setLoading(true);
    setError(null);
    try { setData(await getMaxima()); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }
  async function createNew() {
    setLoading(true);
    setError(null);
    try { setData(await createMaxima()); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }
  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Maxima Status</h2>
        <button className="btn-sm" onClick={load} disabled={loading}>{loading ? '…' : 'Refresh'}</button>
      </div>
      {error && <p className="err-text">{error}</p>}
      {data && <JsonView data={data} />}
      <button className="btn" onClick={createNew} disabled={loading} style={{ marginTop: 12 }}>New Identity</button>
    </div>
  );
}

function MaximaContactsCard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  async function load() {
    setLoading(true);
    setError(null);
    try { setData(await getMaximaContacts()); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }
  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Contacts</h2>
        <button className="btn-sm" onClick={load} disabled={loading}>{loading ? '…' : 'Load'}</button>
      </div>
      {error && <p className="err-text">{error}</p>}
      {data && <JsonView data={data} />}
    </div>
  );
}

function MaximaSendCard() {
  const [form, setForm] = useState({ to: '', application: '', data: '' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }
  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try { setResult(await sendMaxima(form)); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }
  return (
    <div className="panel">
      <h2>Send Maxima Message</h2>
      <form className="stacked-form" onSubmit={submit}>
        <label>To (MxMAX… address)<input required value={form.to} onChange={e => set('to', e.target.value)} /></label>
        <label>Application<input required value={form.application} onChange={e => set('application', e.target.value)} /></label>
        <label>Data<input required value={form.data} onChange={e => set('data', e.target.value)} /></label>
        <button className="btn" type="submit" disabled={loading}>{loading ? '…' : 'Send'}</button>
      </form>
      {error && <p className="err-text">{error}</p>}
      {result && <JsonView data={result} />}
    </div>
  );
}
