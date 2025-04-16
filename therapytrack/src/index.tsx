import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { validateConfig } from './lib/config';
import reportWebVitals from './reportWebVitals';
import { verifyEncryptionSetup } from './utils/encryption';

// Clear storage if application version doesn't match
const APP_VERSION = '1.0.1'; // Increment version to force a storage clear
const APP_VERSION_KEY = 'theriq_app_version';

// Check and clear storage if version mismatch
const handleAppVersionChange = (): void => {
  try {
    const storedVersion = localStorage.getItem(APP_VERSION_KEY);
    
    // If version changed or doesn't exist, clear all browser storage
    if (storedVersion !== APP_VERSION) {
      console.log('App version changed, clearing storage');
      
      // Clear localStorage excluding the version key itself
      Object.keys(localStorage).forEach(key => {
        if (key !== APP_VERSION_KEY) {
          localStorage.removeItem(key);
        }
      });
      
      sessionStorage.clear();
      
      // Set the new version
      localStorage.setItem(APP_VERSION_KEY, APP_VERSION);
    }
  } catch (e) {
    console.warn('Version check failed:', e);
  }
};

// Initialize app
const initializeApp = (): void => {
  // Check app version and clear storage if needed
  handleAppVersionChange();
  
  // Validate application configuration
  validateConfig();
  
  // Verify encryption setup
  verifyEncryptionSetup();
  
  // Add event listeners for handling authentication issues
  window.addEventListener('supabase.auth.error', (event) => {
    console.error('Auth error event:', event);
    // Consider redirecting to login page or showing error notification
  });
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