import { Router } from 'express';
import telemetryRoutes from './telemetryRoutes.js';
import workerRoutes from './workerRoutes.js';
import incidentRoutes from './incidentRoutes.js';
import simulationRoutes from './simulationRoutes.js';
import turnstileRoutes from './turnstileRoutes.js';

import controlRoutes from './controlRoutes.js';
import aiRouter from './aiRoutes.js';

const apiRouter = Router();

// API Healthcheck (Used by Render healthCheckPath)
apiRouter.get('/health', (req, res) => {
  res.json({
    status: 'HEALTHY',
    service: 'COALGUARD AI Backend',
    timestamp: new Date().toISOString(),
    uptimeSeconds: process.uptime(),
  });
});

apiRouter.use('/telemetry', telemetryRoutes);
apiRouter.use('/workers', workerRoutes);
apiRouter.use('/incidents', incidentRoutes);
apiRouter.use('/simulation', simulationRoutes);
apiRouter.use('/turnstile', turnstileRoutes);
apiRouter.use('/control', controlRoutes);
apiRouter.use('/ai', aiRouter);

export default apiRouter;
