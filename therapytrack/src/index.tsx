import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { validateConfig } from './lib/config';
import reportWebVitals from './reportWebVitals';
import { verifyEncryptionSetup } from './utils/encryption';

// Clear storage if application version doesn't match
const APP_VERSION = '1.0.0';
const APP_VERSION_KEY = 'theriq_app_version';

// Initialize app
const initializeApp = (): void => {
  // Validate application configuration
  validateConfig();
  
  // Verify encryption setup
  verifyEncryptionSetup();
};

// Run initialization
initializeApp();

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

// Only use StrictMode in production to improve development performance
const disableStrictMode = process.env.REACT_APP_DISABLE_STRICT_MODE === 'true';

root.render(
  disableStrictMode ? (
    <App />
  ) : (
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(); 