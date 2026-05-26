import { createContext, useContext, useEffect, useState } from "react";

const MdsContext = createContext(null);

export function MdsProvider({ children }) {
  const [status, setStatus] = useState("connecting"); // connecting | ready | error
  const [events, setEvents] = useState([]);

  useEffect(() => {
    if (!window.MDS) {
      setStatus("error");
      return;
    }

    window.MDS.init((msg) => {
      if (msg.event === "inited") {
        setStatus("ready");
      }
      setEvents((prev) => [msg, ...prev].slice(0, 50));
    });
  }, []);

  const cmd = (command) =>
    new Promise((resolve) =>
      window.MDS.cmd(command, resolve)
    );

  return (
    <MdsContext.Provider value={{ status, events, cmd }}>
      {children}
    </MdsContext.Provider>
  );
}

export function useMds() {
  return useContext(MdsContext);
}
