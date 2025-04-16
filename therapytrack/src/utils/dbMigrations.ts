import { supabase } from '../lib/supabase/config';

/**
 * Utility functions to handle database migrations at runtime
 */

/**
 * Add is_admin field to profiles table if it doesn't exist
 */
export const addIsAdminField = async (): Promise<boolean> => {
  try {
    console.log('Checking for is_admin field in profiles table...');
    
    // Check if the field exists by trying to select it
    const { error: checkError } = await supabase
      .from('profiles')
      .select('is_admin')
      .limit(1);
    
    // If there's no error, the field exists
    if (!checkError) {
      console.log('is_admin field already exists');
      return true;
    }
    
    // If the error isn't about the field not existing, something else is wrong
    if (checkError.code !== 'PGRST116') {
      console.error('Error checking for is_admin field:', checkError);
      return false;
    }
    
    console.log('is_admin field doesn\'t exist, adding it...');
    
    // Use RPC to add the field - this requires setting up this function in Supabase
    const { error: addError } = await supabase.rpc('add_is_admin_field');
    
    if (addError) {
      console.error('Error adding is_admin field via RPC:', addError);
      
      // Try direct SQL as fallback if allowed
      console.log('Attempting direct SQL...');
      // This will likely fail without admin rights, but we'll try
      const { error: sqlError } = await supabase.rpc('admin_query', {
        query_text: 'ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;'
      });
      
      if (sqlError) {
        console.error('Error adding is_admin field via SQL:', sqlError);
        return false;
      }
    }
    
    console.log('is_admin field added successfully');
    return true;
  } catch (error) {
    console.error('Unexpected error in addIsAdminField:', error);
    return false;
  }
};

/**
 * Give admin privileges to a specific email
 */
export const setAdminForEmail = async (email: string): Promise<boolean> => {
  try {
    console.log(`Setting admin privileges for ${email}...`);
    
    // Update the profile with the is_admin flag
    const { error } = await supabase
      .from('profiles')
      .update({
        is_admin: true,
        updated_at: new Date().toISOString()
      })
      .eq('email', email);
      
    if (error) {
      console.error('Error setting admin privileges:', error);
      return false;
    }
    
    console.log(`Admin privileges set for ${email}`);
    return true;
  } catch (error) {
    console.error('Unexpected error in setAdminForEmail:', error);
    return false;
  }
}; 