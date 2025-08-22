import { createClient } from '@supabase/supabase-js';

// These will be replaced with your Supabase project URL and anon key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Anon Key:', supabaseAnonKey);

// URL ve key'in doğru olduğundan emin ol
if (supabaseUrl === 'YOUR_SUPABASE_URL' || supabaseAnonKey === 'YOUR_SUPABASE_ANON_KEY') {
  console.warn('Supabase URL or Anon Key is not set. Please check your .env file.');
}

// Service role key ile ikinci bir client oluştur
const supabaseServiceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export const supabaseService = createClient(supabaseUrl, supabaseServiceRoleKey);