import React from 'react';
import ReactDOM from 'react-dom/client';
import LiveTopCategories from './LiveTopCategories';

const container = document.getElementById('app-container');
if (!container) {
  throw new Error('Could not find app container element');
}

const root = ReactDOM.createRoot(container);
root.render(
  <React.StrictMode>
    <LiveTopCategories />
  </React.StrictMode>
);
