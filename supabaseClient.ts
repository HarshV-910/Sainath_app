// FIX: The triple-slash directive for Vite's client types was failing to resolve.
// This is a workaround to manually define the types for import.meta.env.
declare global {
  interface ImportMeta {
    readonly env: {
      readonly VITE_SUPABASE_URL: string;
      readonly VITE_SUPABASE_ANON_KEY: string;
    }
  }
}

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
