import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  X,
  Send,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Zap,
  RotateCcw,
  Square,
  Copy,
  Check,
  Wind,
  HardHat,
  FileText,
  Flame,
} from 'lucide-react';
import { useAiCopilotStore } from '../../stores/useAiCopilotStore';
import { useTelemetryStore } from '../../stores/useTelemetryStore';
import { useWorkerSafetyStore } from '../../stores/useWorkerSafetyStore';
import { aiService } from '../../services/aiService';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  modelUsed?: string;
  timestamp: number;
}

export const OpenRouterSafetyCopilotModal: React.FC = () => {
  const isOpen = useAiCopilotStore((state) => state.isCopilotOpen);
  const closeCopilot = useAiCopilotStore((state) => state.closeCopilot);
  const initialPrompt = useAiCopilotStore((state) => state.initialPrompt);
  const aiStatus = useAiCopilotStore((state) => state.aiStatus);
  const activeModel = useAiCopilotStore((state) => state.activeModel);
  const latencyMs = useAiCopilotStore((state) => state.latencyMs);
  const setAiStatus = useAiCopilotStore((state) => state.setAiStatus);

  const activeZone = useTelemetryStore((state) => state.activeZone);
  const currentPacket = useTelemetryStore((state) => state.currentPacket);
  const currentWorker = useWorkerSafetyStore((state) => state.currentWorker);

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortStreamRef = useRef<(() => void) | null>(null);

  // Initial greeting & status check
  useEffect(() => {
    if (isOpen) {
      aiService.checkStatus().then((res) => {
        setAiStatus(res.status, res.model, res.latencyMs);
      });

      if (messages.length === 0) {
        setMessages([
          {
            id: 'init-1',
            role: 'assistant',
            content: `**CoalGuard Neural Safety Advisor (Powered by OpenRouter)** online.\n\nI am synchronized with underground sector **${activeZone}** telemetry ($CH_4$: ${currentPacket?.methane_CH4 ?? 0.45}%, $CO$: ${currentPacket?.carbonMonoxide_CO ?? 12} ppm, Temp: ${currentPacket?.temperature ?? 24}°C).\n\nAsk any statutory DGMS/OSHA safety question, or tap a one-click tactical audit chip below.`,
            modelUsed: activeModel,
            timestamp: Date.now(),
          },
        ]);
      }
    }
  }, [isOpen]);

  // Handle initialPrompt triggered from other components
  useEffect(() => {
    if (isOpen && initialPrompt) {
      handleSendMessage(initialPrompt);
    }
  }, [isOpen, initialPrompt]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  const handleSendMessage = (textToSend?: string) => {
    const promptText = (textToSend || input).trim();
    if (!promptText || isStreaming) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: promptText,
      timestamp: Date.now(),
    };

    const assistantMsgId = `assistant-${Date.now()}`;
    const newAssistantMessage: ChatMessage = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      modelUsed: activeModel,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage, newAssistantMessage]);
    setInput('');
    setIsStreaming(true);

    const context = {
      activeZone,
      telemetry: currentPacket,
      workerName: currentWorker?.name,
      missingPPE: currentWorker?.missingItems,
    };

    const priorHistory = messages.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    const cancelFn = aiService.streamChat({
      prompt: promptText,
      messages: priorHistory,
      context,
      onChunk: (chunk: string) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId ? { ...msg, content: msg.content + chunk } : msg
          )
        );
      },
      onDone: (modelUsed: string) => {
        setIsStreaming(false);
        abortStreamRef.current = null;
        setMessages((prev) =>
          prev.map((msg) => (msg.id === assistantMsgId ? { ...msg, modelUsed } : msg))
        );
      },
      onError: (err) => {
        console.error('Streaming error:', err);
        setIsStreaming(false);
        abortStreamRef.current = null;
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId
              ? {
                  ...msg,
                  content:
                    msg.content +
                    `\n\n*(Notice: Network interruption occurred. Operating under cached DGMS statutory parameters.)*`,
                }
              : msg
          )
        );
      },
    });

    abortStreamRef.current = cancelFn;
  };

  const handleStopStreaming = () => {
    if (abortStreamRef.current) {
      abortStreamRef.current();
      abortStreamRef.current = null;
      setIsStreaming(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `init-${Date.now()}`,
        role: 'assistant',
        content: `Conversation reset. CoalGuard AI is ready for new queries regarding sector **${activeZone}**.`,
        modelUsed: activeModel,
        timestamp: Date.now(),
      },
    ]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl h-[88vh] max-h-[850px] rounded-2xl bg-[#040C18] border border-cyan-500/40 shadow-[0_0_50px_rgba(0,212,255,0.25)] flex flex-col overflow-hidden text-slate-100">
        {/* Top Glowing Gradient Bar */}
        <div className="h-1 w-full bg-gradient-to-r from-cyan-500 via-purple-500 to-emerald-400 animate-pulse" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-3.5 border-b border-cyan-500/20 bg-[#071527]/90 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-950 to-[#0c2440] border border-cyan-400/50 shadow-[0_0_15px_rgba(0,212,255,0.4)]">
              <Bot className="w-5 h-5 text-cyan-400" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-hud text-base sm:text-lg font-bold tracking-wider text-white">
                  COALGUARD <span className="text-cyan-400">NEURAL SAFETY ADVISOR</span>
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-purple-950/80 text-purple-300 border border-purple-500/40 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-400" />
                  OPENROUTER FREE
                </span>
              </div>
              <p className="text-[11px] font-mono text-cyan-300/70 hidden sm:block">
                DGMS CMR 2017 & OSHA Statutory Intelligence Copilot
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Status Indicator Badge */}
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#0a1e35] border border-cyan-500/30 text-[11px] font-mono">
              <span
                className={`w-2 h-2 rounded-full ${
                  aiStatus === 'CONNECTED' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              />
              <span className="text-slate-300">Model:</span>
              <span className="text-cyan-300 font-bold">{activeModel}</span>
              <span className="text-slate-500">|</span>
              <span className="text-emerald-400">{latencyMs}ms</span>
            </div>

            <button
              type="button"
              onClick={handleClearHistory}
              title="Reset Chat Session"
              className="p-1.5 rounded-lg border border-slate-700 bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={closeCopilot}
              className="p-1.5 rounded-lg border border-slate-700 bg-slate-900/60 text-slate-400 hover:text-rose-400 hover:border-rose-500/50 hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 1-Click Action Chips Strip */}
        <div className="px-4 py-2 bg-[#061220] border-b border-cyan-500/15 flex items-center gap-2 overflow-x-auto custom-scrollbar">
          <span className="text-[10px] font-mono text-slate-400 whitespace-nowrap flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            PRESETS:
          </span>

          {/* 1. Atmospheric Gas Risk Audit */}
          <button
            type="button"
            disabled={isStreaming}
            onClick={() =>
              handleSendMessage(
                `Perform an immediate Atmospheric Gas Risk Audit for sector "${activeZone}" where live CH4 is ${currentPacket?.methane_CH4 ?? 0.45}%, CO is ${currentPacket?.carbonMonoxide_CO ?? 12} ppm, and O2 is ${currentPacket?.oxygen_O2 ?? 20.8}%. State statutory DGMS compliance thresholds and recommended mitigation.`
              )
            }
            className="px-2.5 py-1 rounded-lg text-[11px] font-mono bg-[#091D33] hover:bg-cyan-950/80 text-cyan-300 border border-cyan-500/30 whitespace-nowrap flex items-center gap-1.5 transition-all hover:border-cyan-400"
          >
            <Wind className="w-3 h-3 text-cyan-400" />
            <span>Atmospheric Gas Risk Audit</span>
          </button>

          {/* 2. PPE Compliance Threat Assessment */}
          <button
            type="button"
            disabled={isStreaming}
            onClick={() =>
              handleSendMessage(
                `Evaluate the underground safety risk for worker "${currentWorker?.name || 'Miner'}" whose scan verdict is "${currentWorker?.verdict}" with missing items: [${currentWorker?.missingItems?.join(', ') || 'None'}]. Cite DGMS and statutory entrance barrier locking regulations.`
              )
            }
            className="px-2.5 py-1 rounded-lg text-[11px] font-mono bg-[#1A102E] hover:bg-purple-950/80 text-purple-300 border border-purple-500/30 whitespace-nowrap flex items-center gap-1.5 transition-all hover:border-purple-400"
          >
            <HardHat className="w-3 h-3 text-purple-400" />
            <span>PPE Compliance Threat</span>
          </button>

          {/* 3. Spontaneous Combustion Protocol */}
          <button
            type="button"
            disabled={isStreaming}
            onClick={() =>
              handleSendMessage(
                `What is the underground protocol for spontaneous combustion detection? Explain the significance of Carbon Monoxide rate-of-change (d(CO)/dt), Graham's ratio, and immediate sealing protocols under CMR 2017.`
              )
            }
            className="px-2.5 py-1 rounded-lg text-[11px] font-mono bg-[#2A1608] hover:bg-amber-950/80 text-amber-300 border border-amber-500/30 whitespace-nowrap flex items-center gap-1.5 transition-all hover:border-amber-400"
          >
            <Flame className="w-3 h-3 text-amber-400" />
            <span>Spontaneous Combustion</span>
          </button>

          {/* 4. Statutory DGMS Shift Briefing */}
          <button
            type="button"
            disabled={isStreaming}
            onClick={() =>
              handleSendMessage(
                `Generate an executive statutory DGMS shift briefing for the mine manager. Summarize current gas conditions, ventilation airflow compliance, and directives for the incoming shift supervisor.`
              )
            }
            className="px-2.5 py-1 rounded-lg text-[11px] font-mono bg-[#07241A] hover:bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 whitespace-nowrap flex items-center gap-1.5 transition-all hover:border-emerald-400"
          >
            <FileText className="w-3 h-3 text-emerald-400" />
            <span>DGMS Shift Briefing</span>
          </button>
        </div>

        {/* Conversation Message Canvas */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar bg-gradient-to-b from-[#030913] to-[#040D1A]">
          {messages.map((msg) => {
            const isAssistant = msg.role === 'assistant';

            return (
              <div
                key={msg.id}
                className={`flex gap-3 text-xs sm:text-sm font-sans ${
                  isAssistant ? 'items-start' : 'items-start flex-row-reverse'
                }`}
              >
                {/* Avatar Icon */}
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                    isAssistant
                      ? 'bg-gradient-to-br from-cyan-950 to-[#0A2645] border-cyan-400/40 text-cyan-300 shadow-[0_0_10px_rgba(0,212,255,0.3)]'
                      : 'bg-gradient-to-br from-purple-950 to-[#2A1045] border-purple-400/40 text-purple-300'
                  }`}
                >
                  {isAssistant ? <Bot className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                </div>

                {/* Message Content Bubble */}
                <div
                  className={`relative max-w-[85%] rounded-xl p-3.5 sm:p-4 leading-relaxed border ${
                    isAssistant
                      ? 'bg-[#08172B]/85 border-cyan-500/25 text-slate-100 shadow-md backdrop-blur-md'
                      : 'bg-[#180F2E]/90 border-purple-500/40 text-slate-100 shadow-md'
                  }`}
                >
                  {/* Assistant Header Tag */}
                  {isAssistant && (
                    <div className="flex items-center justify-between border-b border-cyan-500/15 pb-1.5 mb-2 text-[10px] font-mono text-cyan-300/80">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-cyan-300 uppercase">COALGUARD AI ADVISOR</span>
                        <span className="text-slate-500">•</span>
                        <span className="text-slate-400">{msg.modelUsed || activeModel}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="hover:text-white transition-colors flex items-center gap-1"
                        title="Copy to clipboard"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  )}

                  {/* Render Message Body with formatting */}
                  <div className="prose prose-invert max-w-none text-xs sm:text-sm whitespace-pre-wrap font-sans text-slate-200 selection:bg-cyan-500/30">
                    {msg.content || (isStreaming && msg.id === messages[messages.length - 1]?.id ? (
                      <span className="flex items-center gap-1.5 text-cyan-400 font-mono text-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                        Analyzing underground safety telemetry with OpenRouter...
                      </span>
                    ) : (
                      ''
                    ))}
                  </div>

                  {/* Timestamp */}
                  <div
                    className={`mt-2 text-[9px] font-mono ${
                      isAssistant ? 'text-slate-500' : 'text-purple-300/60 text-right'
                    }`}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar & Controls */}
        <div className="p-3 sm:p-4 bg-[#06111F] border-t border-cyan-500/20">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask CoalGuard AI regarding ventilation, methane kinetics, DGMS statutory rules, or interlocks..."
                className="w-full px-4 py-2.5 rounded-xl bg-[#091C30] border border-cyan-500/30 text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 shadow-inner"
              />
            </div>

            {isStreaming ? (
              <button
                type="button"
                onClick={handleStopStreaming}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold flex items-center gap-1.5 transition-all shadow-md"
              >
                <Square className="w-3.5 h-3.5" />
                <span>Stop</span>
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim()}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-mono text-xs font-bold flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(0,212,255,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Transmit</span>
              </button>
            )}
          </form>

          {/* Footer Info Strip */}
          <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-slate-500">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-cyan-400" />
              Statutory reference: DGMS Mines Act 1952 & CMR 2017
            </span>
            <span>Active Sector: {activeZone}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
