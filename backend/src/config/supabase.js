import { createClient } from '@supabase/supabase-js';
import { config } from './index.js';

let supabaseClient = null;

if (config.supabase.url && config.supabase.anonKey) {
  try {
    supabaseClient = createClient(config.supabase.url, config.supabase.anonKey);
    console.log('✅ Supabase client initialized in backend');
  } catch (err) {
    console.warn('⚠️ Could not initialize live Supabase client. Running in offline/mock mode.', err.message);
  }
} else {
  console.log('ℹ️ Running backend in offline/mock mode (Supabase credentials not fully set).');
}

export const supabase = supabaseClient;
