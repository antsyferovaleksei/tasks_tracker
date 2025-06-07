import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gwkyqchyuihmgpvqosvk.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Client для публічних операцій (реєстрація, логін)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client для операцій сервера (обхід RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export { supabaseUrl }; 