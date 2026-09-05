import { Router } from 'express';
import { getLiveTelemetry, getHistoricalTelemetry } from '../controllers/telemetryController.js';

const router = Router();

router.get('/live', getLiveTelemetry);
router.get('/historical', getHistoricalTelemetry);

export default router;
