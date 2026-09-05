import { Router } from 'express';
import { triggerScenario } from '../controllers/simulationController.js';

const router = Router();

router.post('/scenario', triggerScenario);
router.post('/trigger', triggerScenario);
router.post('/', triggerScenario);

export default router;
