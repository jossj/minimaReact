const BASE = '/api/minima';

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

// Node
export const getStatus  = ()    => req('/status');
export const getBlock   = ()    => req('/block');
export const getNetwork = ()    => req('/network');
export const getPeers   = ()    => req('/peers');
export const getMempool = ()    => req('/mempool');

// Wallet
export const getBalance         = ()       => req('/balance');
export const getBalanceForToken = (tid)    => req(`/balance/${tid}`);
export const getAddress         = ()       => req('/address');
export const createAddress      = ()       => req('/address', { method: 'POST' });
export const getCoins           = (p = {}) => req('/coins?' + new URLSearchParams(p));
export const getHistory         = ()       => req('/history');
export const sendFunds          = (body)   => req('/send', { method: 'POST', body: JSON.stringify(body) });

// Tokens
export const getTokens     = ()     => req('/tokens');
export const createToken   = (body) => req('/tokens', { method: 'POST', body: JSON.stringify(body) });
export const validateToken = (tid)  => req(`/tokens/${tid}/validate`);

// Offline txns
export const listTxns  = ()      => req('/txn');
export const createTxn = (id)    => req(`/txn/${id}`, { method: 'POST' });
export const viewTxn   = (id)    => req(`/txn/${id}`);
export const deleteTxn = (id)    => req(`/txn/${id}`, { method: 'DELETE' });
export const autoTxn   = (id, b) => req(`/txn/${id}/auto`, { method: 'POST', body: JSON.stringify(b) });
export const signTxn   = (id)    => req(`/txn/${id}/sign`, { method: 'POST' });
export const postTxn   = (id)    => req(`/txn/${id}/post`, { method: 'POST' });
export const getTxPow  = (id)    => req(`/txpow/${id}`);

// Maxima
export const getMaxima         = ()     => req('/maxima');
export const getMaximaContacts = ()     => req('/maxima/contacts');
export const sendMaxima        = (body) => req('/maxima/send', { method: 'POST', body: JSON.stringify(body) });
export const createMaxima      = ()     => req('/maxima', { method: 'POST' });

// Scripts
export const getScripts   = ()     => req('/scripts');
export const createScript = (body) => req('/scripts', { method: 'POST', body: JSON.stringify(body) });
export const runScript    = (body) => req('/scripts/run', { method: 'POST', body: JSON.stringify(body) });

// Webhooks
export const getWebhooks   = ()    => req('/webhooks');
export const addWebhook    = (url) => req(`/webhooks?url=${encodeURIComponent(url)}`, { method: 'POST' });
export const removeWebhook = (url) => req(`/webhooks?url=${encodeURIComponent(url)}`, { method: 'DELETE' });

// Raw command
export const runRaw = (command) => req('/cmd', { method: 'POST', body: JSON.stringify({ command }) });
