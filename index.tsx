
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AppProvider } from './context/AppContext';
import { isSupabaseConnected } from './supabaseClient';
import SetupError from './components/common/SetupError';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    {isSupabaseConnected ? (
      <AppProvider>
        <App />
      </AppProvider>
    ) : (
      <SetupError />
    )}
  </React.StrictMode>
);
