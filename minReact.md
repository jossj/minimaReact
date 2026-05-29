# minimaReact — Session Context

Complete reference for the changes made to integrate `minimaReact` with the `minimaBackend` REST API.

---

## 1. Overview

**Repo:** `jossj/minimaReact` · **Branch:** `claude/dreamy-wozniak-YZ0qm`  
**Stack:** React 19 · Vite 8 · plain `fetch` (no extra HTTP library)

The application was originally a MiniDAPP shell — it relied on `window.MDS`, the Minima client-side JavaScript library that only works when the app runs inside the Minima MDS (MiniDAPP System) sandbox.

This session replaced that approach entirely with direct REST calls to the `minimaBackend` Spring Boot service, turning the app into a standalone dashboard that works in any browser.

---

## 2. What Changed and Why

### 2.1 `window.MDS` → REST API

| Before | After |
|--------|-------|
| `window.MDS.init(callback)` to connect | `fetch('/api/minima/status')` polled every 15 s |
| `window.MDS.cmd(command, callback)` for every operation | Typed `fetch` wrappers in `src/api/minimaApi.js` |
| Only worked inside Minima MDS sandbox | Works in any browser, requires backend on port 8080 |
| Single command panel + event log | Nine-tab dashboard covering all backend endpoints |

### 2.2 `MdsContext` → `ApiContext`

The old `MdsContext.jsx` wrapped `window.MDS`. The new `ApiContext.jsx` probes the backend every 15 seconds and exposes two booleans: `backendReachable` and `nodeReady`. These drive the status badges in the header and the warning banner when the backend is down.

### 2.3 Vite dev proxy

`vite.config.js` gained a `server.proxy` block so all `/api` and `/minima` requests during `npm run dev` are forwarded to `http://localhost:8080`, avoiding CORS issues in development.

---

## 3. File Tree — New and Modified Files

```
minimaReact/
├── vite.config.js                  MODIFIED — added dev proxy
├── src/
│   ├── index.css                   MODIFIED — stripped to minimal reset
│   ├── main.jsx                    MODIFIED — ApiProvider replaces MdsProvider
│   ├── App.jsx                     MODIFIED — tabbed shell, status badges
│   ├── App.css                     MODIFIED — full rewrite for new layout
│   ├── ApiContext.jsx              NEW — backend/node readiness context
│   ├── api/
│   │   ├── minimaApi.js            NEW — all /api/minima/** fetch wrappers
│   │   └── productApi.js           NEW — /api/products CRUD wrappers
│   └── components/
│       ├── JsonView.jsx            NEW — shared formatted JSON <pre>
│       ├── NodePanel.jsx           NEW — Status, Block, Network, Peers, Mempool
│       ├── WalletPanel.jsx         NEW — Balance, Address, Coins, History, Send
│       ├── TokenPanel.jsx          NEW — Token list, Create, Validate
│       ├── TransactionPanel.jsx    NEW — Offline txns + TxPoW lookup
│       ├── MaximaPanel.jsx         NEW — Status, Contacts, Send, New identity
│       ├── ScriptPanel.jsx         NEW — Script list, Add, Run
│       ├── WebhookPanel.jsx        NEW — List, Add, Remove webhooks
│       ├── ProductPanel.jsx        NEW — Products CRUD table
│       └── RawPanel.jsx            NEW — Free-form /api/minima/cmd runner
```

---

## 4. API Client Layer

### 4.1 `src/api/minimaApi.js`

All functions call `fetch('/api/minima/<path>')` and throw an `Error` with the backend's `error` field on non-2xx responses.

