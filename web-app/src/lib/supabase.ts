// Supabase client — same project as both mobile apps
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://xkoewoyrlylsmogkexic.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_7Z9aohcBPGOMTAQ2MkuMQQ_JhSlqOMT'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

// Backend Express server (must be running locally)
export const API_BASE = 'http://localhost:3000'
