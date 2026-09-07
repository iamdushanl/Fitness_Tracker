import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// Support canonical VITE_SUPABASE_ANON_KEY, with fallback to VITE_SUPABASE_PUBLISHABLE_KEY
const supabaseKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Missing Supabase environment variables. ' +
      'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local (see .env.example)'
  );
}

/**
 * Singleton Supabase browser client.
 *
 * Uses the publishable (anon) key — safe to ship to the browser.
 * Auth state is persisted in localStorage by default so sessions
 * survive page reloads.
 */
export const supabase = createClient(supabaseUrl, supabaseKey);
