import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '8080', 10),
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_KEY:
    process.env.SUPABASE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    '',
  CORS_ORIGIN: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((s) => s.trim())
    : ['http://localhost:5173', 'http://localhost:3000'],
  TELEMETRY_INTERVAL_MS: parseInt(process.env.TELEMETRY_INTERVAL_MS || '1200', 10),
  MQTT_BROKER_URL: process.env.MQTT_BROKER_URL || '',
};

export const isSupabaseConfigured = (): boolean => {
  return !!(ENV.SUPABASE_URL && ENV.SUPABASE_KEY);
};
