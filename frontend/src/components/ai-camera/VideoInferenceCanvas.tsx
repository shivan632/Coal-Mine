import React, { useRef, useEffect, useState } from 'react';
import { Camera, RefreshCw, UserCheck, Cpu, Video, VideoOff, CheckCircle2, XCircle } from 'lucide-react';
import { useWorkerSafetyStore } from '../../stores/useWorkerSafetyStore';
import { soundEffects } from '../../services/soundEffects';

export const VideoInferenceCanvas: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [webcamActive, setWebcamActive] = useState(false);
  const [webcamError, setWebcamError] = useState<string | null>(null);

  const currentWorker = useWorkerSafetyStore((state) => state.currentWorker);
  const isScanning = useWorkerSafetyStore((state) => state.isScanning);
  const nextWorker = useWorkerSafetyStore((state) => state.nextWorker);
  const togglePPEItem = useWorkerSafetyStore((state) => state.togglePPEItem);

  const { ppeCompliance, verdict } = currentWorker;
  const isSafe = verdict === 'ALL CORRECT';

  // Toggle real webcam video stream
  const toggleWebcam = async () => {
    if (webcamActive) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setWebcamActive(false);
      setWebcamError(null);
      soundEffects.playClick();
    } else {
      try {
        setWebcamError(null);
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
          audio: false,
        });

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().catch(console.error);
          };
        }
        setWebcamActive(true);
        soundEffects.playSuccess();
      } catch (err: any) {
        console.warn('Webcam initialization error:', err);
        setWebcamError('Webcam access was blocked or not found. Switched back to AI Simulated Feed.');
        setWebcamActive(false);
        soundEffects.playWarning();
      }
    }
  };

  // Ensure webcam stream is attached if active
  useEffect(() => {
    if (webcamActive && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(console.error);
    }
  }, [webcamActive]);

  // Clean up stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-cyan-500/30 bg-[#06111F]/90 shadow-2xl flex flex-col">
      {/* Feed Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 bg-[#0A1A2E]/90 border-b border-cyan-500/20 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
          </div>
          <span className="font-hud text-xs font-bold text-white tracking-wider">
            AI COMPUTER VISION FEED
          </span>
          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/70 px-2 py-0.5 rounded border border-cyan-500/30">
            CAM-UG04-AI
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleWebcam}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-md ${
              webcamActive
                ? 'bg-rose-500/30 text-rose-300 border border-rose-400/50 shadow-[0_0_12px_rgba(255,77,90,0.3)]'
                : 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-900/80 shadow-[0_0_12px_rgba(0,212,255,0.2)]'
            }`}
          >
            {webcamActive ? <VideoOff className="w-3.5 h-3.5" /> : <Video className="w-3.5 h-3.5" />}
            <span>{webcamActive ? 'Disable Camera' : 'Live Webcam'}</span>
          </button>

          <button
            type="button"
            onClick={nextWorker}
            title="Rotate to Next Worker in Queue"
            className="px-2.5 py-1 rounded-lg bg-[#0E2238] border border-cyan-500/30 text-cyan-300 hover:text-white hover:bg-cyan-950/70 transition-colors flex items-center gap-1.5 text-xs font-mono font-semibold"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Next Worker</span>
          </button>
        </div>
      </div>

      {/* Main Camera Viewport */}
      <div className="relative w-full aspect-[4/3] sm:aspect-[16/11] bg-[#02060F] overflow-hidden flex items-center justify-center">
        {/* Background 1: High Quality Local Miner Image */}
        {!webcamActive ? (
          <div className="relative w-full h-full">
            <img
              src={currentWorker.photoUrl || '/assets/miners/rajesh.jpg'}
              alt={currentWorker.name}
              className="w-full h-full object-cover object-center filter contrast-110 brightness-95"
            />
            {/* Dark vignette overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#030812] via-transparent to-[#030812]/50 pointer-events-none" />
          </div>
        ) : (
          /* Background 2: Live Webcam stream */
          <div className="relative w-full h-full bg-black flex items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover transform -scale-x-100"
            />
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-rose-950/80 border border-rose-500/50 text-rose-400 text-[10px] font-mono font-bold flex items-center gap-1 z-10">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
              <span>LIVE WEBCAM STREAM ACTIVE</span>
            </div>
          </div>
        )}

        {/* Laser Scanning Line Animation */}
        {isScanning && (
          <div className="pointer-events-none absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_#00D4FF] animate-scanline z-20" />
        )}

        {/* HUD Corner Reticles */}
        <div className="pointer-events-none absolute inset-3 border border-cyan-500/20 rounded z-10">
          <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-cyan-400" />
          <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-cyan-400" />
          <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-cyan-400" />
          <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-cyan-400" />
        </div>

        {/* Dynamic AI Detection Bounding Boxes Positioned on the Miner */}
        {/* 1. Helmet Bounding Box */}
        <div
          onClick={() => togglePPEItem('helmet')}
          className={`absolute top-[16%] left-[34%] w-[32%] h-[18%] border-2 rounded transition-all cursor-pointer z-20 ${
            ppeCompliance.helmet
              ? 'border-emerald-400 bg-emerald-500/15 shadow-[0_0_15px_rgba(34,197,94,0.35)]'
              : 'border-rose-500 bg-rose-500/25 shadow-[0_0_20px_rgba(255,77,90,0.55)] animate-pulse'
          }`}
        >
          <span
            className={`absolute -top-5 left-0 text-[10px] font-mono font-bold px-2 py-0.5 rounded shadow-lg whitespace-nowrap ${
              ppeCompliance.helmet
                ? 'bg-emerald-950/90 text-emerald-400 border border-emerald-500/50'
                : 'bg-rose-950/90 text-rose-400 border border-rose-500/70'
            }`}
          >
            HELMET {ppeCompliance.helmet ? '99.4% [OK]' : 'MISSING! [ALERT]'}
          </span>
        </div>

        {/* 2. Respirator Mask Bounding Box */}
        <div
          onClick={() => togglePPEItem('respiratorMask')}
          className={`absolute top-[34%] left-[38%] w-[24%] h-[16%] border-2 rounded transition-all cursor-pointer z-20 ${
            ppeCompliance.respiratorMask
              ? 'border-emerald-400 bg-emerald-500/15 shadow-[0_0_15px_rgba(34,197,94,0.35)]'
              : 'border-rose-500 bg-rose-500/25 shadow-[0_0_20px_rgba(255,77,90,0.55)] animate-pulse'
          }`}
        >
          <span
            className={`absolute -top-5 left-0 text-[10px] font-mono font-bold px-2 py-0.5 rounded shadow-lg whitespace-nowrap ${
              ppeCompliance.respiratorMask
                ? 'bg-emerald-950/90 text-emerald-400 border border-emerald-500/50'
                : 'bg-rose-950/90 text-rose-400 border border-rose-500/70'
            }`}
          >
            MASK {ppeCompliance.respiratorMask ? '98.1% [OK]' : 'MISSING! [ALERT]'}
          </span>
        </div>

        {/* 3. Safety Jacket Torso Bounding Box */}
        <div
          onClick={() => togglePPEItem('safetyJacket')}
          className={`absolute top-[50%] left-[20%] w-[60%] h-[42%] border-2 rounded transition-all cursor-pointer z-20 ${
            ppeCompliance.safetyJacket
              ? 'border-emerald-400 bg-emerald-500/15 shadow-[0_0_15px_rgba(34,197,94,0.35)]'
              : 'border-rose-500 bg-rose-500/25 shadow-[0_0_20px_rgba(255,77,90,0.55)] animate-pulse'
          }`}
        >
          <span
            className={`absolute -top-5 left-0 text-[10px] font-mono font-bold px-2 py-0.5 rounded shadow-lg whitespace-nowrap ${
              ppeCompliance.safetyJacket
                ? 'bg-emerald-950/90 text-emerald-400 border border-emerald-500/50'
                : 'bg-rose-950/90 text-rose-400 border border-rose-500/70'
            }`}
          >
            JACKET {ppeCompliance.safetyJacket ? '99.0% [OK]' : 'MISSING! [ALERT]'}
          </span>
        </div>

        {/* Top Info Banner - Worker Metadata */}
        <div className="absolute top-2 left-2 bg-[#06111F]/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-cyan-500/30 flex items-center gap-2.5 z-20 shadow-lg">
          <UserCheck className="w-4 h-4 text-cyan-400" />
          <span className="font-hud text-xs font-bold text-white tracking-wide">
            {currentWorker.name}
          </span>
          <span className="text-[10px] font-mono text-cyan-400">
            [{currentWorker.workerId}]
          </span>
        </div>

        {/* AI Confidence Gauge (Top Right) */}
        <div className="absolute top-2 right-2 bg-[#06111F]/90 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-cyan-500/30 flex items-center gap-1.5 text-[10px] font-mono z-20 shadow-lg">
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-300">CONFIDENCE:</span>
          <span className="text-cyan-400 font-bold">{currentWorker.confidence}%</span>
        </div>

        {/* Error overlay if webcam requested but unavailable */}
        {webcamError && (
          <div className="absolute bottom-2 inset-x-2 bg-rose-950/95 border border-rose-500/60 p-2.5 rounded-lg text-xs font-mono text-rose-300 text-center z-30 shadow-2xl">
            {webcamError}
          </div>
        )}
      </div>

      {/* Footer Instructions */}
      <div className="px-3 py-2 bg-[#0A1A2E]/90 border-t border-cyan-500/20 text-[10px] font-mono text-slate-400 flex items-center justify-between">
        <span>CLICK BOXES OR DECK BELOW TO TEST PPE VIOLATIONS</span>
        <span className="text-cyan-400 font-bold">EDGE INFERENCE 20Hz</span>
      </div>
    </div>
  );
};