| Export | Method | Path | Backend endpoint |
|--------|--------|------|------------------|
| `getStatus` | GET | `/status` | Node status, block height, uptime |
| `getBlock` | GET | `/block` | Chain tip block |
| `getNetwork` | GET | `/network` | Connection summary |
| `getPeers` | GET | `/peers` | Connected peers |
| `getMempool` | GET | `/mempool` | Unconfirmed transactions |
| `getBalance` | GET | `/balance` | All wallet balances |
| `getBalanceForToken(tid)` | GET | `/balance/:tid` | Balance for one token |
| `getAddress` | GET | `/address` | Default wallet address |
| `createAddress` | POST | `/address` | Generate fresh address |
| `getCoins(params)` | GET | `/coins?...` | UTXOs, optional address/tokenid filter |
| `getHistory` | GET | `/history` | Transaction history |
| `sendFunds(body)` | POST | `/send` | Send Minima or tokens |
| `getTokens` | GET | `/tokens` | All known tokens |
| `createToken(body)` | POST | `/tokens` | Create custom token |
| `validateToken(tid)` | GET | `/tokens/:tid/validate` | Verify token on-chain |
| `listTxns` | GET | `/txn` | List offline transactions |
| `createTxn(id)` | POST | `/txn/:id` | Create empty offline txn |
| `viewTxn(id)` | GET | `/txn/:id` | View offline txn |
| `deleteTxn(id)` | DELETE | `/txn/:id` | Delete offline txn |
| `autoTxn(id, body)` | POST | `/txn/:id/auto` | Auto-build txn |
| `signTxn(id)` | POST | `/txn/:id/sign` | Sign offline txn |
| `postTxn(id)` | POST | `/txn/:id/post` | Post signed txn |
| `getTxPow(id)` | GET | `/txpow/:id` | TxPoW lookup by ID |
| `getMaxima` | GET | `/maxima` | Maxima status + address |
| `getMaximaContacts` | GET | `/maxima/contacts` | Maxima contact list |
| `sendMaxima(body)` | POST | `/maxima/send` | Send Maxima message |
| `createMaxima` | POST | `/maxima` | New Maxima identity |
| `getScripts` | GET | `/scripts` | Tracked KISSVM scripts |
| `createScript(body)` | POST | `/scripts` | Add KISSVM script |
| `runScript(body)` | POST | `/scripts/run` | Run script off-chain |
| `getWebhooks` | GET | `/webhooks` | Registered webhooks |
| `addWebhook(url)` | POST | `/webhooks?url=` | Register webhook URL |
| `removeWebhook(url)` | DELETE | `/webhooks?url=` | Remove webhook URL |
| `runRaw(command)` | POST | `/cmd` | Execute any raw command |

### 4.2 `src/api/productApi.js`

| Export | Method | Path |
|--------|--------|------|
| `getProducts` | GET | `/api/products` |
| `createProduct(body)` | POST | `/api/products` |
| `updateProduct(id, body)` | PUT | `/api/products/:id` |
| `deleteProduct(id)` | DELETE | `/api/products/:id` |

Body shape for create/update: `{ name, description, price, stock }`.

---

## 5. Component Reference

### 5.1 `ApiContext.jsx`

Polls `GET /api/minima/status` every 15 seconds. If the request succeeds, both `backendReachable` and `nodeReady` are `true`; if it throws (network error or non-2xx), both are `false`.

```jsx
const { backendReachable, nodeReady } = useApi();
```

The context intentionally treats a 422 from `/status` (node not yet ready) the same as a network failure — a future improvement could distinguish the two.

### 5.2 `App.jsx`

Tabbed shell with nine tabs. Renders one panel component at a time based on the active tab; inactive panels unmount and lose their local state (data re-fetches on next visit). The header shows two status badges driven by `ApiContext`.

### 5.3 Panel components

Each panel is self-contained: it owns its own `useState` + `useEffect` hooks and calls the API client directly. No shared data store.

| Panel | Auto-loads on mount | User actions |
|-------|--------------------|--------------|
| `NodePanel` | Status | Refresh any card individually |
| `WalletPanel` | Balance, Address | New Address; Fetch coins with optional filters; Load history; Send form |
| `TokenPanel` | Token list | Create token; Validate by ID |
| `TransactionPanel` | — | List txns; Create/View/Sign/Post/Delete by ID; Auto-build; TxPoW lookup |
| `MaximaPanel` | Maxima status | Refresh; Load contacts; Send message; New identity |
| `ScriptPanel` | Script list | Add KISSVM script; Run script with optional state params |
| `WebhookPanel` | Webhook list | Add URL; Remove individual webhooks |
| `ProductPanel` | Product list | Add product; Inline edit; Delete |
| `RawPanel` | — | Free-form command input, submit to `/api/minima/cmd` |

