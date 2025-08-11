import { createClient } from '@supabase/supabase-js'

// Usar variáveis de ambiente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://mcgegagtdjqkmfcishcr.supabase.co"
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jZ2VnYWd0ZGpxa21mY2lzaGNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2NTU5OTgsImV4cCI6MjA3MDIzMTk5OH0.5z6xUwCJ3d9Jun5449WYb4lQ1TJyqj71vFeJUN0bs24"

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  },
})
