import { createClient } from '@supabase/supabase-js'

// Supabase projenizin URL'si ve anon key'i
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Supabase client'ı oluştur
export const supabase = createClient(supabaseUrl, supabaseAnonKey)