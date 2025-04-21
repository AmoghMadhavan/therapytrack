// This file is maintained for backward compatibility
// Import and re-export the supabase client from our configured setup
import { supabase, tableFrom, DB_SCHEMA } from './supabase/config';

export { supabase, tableFrom, DB_SCHEMA }; 