# Supabase Backend Setup

This document provides instructions for setting up the Supabase backend for TherapyTrack.

## Prerequisites

1. Create a Supabase account at [https://supabase.com/](https://supabase.com/)
2. Create a new Supabase project
3. Note down your Supabase URL and anon key from the API settings

## Environment Configuration

1. Update the `.env` file with your Supabase credentials:

```
REACT_APP_SUPABASE_URL=your-supabase-url
REACT_APP_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Database Schema Setup

1. In your Supabase dashboard, navigate to the SQL Editor
2. Copy the SQL code from `supabase/migrations/20230101000000_initial_schema.sql`
3. Paste the SQL code into the SQL Editor and run it to create all tables and policies

Alternatively, if you have the Supabase CLI installed:

1. Install the Supabase CLI if you haven't already:
   ```bash
   npm install -g supabase
   ```

2. Login to your Supabase account:
   ```bash
   supabase login
   ```

3. Link your project:
   ```bash
   supabase link --project-ref your-project-ref
   ```

4. Push the migrations:
   ```bash
   supabase db push
   ```

## Storage Buckets Setup

You need to create the following storage buckets in your Supabase project:

1. Navigate to Storage in your Supabase dashboard
2. Create the following buckets:
   - `profile-photos` - For user profile images
   - `session-attachments` - For files attached to therapy sessions
   - `task-attachments` - For files attached to homework tasks
   - `message-attachments` - For files sent in messages

## Authentication Setup

1. Navigate to Authentication → Settings in your Supabase dashboard
2. Configure the Site URL to match your production or development URL
3. Enable Email auth provider
4. If you want to use Google authentication:
   - Enable Google provider
   - Configure your Google OAuth credentials

## Row-Level Security (RLS)

The SQL migration script sets up Row-Level Security policies for all tables. These policies ensure that:

- Therapists can only access data related to their own clients
- Clients can only access their own data
- Appropriate read/write permissions are enforced for all relationships

## Next Steps

1. Update your application code to use the Supabase client instead of Firebase
2. Migrate any existing data from Firebase to Supabase
3. Test all functionality to ensure the migration was successful

## Data Migration (From Firebase)

If you need to migrate existing data from Firebase to Supabase, create a Node.js script that:

1. Reads data from Firebase collections
2. Transforms data to match the Supabase schema
3. Inserts the transformed data into Supabase tables

Example script structure:

```javascript
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');
const { createClient } = require('@supabase/supabase-js');

// Initialize Firebase
const firebaseApp = initializeApp({
  // Your Firebase config
});
const firestore = getFirestore(firebaseApp);

// Initialize Supabase
const supabase = createClient(
  'your-supabase-url',
  'your-service-role-key' // Use service role key for migrations
);

async function migrateCollection(collectionName, transformFn) {
  // Get data from Firebase
  const snapshot = await getDocs(collection(firestore, collectionName));
  const items = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
  
  // Transform data for Supabase
  const transformedItems = items.map(transformFn);
  
  // Insert into Supabase
  const { data, error } = await supabase
    .from(collectionName)
    .insert(transformedItems);
    
  if (error) console.error(`Error migrating ${collectionName}:`, error);
  else console.log(`Successfully migrated ${items.length} ${collectionName}`);
}

// Run migrations
async function migrateData() {
  // Migrate users first
  // Then migrate other collections
}

migrateData().catch(console.error);
```

## Troubleshooting

- **Auth issues**: Check that your site URL is correctly configured
- **Permission errors**: Verify the RLS policies are correctly set up
- **Data type errors**: Ensure timestamps and arrays are properly formatted 