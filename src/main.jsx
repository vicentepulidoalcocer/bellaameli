/**
 * main.jsx
 * --------
 * Punto de entrada de la aplicación: monta <App /> dentro de #root
 * con StrictMode activado para detectar problemas en desarrollo.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
