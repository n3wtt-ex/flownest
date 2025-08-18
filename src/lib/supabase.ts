import { createClient } from '@supabase/supabase-js'

// Supabase URL ve anon key'i environment değişkenlerinden al
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Supabase client'ı oluştur
export const supabase = createClient(supabaseUrl, supabaseAnonKey)