import { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

const USERS_KEY = 'minima_users';
const SESSION_KEY = 'minima_session';

function loadUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY)) ?? {}; }
  catch { return {}; }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY)) ?? null; }
    catch { return null; }
  });

  const register = useCallback((username, password) => {
    if (!username.trim()) throw new Error('Username is required');
    if (password.length < 4) throw new Error('Password must be at least 4 characters');
    const users = loadUsers();
    if (users[username]) throw new Error('Username already taken');
    users[username] = { password };
    saveUsers(users);
    const session = { username };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setUser(session);
    return session;
  }, []);

  const login = useCallback((username, password) => {
    const users = loadUsers();
    if (!users[username]) throw new Error('User not found');
    if (users[username].password !== password) throw new Error('Incorrect password');
    const session = { username };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setUser(session);
    return session;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
