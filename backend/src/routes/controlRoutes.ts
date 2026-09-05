import { Router } from 'express';
import {
  getInterlockStatus,
  executeInterlockCommand,
  setPowerState,
  setVentilationState,
  toggleAutoInterlock,
} from '../controllers/controlController.js';

const router = Router();

router.get('/status', getInterlockStatus);
router.post('/command', executeInterlockCommand);
router.post('/power', setPowerState);
router.post('/ventilation', setVentilationState);
router.post('/interlock/auto-toggle', toggleAutoInterlock);
router.post('/interlock', executeInterlockCommand);

export default router;
