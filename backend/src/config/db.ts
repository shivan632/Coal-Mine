import { testSupabaseConnection, getSupabaseClient } from './supabase.js';

export const connectDatabase = async (): Promise<void> => {
  await testSupabaseConnection();
};

export { testSupabaseConnection, getSupabaseClient };