### 5.4 `JsonView.jsx`

A simple `<pre className="json-view">` wrapper used by every panel to display raw API responses. Formatted with `JSON.stringify(data, null, 2)`.

---

## 6. Styling

`src/App.css` is a full rewrite. `src/index.css` was reduced to a two-line reset (`box-sizing` + `body { margin: 0 }`) to avoid conflicts.

Key CSS classes:

| Class | Purpose |
|-------|---------|
| `.app` | Max-width 1100 px container, centred |
| `.app-header` | Flex row: title left, status badges right |
| `.status-badge` / `.ok` / `.err` | Pill with coloured dot (green/red) |
| `.banner` | Red warning bar shown when backend unreachable |
| `.tab-nav` / `.tab-btn` / `.active` | Horizontal tab strip with underline indicator |
| `.panel-grid` | `auto-fill` CSS grid, min 460 px columns |
| `.panel` | Dark card (`#1e293b` background) |
| `.panel-header` | Flex row: title left, action button right |
| `.btn` | Primary indigo action button |
| `.btn-sm` | Secondary small button |
| `.btn-danger` | Red destructive button |
| `.stacked-form` / `label` | Column-flex form with labelled inputs |
| `.form-row` | Inline row of inputs + button |
| `.data-table` | Full-width table with dark header row |
| `.json-view` | Scrollable monospace pre, max-height 320 px |
| `.err-text` | Inline error message (red) |
| `.muted` | De-emphasised text (slate) |

---

## 7. Running Locally

```bash
# Terminal 1 — backend (port 8080)
cd minimaBackend
mvn spring-boot:run

# Terminal 2 — frontend (port 5173)
cd minimaReact
npm install
npm run dev
# Open http://localhost:5173
```

The Vite dev proxy forwards all `/api/*` and `/minima/*` requests to `http://localhost:8080`, so no CORS configuration is needed during development.

For production, either:
- Serve the built `dist/` folder from the Spring Boot app (configure a static resource handler), or
- Deploy separately and add a CORS `@CrossOrigin` annotation (or `WebMvcConfigurer`) to the Spring Boot controllers.

---

## 8. Files Left Unchanged

| File | Reason |
|------|--------|
| `src/MdsContext.jsx` | Left in place but no longer imported anywhere |
| `index.html` | No changes needed |
| `package.json` / `package-lock.json` | No new runtime dependencies added |
| `eslint.config.js` | No changes needed |
| `public/` | No changes needed |

---

## 9. Known Limitations and Future Work

| # | Issue | Notes |
|---|-------|-------|
| 1 | No real-time events | The backend receives Minima events at `POST /minima/events` but doesn't re-broadcast them. The frontend has no WebSocket or SSE connection. A future improvement would add an SSE endpoint to the backend and an `EventLog` panel to the frontend. |
| 2 | No authentication | The backend has no auth layer. Both frontend and backend should be behind a reverse proxy with auth before any public deployment. |
| 3 | Panel state lost on tab switch | Each panel unmounts when its tab is inactive. Data re-fetches on every visit. A global state store (Zustand, React Query) would fix this if needed. |
| 4 | `ApiContext` conflates backend and node status | A 422 from `/status` (node starting) is treated the same as a network failure. A future improvement: distinguish "backend reachable but node not ready" from "backend unreachable". |
| 5 | `MdsContext.jsx` is dead code | The file was left in the repo but is no longer used. It can be deleted. |
| 6 | Production CORS | No `@CrossOrigin` or `WebMvcConfigurer` was added to the backend. The Vite proxy handles this in development only. |
