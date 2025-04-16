#!/bin/bash

# Stop any running React processes
echo "Stopping any running React development servers..."
pkill -f "react-scripts start" || true

# Clear React cache
echo "Clearing React cache..."
rm -rf node_modules/.cache

# Clear browser cache for localhost:3000
echo "Note: You should manually clear your browser cache for localhost:3000"
echo "In Chrome, you can do this by opening DevTools (F12), going to Application tab,"
echo "then Clear Storage, and clicking 'Clear site data'"

# Start development server with optimized settings
echo "Starting development server with optimized settings..."
export BROWSER=none # Prevent auto-opening browser
export FAST_REFRESH=true
export TSC_COMPILE_ON_ERROR=true
export ESLINT_NO_DEV_ERRORS=true

# Start the development server
npm start 