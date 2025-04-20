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

// Check and clear storage if version mismatch
const handleAppVersionChange = (): void => {
  try {
    const storedVersion = localStorage.getItem(APP_VERSION_KEY);
    
    // Only clear if version is set AND different (not on first run)
    if (storedVersion && storedVersion !== APP_VERSION) {
      console.log(`[APP] Version changed from ${storedVersion} to ${APP_VERSION}, clearing storage`);
      
      localStorage.clear();
      sessionStorage.clear();
      
      // Set the new version
      localStorage.setItem(APP_VERSION_KEY, APP_VERSION);
    } 
    // If no version stored yet, just set it without clearing
    else if (!storedVersion) {
      console.log('[APP] First run, setting app version without clearing storage');
      localStorage.setItem(APP_VERSION_KEY, APP_VERSION);
    }
    
    // Debug localStorage contents (development only)
    if (process.env.NODE_ENV === 'development') {
      console.log('[APP] LocalStorage check:');
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const value = localStorage.getItem(key);
          console.log(`[APP] - ${key}: ${value ? (value.length > 50 ? value.substring(0, 50) + '...' : value) : 'null'}`);
        }
      }
    }
  } catch (e) {
    console.warn('[APP] Version check failed:', e);
  }
};

// Initialize app
const initializeApp = (): void => {
  // Check version for storage clearing
  handleAppVersionChange();
  
  // Validate application configuration
  validateConfig();
  
  // Verify encryption setup
  verifyEncryptionSetup();
  
  console.log('[APP] App initialized successfully');
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