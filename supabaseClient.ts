// Fix: Add Vite client types to resolve 'import.meta.env' error.
/// <reference types="vite/client" />

import { createClient } from '@supabase/supabase-js';

// Read values from Vite's environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if the variables are set
export const isSupabaseConnected = !!(supabaseUrl && supabaseAnonKey);

let supabaseInstance: any = null;

if (isSupabaseConnected) {
  supabaseInstance = createClient(supabaseUrl!, supabaseAnonKey!);
}

// Export the instance (which could be null if not configured)
export const supabase = supabaseInstance;