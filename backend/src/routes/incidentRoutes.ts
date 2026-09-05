import { Router } from 'express';
import {
  getIncidents,
  acknowledgeIncident,
  signoffIncident,
  createIncident,
  getIncidentReplay,
} from '../controllers/incidentController.js';

const router = Router();

router.get('/', getIncidents);
router.post('/', createIncident);
router.get('/:id/replay', getIncidentReplay);
router.patch('/:id/acknowledge', acknowledgeIncident);
router.post('/:id/acknowledge', acknowledgeIncident);
router.post('/:id/signoff', signoffIncident);

export default router;
