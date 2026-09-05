import express, { Application } from 'express';
import cors from 'cors';
import { ENV } from './config/env.js';
import apiRouter from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';

export const createApp = (): Application => {
  const app = express();

  // Middleware
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow all origins in dev or if origin matches allowed array
        if (!origin || ENV.NODE_ENV === 'development' || ENV.CORS_ORIGIN.includes(origin)) {
          callback(null, true);
        } else {
          callback(null, true); // Permissive for initial Render deployment
        }
      },
      credentials: true,
    })
  );

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Root Welcome Endpoint
  app.get('/', (req, res) => {
    res.json({
      name: 'COALGUARD AI — Underground Coal Mine Safety Command Center Backend',
      version: '1.0.0',
      status: 'ONLINE',
      docs: '/api/v1/health',
      websocket: '/api/v1/mine-safety/stream',
    });
  });

  // REST API Routes
  app.use('/api/v1', apiRouter);

  // Global Error Handler
  app.use(errorHandler);

  return app;
};
