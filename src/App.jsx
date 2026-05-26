import { useState } from "react";
import { useMds } from "./MdsContext";
import "./App.css";

function StatusBadge({ status }) {
  const colours = {
    connecting: "#f59e0b",
    ready: "#10b981",
    error: "#ef4444",
  };
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 10px",
        borderRadius: 999,
        background: colours[status] ?? "#6b7280",
        color: "#fff",
        fontSize: 13,
        fontWeight: 600,
      }}
    >
      {status}
    </span>
  );
}

function CommandPanel() {
  const { cmd } = useMds();
  const [input, setInput] = useState("status");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true);
    setResult(null);
    try {
      const res = await cmd(input);
      setResult(res);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="panel">
      <h2>Run Command</h2>
      <div className="cmd-row">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && run()}
          placeholder="e.g. status"
          spellCheck={false}
        />
        <button onClick={run} disabled={loading}>
          {loading ? "Running…" : "Run"}
        </button>
      </div>
      {result && (
        <pre className="result">{JSON.stringify(result, null, 2)}</pre>
      )}
    </section>
  );
}

function EventLog() {
  const { events } = useMds();

  return (
    <section className="panel">
      <h2>
        Event Log <small>({events.length})</small>
      </h2>
      {events.length === 0 && <p className="muted">No events yet…</p>}
      <ul className="event-list">
        {events.map((e, i) => (
          <li key={i}>
            <strong>{e.event}</strong>
            <pre>{JSON.stringify(e, null, 2)}</pre>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function App() {
  const { status } = useMds();

  return (
    <div className="app">
      <header>
        <h1>MiniDAPP</h1>
        <StatusBadge status={status} />
      </header>

      {status === "error" && (
        <p className="error-msg">
          MDS library not found. Make sure you are running inside Minima MDS or
          set <code>MDS.DEBUG_HOST</code> / <code>MDS.DEBUG_PORT</code> before
          calling <code>MDS.init()</code>.
        </p>
      )}

      {status !== "error" && (
        <>
          <CommandPanel />
          <EventLog />
        </>
      )}
    </div>
  );
}
