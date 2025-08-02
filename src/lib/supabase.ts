import { createClient, SupabaseClient } from '@supabase/supabase-js'

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

// Singleton pattern to avoid multiple client instances
let supabaseInstance: SupabaseClient | null = null

function createSupabaseClient(): SupabaseClient {
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
      return createClient(
        'https://dummy.supabase.co', 
        'dummy_anon_key_for_build_process'
      )
    } else {
      throw new Error(errorMessage)
    }
  }

  // Create client with singleton pattern
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      flowType: 'pkce',
      debug: process.env.NODE_ENV === 'development'
    },
    global: {
      headers: {
        'X-Client-Info': 'pitch-maker-app'
      }
    }
  })
}

// Create singleton instance
export const supabase = supabaseInstance || (supabaseInstance = createSupabaseClient())

