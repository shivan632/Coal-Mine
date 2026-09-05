import React from 'react';
import { motion } from 'framer-motion';

interface CircularGaugeProps {
  value: number; // 0 to 100
  size?: number;
  strokeWidth?: number;
  label?: string;
  unit?: string;
  sublabel?: string;
  status?: 'NOMINAL' | 'WARNING' | 'CRITICAL';
  colorGradient?: [string, string];
}

export const CircularGauge: React.FC<CircularGaugeProps> = ({
  value,
  size = 180,
  strokeWidth = 12,
  label = 'SAFETY INDEX',
  unit = '%',
  sublabel = 'NOMINAL RATING',
  status = 'NOMINAL',
  colorGradient,
}) => {
  const clamped = Math.max(0, Math.min(100, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // Use a 270-degree arc for high-tech instrument look
  const arcLength = circumference * 0.75;
  const strokeDashoffset = arcLength - (clamped / 100) * arcLength;

  const defaultGradients = {
    NOMINAL: ['#00D4FF', '#22C55E'],
    WARNING: ['#F59E0B', '#EAB308'],
    CRITICAL: ['#FF4D5A', '#DC2626'],
  };

  const [startColor, endColor] = colorGradient || defaultGradients[status];
  const gradientId = `gauge-grad-${label.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div className="relative flex flex-col items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-135">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={startColor} />
            <stop offset="100%" stopColor={endColor} />
          </linearGradient>
          <filter id="glow-gauge" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor={startColor} floodOpacity="0.6" />
          </filter>
        </defs>

        {/* Background Track Arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(16, 34, 53, 0.9)"
          strokeWidth={strokeWidth}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeLinecap="round"
        />

        {/* Track Tick Overlay */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(0, 212, 255, 0.15)"
          strokeWidth={strokeWidth - 4}
          strokeDasharray={`2 8`}
          strokeLinecap="round"
        />

        {/* Animated Active Arc */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeDasharray={`${arcLength} ${circumference}`}
          initial={{ strokeDashoffset: arcLength }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          strokeLinecap="round"
          filter="url(#glow-gauge)"
        />
      </svg>

      {/* Central Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pt-2">
        <motion.div
          key={value}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="flex items-baseline justify-center"
        >
          <span className="font-hud text-3xl sm:text-4xl font-extrabold tracking-tight text-white drop-shadow-[0_0_15px_rgba(0,212,255,0.4)]">
            {clamped}
          </span>
          <span className="text-cyan-400 font-tech font-bold text-lg ml-0.5">{unit}</span>
        </motion.div>

        <span className="text-[10px] font-tech font-semibold tracking-wider text-slate-300 uppercase mt-0.5">
          {label}
        </span>
        <span
          className={`text-[9px] font-mono font-medium tracking-wide uppercase px-2 py-0.5 rounded-full mt-1 ${
            status === 'NOMINAL'
              ? 'text-emerald-400 bg-emerald-950/50'
              : status === 'WARNING'
              ? 'text-amber-400 bg-amber-950/50'
              : 'text-rose-400 bg-rose-950/50 animate-pulse'
          }`}
        >
          {sublabel}
        </span>
      </div>
    </div>
  );
};
