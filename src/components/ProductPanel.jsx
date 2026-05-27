import { useEffect, useState } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../api/productApi';

const EMPTY = { name: '', description: '', price: '', stock: '' };

export default function ProductPanel() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try { setProducts(await getProducts()); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  function setField(k, v) { setForm(f => ({ ...f, [k]: v })); }

  function startEdit(p) {
    setEditing(p.id);
    setForm({ name: p.name, description: p.description ?? '', price: String(p.price), stock: String(p.stock) });
  }

  function cancelEdit() { setEditing(null); setForm(EMPTY); }

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const body = { name: form.name, description: form.description, price: Number(form.price), stock: Number(form.stock) };
      if (editing) { await updateProduct(editing, body); }
      else { await createProduct(body); }
      cancelEdit();
      await load();
    } catch (e) { setError(e.message); setLoading(false); }
  }

  async function remove(id) {
    setLoading(true);
    setError(null);
    try { await deleteProduct(id); await load(); }
    catch (e) { setError(e.message); setLoading(false); }
  }

  return (
    <div className="panel-grid">
      <div className="panel" style={{ gridColumn: '1 / -1' }}>
        <div className="panel-header">
          <h2>Products</h2>
          <button className="btn-sm" onClick={load} disabled={loading}>{loading ? '…' : 'Refresh'}</button>
        </div>
        {error && <p className="err-text">{error}</p>}
        <table className="data-table">
          <thead>
            <tr><th>ID</th><th>Name</th><th>Description</th><th>Price</th><th>Stock</th><th></th></tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.name}</td>
                <td>{p.description}</td>
                <td>{p.price}</td>
                <td>{p.stock}</td>
                <td style={{ whiteSpace: 'nowrap' }}>
                  <button className="btn-sm" onClick={() => startEdit(p)}>Edit</button>{' '}
                  <button className="btn-sm btn-danger" onClick={() => remove(p.id)}>Delete</button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr><td colSpan={6} className="muted" style={{ textAlign: 'center', padding: 16 }}>No products</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="panel">
        <h2>{editing ? 'Edit Product' : 'Add Product'}</h2>
        <form className="stacked-form" onSubmit={submit}>
          <label>Name<input required value={form.name} onChange={e => setField('name', e.target.value)} /></label>
          <label>Description<input value={form.description} onChange={e => setField('description', e.target.value)} /></label>
          <label>Price<input required type="number" step="0.01" value={form.price} onChange={e => setField('price', e.target.value)} /></label>
          <label>Stock<input required type="number" value={form.stock} onChange={e => setField('stock', e.target.value)} /></label>
          <div className="form-row">
            <button className="btn" type="submit" disabled={loading}>{loading ? '…' : editing ? 'Save' : 'Add'}</button>
            {editing && <button className="btn-sm" type="button" onClick={cancelEdit}>Cancel</button>}
          </div>
        </form>
      </div>
    </div>
  );
}
