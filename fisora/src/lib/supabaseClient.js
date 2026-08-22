import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // eslint-disable-next-line no-console
  console.warn(
    'Supabase env vars missing. Add REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY to fisora/.env.local and restart the dev server.'
  );
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');
