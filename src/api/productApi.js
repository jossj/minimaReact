const BASE = '/api/products';

async function req(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error ?? res.statusText);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const getProducts   = ()          => req('');
export const createProduct = (body)      => req('', { method: 'POST', body: JSON.stringify(body) });
export const updateProduct = (id, body)  => req(`/${id}`, { method: 'PUT', body: JSON.stringify(body) });
export const deleteProduct = (id)        => req(`/${id}`, { method: 'DELETE' });
