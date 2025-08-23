import { createClient } from '@supabase/supabase-js'

// Supabase projenizin URL'si ve anon key'i
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('Supabase URL:', supabaseUrl)
console.log('Supabase Anon Key:', supabaseAnonKey ? 'Set' : 'Not set')

// Supabase client'ı oluştur
export const supabase = createClient(supabaseUrl, supabaseAnonKey)