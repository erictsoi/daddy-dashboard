import { logger } from './lib/logger';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { AuthProvider } from './lib/AuthContext';

logger.log('Starting app...');

const rootElement = document.getElementById('root');
if (!rootElement) {
  document.body.innerHTML = '<h1>Error: root element not found</h1>';
  throw new Error("Could not find root element to mount to");
}

logger.log('Creating root...');
const root = ReactDOM.createRoot(rootElement);
logger.log('Rendering app...');
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
logger.log('App rendered');
