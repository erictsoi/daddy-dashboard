import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './src/lib/AuthContext';

console.log('Starting app...');

const rootElement = document.getElementById('root');
if (!rootElement) {
  document.body.innerHTML = '<h1>Error: root element not found</h1>';
  throw new Error("Could not find root element to mount to");
}

console.log('Creating root...');
const root = ReactDOM.createRoot(rootElement);
console.log('Rendering app...');
root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
console.log('App rendered');
