import { Request, Response } from 'express';
import { openRouterService } from '../services/openRouterService.js';
import { telemetryEngine } from '../services/telemetryEngine.js';

/**
 * POST /api/v1/ai/chat/stream
 * Server-Sent Events (SSE) live token streaming endpoint
 */
export const streamChatHandler = async (req: Request, res: Response): Promise<void> => {
  const { prompt, messages, context, model } = req.body || {};

  if (!prompt || typeof prompt !== 'string') {
    res.status(400).json({ success: false, error: 'Prompt is required and must be a string.' });
    return;
  }

  // Setup SSE Headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no', // Disable proxy buffering
  });

  if (typeof (res as any).flushHeaders === 'function') {
    (res as any).flushHeaders();
  }

  let isAborted = false;
  req.on('close', () => {
    isAborted = true;
  });

  try {
    // If context not provided, enrich with active zone telemetry
    const enrichedContext = {
      activeZone: context?.activeZone || 'Gas-Zone-B12',
      telemetry: context?.telemetry || telemetryEngine.getZonePacket(context?.activeZone || 'Gas-Zone-B12'),
      workerName: context?.workerName,
      missingPPE: context?.missingPPE,
    };

    const result = await openRouterService.streamChatWithContext({
      prompt,
      messages,
      context: enrichedContext,
      model,
      onChunk: (chunk: string) => {
        if (!isAborted) {
          res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
        }
      },
    });

    if (!isAborted) {
      res.write(`data: ${JSON.stringify({ done: true, modelUsed: result.modelUsed })}\n\n`);
      res.end();
    }
  } catch (error: any) {
    console.error('[CoalGuard AI Controller] Streaming error:', error);
    if (!isAborted) {
      res.write(
        `data: ${JSON.stringify({
          error: error.message || 'AI streaming encountered an error',
          done: true,
        })}\n\n`
      );
      res.end();
    }
  }
};

/**
 * POST /api/v1/ai/chat
 * Standard REST non-streaming endpoint
 */
export const chatWithAI = async (req: Request, res: Response): Promise<void> => {
  try {
    const { prompt, messages, context, model } = req.body || {};
    if (!prompt || typeof prompt !== 'string') {
      res.status(400).json({ success: false, error: 'Prompt is required and must be a string.' });
      return;
    }

    let accumulated = '';
    const result = await openRouterService.streamChatWithContext({
      prompt,
      messages,
      context,
      model,
      onChunk: (c) => {
        accumulated += c;
      },
    });

    res.json({
      success: true,
      data: {
        content: result.fullContent || accumulated,
        model: result.modelUsed,
      },
    });
  } catch (error: any) {
    console.error('[CoalGuard AI Controller] Chat error:', error);
    res.status(500).json({ success: false, error: error.message ?? 'Internal server error' });
  }
};

/**
 * POST /api/v1/ai/incident-analysis
 * Structured root-cause & mitigation assessment for incidents
 */
export const analyzeIncidentHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { incident, telemetry } = req.body || {};
    if (!incident) {
      res.status(400).json({ success: false, error: 'Incident payload is required.' });
      return;
    }

    const liveTelemetry = telemetry || (incident.zone ? telemetryEngine.getZonePacket(incident.zone) : undefined);
    const result = await openRouterService.analyzeIncident(incident, liveTelemetry);

    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('[CoalGuard AI Controller] Incident analysis error:', error);
    res.status(500).json({ success: false, error: error.message ?? 'Failed to analyze incident' });
  }
};

/**
 * POST /api/v1/ai/briefing & GET /api/v1/ai/briefing
 * Executive shift briefing synthesis
 */
export const generateBriefingHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const zone = req.body?.zone || (req.query?.zone as string);
    const result = await openRouterService.generateBriefing(zone);
    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('[CoalGuard AI Controller] Briefing error:', error);
    res.status(500).json({ success: false, error: error.message ?? 'Failed to generate briefing' });
  }
};

/**
 * GET /api/v1/ai/status
 * OpenRouter connection health, model info, and latency
 */
export const getAiStatusHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const health = await openRouterService.checkHealth();
    res.json({ success: true, data: health });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
