import { createContext, useContext, useEffect, useState } from 'react';
import { getStatus } from './api/minimaApi';

const ApiContext = createContext(null);

export function ApiProvider({ children }) {
  const [nodeReady, setNodeReady] = useState(false);
  const [backendReachable, setBackendReachable] = useState(false);

  useEffect(() => {
    async function probe() {
      try {
        await getStatus();
        setBackendReachable(true);
        setNodeReady(true);
      } catch {
        setBackendReachable(false);
        setNodeReady(false);
      }
    }
    probe();
    const id = setInterval(probe, 15_000);
    return () => clearInterval(id);
  }, []);

  return (
    <ApiContext.Provider value={{ nodeReady, backendReachable }}>
      {children}
    </ApiContext.Provider>
  );
}

export const useApi = () => useContext(ApiContext);
