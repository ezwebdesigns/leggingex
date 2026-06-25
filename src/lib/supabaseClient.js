import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vptbrllldcvgykpfljjd.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwdGJybGxsZGN2Z3lrcGZsampkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5MjEzODEsImV4cCI6MjA5NzQ5NzM4MX0.WwMP2GQiegQoVSly5eS8sXRQsYsGCL33U43GEITNrFI'

export const supabase = createClient(supabaseUrl, supabaseKey)
