# Simple HIPAA Compliance Check

This document provides a streamlined approach to check the basic HIPAA compliance of your database configuration.

## What This Checks

This simple check verifies two essential aspects of HIPAA compliance:

1. The existence of necessary tables for HIPAA compliance:
   - `user_preferences` - For storing AI opt-out preferences and client exclusions
   - `activity_logs` - For audit logging of system activities

2. Protection against unauthorized access:
   - Verifies that anonymous users cannot access sensitive data
   - Confirms that Row Level Security is working properly

## How to Use

### Step 1: Create Required Tables (If Needed)

If the tables don't exist yet, you need to run the `apply-hipaa-tables.sql` script in your Supabase SQL Editor:

1. Log into your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy the contents of `apply-hipaa-tables.sql`
4. Execute the script

### Step 2: Run the HIPAA Compliance Check

1. Edit `simple-hipaa-check.js` and replace the placeholder credentials with your actual Supabase credentials:
   ```javascript
   const SUPABASE_URL = 'https://your-project-id.supabase.co';
   const SUPABASE_ANON_KEY = 'your-anon-key'; 
   const SUPABASE_SERVICE_KEY = 'your-service-role-key';
   ```

2. Install the Supabase JavaScript client if you haven't already:
   ```bash
   npm install @supabase/supabase-js
   ```

3. Run the check:
   ```bash
   node simple-hipaa-check.js
   ```

4. Review the results in the console output.

## Interpreting Results

- ✅ PASSED: Your database has the basic tables and security measures needed for HIPAA compliance
- ❌ FAILED: Your database is missing required tables or has security vulnerabilities

## Beyond Basic Compliance

Remember that technical database security is just one part of HIPAA compliance. A comprehensive HIPAA compliance program also requires:

1. Administrative safeguards (policies, training, etc.)
2. Physical safeguards (facility access, workstation security, etc.)
3. Breach notification procedures
4. Business Associate Agreements with vendors
5. Documented risk assessments and policies

## Components In Your Project

The following React components in your project help maintain HIPAA compliance:

- **ComplianceDocHub**: Central hub for compliance documentation
- **AuditLogExport**: For exporting audit logs
- **ComplianceDashboard**: For monitoring compliance metrics
- **AIUsagePolicy**: Defines how AI should be used with patient data
- **BAARequestForm**: For handling Business Associate Agreements 