import { supabase } from './supabase'

export const getSupabaseClient = () => {
  return supabase
}

export const getCurrentUser = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.user ?? null
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return !error
}
