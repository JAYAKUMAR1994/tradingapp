import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';

if (!env.supabaseUrl || !env.supabaseKey) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in environment');
}

export const supabase = createClient(env.supabaseUrl, env.supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});
