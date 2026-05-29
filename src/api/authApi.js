const BASE = '/api/auth';

async function req(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({ error: res.statusText }));
  if (!res.ok) throw new Error(data.error ?? res.statusText);
  return data;
}

export const register = (username, password) => req('/register', { username, password });
export const login    = (username, password) => req('/login',    { username, password });
