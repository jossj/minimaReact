import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ApiProvider } from './ApiContext.jsx';
import App from './App.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ApiProvider>
      <App />
    </ApiProvider>
  </StrictMode>
);
