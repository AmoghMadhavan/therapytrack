# TherapyTrack Database Fix Documentation

This document outlines the issues identified in the TherapyTrack application's database and the solutions implemented to address them.

## Issues Identified

1. **Schema Inconsistencies**: Multiple definitions of database tables with inconsistent structure
   - Different column names in different schema files
   - Inconsistent constraints and default values
   - Different RLS policies in different files

2. **Naming Convention Mismatches**: Frontend uses camelCase while database uses snake_case
   - Frontend sends `therapistId` but database expects `therapist_id`
   - This affects clients, tasks, goals, and other entities

3. **Dummy Data**: Presence of dummy clients preventing new client creation
   - Test data cluttering the database
   - Possible constraint issues or RLS conflicts

4. **Row-Level Security (RLS) Conflicts**: Overly restrictive policies
   - Some policies might prevent legitimate updates
   - Inconsistent application of RLS across related tables

## Solutions Implemented

### 1. Comprehensive Database Schema Reset

Created a clean, consistent database schema in `clean-database.sql` that:
- Drops all existing tables to start fresh
- Creates tables with consistent naming conventions (snake_case)
- Sets appropriate constraints and default values
- Establishes proper relationships between tables
- Applies consistent RLS policies

### 2. Field Mapping in Service Layer

Updated the service layer in `supabaseService.ts` to:
- Convert camelCase frontend fields to snake_case database fields
- Handle both formats for flexibility (e.g., both `therapistId` and `therapist_id`)
- Add proper error handling with detailed error messages
- Remove undefined values to prevent database constraint issues
- Add TypeScript type safety with `Record<string, any>` typing

### 3. Dummy Data Cleanup Script

Created a dedicated cleanup script `clean-dummy-data.js` that:
- Identifies and lists dummy clients based on name or notes content
- Removes related tasks, goals, and sessions for each dummy client
- Safely deletes identified dummy clients
- Provides detailed execution logs and error handling

### 4. Improved RLS Policies

Implemented balanced RLS policies that:
- Allow therapists full control over their own data
- Permit clients to view and update appropriate data
- Support editing of existing entities without permission conflicts
- Maintain proper security boundaries between different users

## How to Apply the Fix

1. **Reset the Database Schema**:
   ```bash
   # Log in to Supabase SQL Editor and run:
   # Copy and paste contents from clean-database.sql
   ```

2. **Clean Dummy Data**:
   ```bash
   # Run the cleanup script
   node scripts/clean-dummy-data.js
   ```

3. **Update Code**:
   - The service layer changes have been applied to `supabaseService.ts`
   - These handle the field mapping between frontend and database

## Verification

After applying these changes, you should be able to:
- Create new clients without errors
- Create and manage sessions for all clients
- Add and edit tasks and goals
- See proper error messages if any issues occur

## Future Recommendations

1. **Consistent Development Practices**:
   - Use TypeScript interfaces for all database entities
   - Follow a single naming convention (recommend snake_case for database, camelCase for frontend)
   - Document schema changes in migration files

2. **Database Maintenance**:
   - Schedule regular clean-up of test data
   - Monitor database performance and size
   - Consider adding indexes for frequently queried fields

3. **Error Handling**:
   - Use more specific error types for different database operations
   - Implement retries for transient errors
   - Add logging for database operations in development 