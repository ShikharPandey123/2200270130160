import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { CssBaseline } from '@mui/material'; // Material UI's CSS baseline for consistency

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <CssBaseline /> {/* Apply global CSS resets for Material UI */}
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);