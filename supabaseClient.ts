import { createClient } from '@supabase/supabase-js';

// Read values from Vite's environment variables
// FIX: Cast `import.meta` to `any` to resolve TypeScript error about missing `env` property.
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
// FIX: Cast `import.meta` to `any` to resolve TypeScript error about missing `env` property.
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

// Check if the variables are set
export const isSupabaseConnected = !!(supabaseUrl && supabaseAnonKey);

let supabaseInstance: any = null;

if (isSupabaseConnected) {
  supabaseInstance = createClient(supabaseUrl!, supabaseAnonKey!);
}

// Export the instance (which could be null if not configured)
export const supabase = supabaseInstance;