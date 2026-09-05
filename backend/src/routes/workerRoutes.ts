import { Router } from 'express';
import { getWorkerRoster, scanWorkerPPE, createWorker } from '../controllers/workerController.js';

const router = Router();

router.get('/', getWorkerRoster);
router.get('/roster', getWorkerRoster);
router.post('/scan', scanWorkerPPE);
router.post('/scan-ppe', scanWorkerPPE);
router.post('/', createWorker);

export default router;
