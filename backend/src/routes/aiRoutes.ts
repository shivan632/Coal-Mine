import { Router } from 'express';
import {
  streamChatHandler,
  chatWithAI,
  analyzeIncidentHandler,
  generateBriefingHandler,
  getAiStatusHandler,
} from '../controllers/aiController.js';

const aiRouter = Router();

// Server-Sent Events (SSE) live token streaming
aiRouter.post('/chat/stream', streamChatHandler);

// Standard JSON REST chat
aiRouter.post('/chat', chatWithAI);

// Structured root-cause & statutory mitigation assessment
aiRouter.post('/incident-analysis', analyzeIncidentHandler);

// Executive shift safety briefing
aiRouter.post('/briefing', generateBriefingHandler);
aiRouter.get('/briefing', generateBriefingHandler);

// AI connectivity, active model & latency status
aiRouter.get('/status', getAiStatusHandler);

export default aiRouter;
