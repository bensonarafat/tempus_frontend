import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON
const supabaseServiceRole = import.meta.env.VITE_SUPABASE_SERVICE_ROLE
export const supabase = createClient(supabaseUrl, supabaseServiceRole, {})
