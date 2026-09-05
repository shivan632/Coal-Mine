import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ENV, isSupabaseConfigured } from './env.js';

let supabaseInstance: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient | null => {
  if (supabaseInstance) return supabaseInstance;

  if (isSupabaseConfigured()) {
    try {
      supabaseInstance = createClient(ENV.SUPABASE_URL, ENV.SUPABASE_KEY, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
      return supabaseInstance;
    } catch (error: any) {
      console.error(`[CoalGuard Supabase Error] Failed to initialize Supabase client: ${error.message}`);
      return null;
    }
  }

  return null;
};

export const testSupabaseConnection = async (): Promise<boolean> => {
  if (!isSupabaseConfigured()) {
    console.warn('⚠️ [CoalGuard Supabase] SUPABASE_URL or SUPABASE_KEY not configured.');
    console.warn('⚠️ [CoalGuard Supabase] Backend will run with high-performance in-memory state buffer.');
    console.warn('💡 Tip: Add your Supabase credentials in backend/.env to persist data directly to PostgreSQL.');
    return false;
  }

  try {
    const client = getSupabaseClient();
    if (!client) return false;

    const { error } = await client.from('workers').select('id').limit(1);

    if (error) {
      // Table might not exist yet or permission issue
      console.warn(`⚠️ [CoalGuard Supabase] Connected to Supabase, but encountered query response: ${error.message}`);
      console.warn('💡 Tip: If you have not created the tables yet, execute "backend/supabase-schema.sql" in your Supabase SQL Editor.');
      return true;
    }

    console.log(`✅ [CoalGuard Supabase] Connected successfully to Supabase: ${ENV.SUPABASE_URL}`);
    return true;
  } catch (err: any) {
    console.error(`❌ [CoalGuard Supabase Error] Connection test failed: ${err.message}`);
    return false;
  }
};
