import { Router } from 'express';
import { getTurnstileState, setTurnstileOverride } from '../controllers/turnstileController.js';

const router = Router();

router.get('/state', getTurnstileState);
router.post('/override', setTurnstileOverride);

export default router;
