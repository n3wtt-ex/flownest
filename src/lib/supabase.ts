import { createClient } from '@supabase/supabase-js';

// These will be replaced with your Supabase project URL and keys
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';
const supabaseServiceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SUPABASE_SERVICE_ROLE_KEY';

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Anon Key:', supabaseAnonKey);
console.log('Supabase Service Role Key:', supabaseServiceRoleKey);

// URL and key check
if (supabaseUrl === 'YOUR_SUPABASE_URL' || supabaseAnonKey === 'YOUR_SUPABASE_ANON_KEY') {
  console.warn('Supabase URL or Anon Key is not set. Please check your .env file.');
}

// Create the standard client for frontend use
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Create an admin client for backend/admin operations
export const supabaseAdmin = supabaseServiceRoleKey !== 'YOUR_SUPABASE_SERVICE_ROLE_KEY' 
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : supabase;