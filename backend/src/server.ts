import http from 'http';
import { createApp } from './app.js';
import { ENV } from './config/env.js';
import { testSupabaseConnection } from './config/supabase.js';
import { wsService } from './services/websocketService.js';
import { telemetryEngine } from './services/telemetryEngine.js';

const startServer = async () => {
  console.log('🚀 [CoalGuard Server] Initializing Mission-Critical Command Backend (Supabase + WebSockets)...');

  // 1. Initialize Express App & HTTP Server
  const app = createApp();
  const server = http.createServer(app);

  // 2. Attach WebSocket Service to HTTP Server
  wsService.init(server, '/api/v1/mine-safety/stream');

  // 3. Test Connection to Supabase PostgreSQL
  await testSupabaseConnection();

  // 4. Start Background Telemetry & Jitter Engine
  telemetryEngine.start();

  // 5. Start Listening on Port (Default 8080 or Render process.env.PORT)
  server.listen(ENV.PORT, () => {
    console.log(`\n================================================================`);
    console.log(`⚡ COALGUARD AI BACKEND RUNNING ON PORT: ${ENV.PORT}`);
    console.log(`🌐 REST API Base:      http://localhost:${ENV.PORT}/api/v1`);
    console.log(`🔌 WebSocket Stream:   ws://localhost:${ENV.PORT}/api/v1/mine-safety/stream`);
    console.log(`🩺 Health Check:       http://localhost:${ENV.PORT}/api/v1/health`);
    console.log(`🗄️ Database Backend:   Supabase (PostgreSQL)`);
    console.log(`================================================================\n`);
  });

  // Graceful shutdown handling for Render zero-downtime deploys
  const gracefulShutdown = (signal: string) => {
    console.log(`[CoalGuard Server] Received ${signal}. Shutting down gracefully...`);
    telemetryEngine.stop();
    server.close(() => {
      console.log('[CoalGuard Server] HTTP & WS Server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
};

startServer().catch((err) => {
  console.error('❌ [CoalGuard Server Crash]', err);
  process.exit(1);
});
