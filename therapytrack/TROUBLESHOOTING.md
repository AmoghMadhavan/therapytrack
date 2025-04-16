# Theriq Troubleshooting Guide

This guide will help you diagnose and fix common issues with the Theriq application.

## Page Won't Load Issues

### Blank Page / White Screen

If you're seeing a blank white screen or the application isn't loading at all:

1. **Check if the development server is running**
   ```bash
   # Start the development server
   npm start
   ```

2. **Open the browser's developer console** (F12 or right-click > Inspect)
   - Look for red error messages that could indicate the issue

3. **Check our static debug page** to verify the web server is functioning:
   - Navigate to [http://localhost:3000/debug.html](http://localhost:3000/debug.html)
   - If this page loads but the React app doesn't, it's likely a JavaScript error

4. **Try a hard refresh**:
   - Windows/Linux: Ctrl+F5
   - Mac: Cmd+Shift+R

### Known Issues and Solutions

#### 1. "Failed to load dashboard data"

This error typically appears when the database tables don't exist.

**Quick Solution**: Visit the [/test-db](http://localhost:3000/test-db) route after logging in to diagnose database issues.

**Root Cause**: The dashboard is trying to query tables that don't exist in Supabase.

**Solution**:
1. Go to your Supabase dashboard: [https://app.supabase.io](https://app.supabase.io)
2. Navigate to SQL Editor
3. Copy and execute the SQL from `src/lib/supabase/setupFunctions.sql`
4. Run the command: `SELECT create_all_tables();`

Or run our setup utility:
```bash
# Install dependencies if needed
npm install dotenv @supabase/supabase-js

# Run the setup script
node scripts/setup-database.js
```

#### 2. Path or Import Errors

If you see errors related to missing files or imports:

**Solution**: 
1. Check that you have all required files in the correct locations
2. Ensure the component is properly exported and imported
3. Check for case-sensitivity issues in imports

```bash
# Check for the existence of key files
find src -name "TestDatabaseConnection.tsx"
find src -name "App.tsx"
```

#### 3. Environment Variables Missing

If Supabase connection fails due to missing environment variables:

**Solution**:
Create or update your `.env` file with the correct Supabase credentials:
```
REACT_APP_SUPABASE_URL=your-supabase-url
REACT_APP_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Then restart the development server:
```bash
npm start
```

## Authentication Issues

### Can't Log In

If you're unable to log in:

1. Ensure you have a valid account created in Supabase
2. Check browser console for specific authentication errors
3. Verify your Supabase project has Email authentication enabled
4. Try resetting your password

### Registration Fails

If new user registration fails:

1. Ensure your email format is valid
2. Check if there are domain restrictions in your Supabase configuration
3. Verify that your Supabase project has Email sign-ups enabled
4. Check if email confirmation is required

## Database Issues

If you see errors related to the database:

1. **Run the database test**: Navigate to [/test-db](http://localhost:3000/test-db) to see detailed diagnostics
2. **Check table existence**: Verify that the required tables exist in Supabase
3. **Set up tables**: Run the database setup script:
   ```bash
   node scripts/setup-database.js
   ```
4. **Check permissions**: Ensure your Supabase policies allow the required operations

## Getting More Help

If you're still experiencing issues:

1. Check the error details in your browser's developer console
2. Take a screenshot of any error messages
3. File an issue on GitHub with detailed reproduction steps and error screenshots
4. Include information about your environment: 
   - Browser and version
   - Operating system
   - Node.js version (`node -v`)
   - npm version (`npm -v`) 