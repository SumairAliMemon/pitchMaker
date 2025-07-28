import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Debug logging for development
if (process.env.NODE_ENV === 'development') {
  console.log('Environment check:', {
    supabaseUrl: supabaseUrl ? 'Present' : 'Missing',
    supabaseAnonKey: supabaseAnonKey ? 'Present' : 'Missing',
    nodeEnv: process.env.NODE_ENV
  })
}

// Create Supabase client with fallback for build process
let supabase: ReturnType<typeof createClient>

if (!supabaseUrl || !supabaseAnonKey) {
  const errorMessage = 
    'Missing Supabase environment variables. Please check your .env.local file and ensure you have:\n' +
    '- NEXT_PUBLIC_SUPABASE_URL\n' +
    '- NEXT_PUBLIC_SUPABASE_ANON_KEY\n\n' +
    'Get these from: https://supabase.com/dashboard/project/_/settings/api\n\n' +
    `Current values:\n` +
    `- NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl || 'undefined'}\n` +
    `- NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseAnonKey ? '[PRESENT]' : 'undefined'}`
  
  console.error(errorMessage)
  
  // During build time, create a dummy client to prevent build failures
  if (typeof window === 'undefined') {
    console.warn('Creating dummy Supabase client for build process')
    supabase = createClient(
      'https://dummy.supabase.co', 
      'dummy_anon_key_for_build_process'
    )
  } else {
    throw new Error(errorMessage)
  }
} else {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
}

export { supabase }
