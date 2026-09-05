import React from 'react';
import { SafetyStatus } from '../../types/dashboard';

interface StatusBadgeProps {
  status: SafetyStatus;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showPulse?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  size = 'md',
  showPulse = true,
}) => {
  const displayLabel = label || status;

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2',
  };

  const statusStyles = {
    NOMINAL: {
      bg: 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400',
      dot: 'bg-emerald-400',
      glow: 'shadow-[0_0_12px_rgba(34,197,94,0.4)]',
    },
    WARNING: {
      bg: 'bg-amber-950/60 border-amber-500/40 text-amber-400',
      dot: 'bg-amber-400',
      glow: 'shadow-[0_0_12px_rgba(245,158,11,0.4)]',
    },
    CRITICAL: {
      bg: 'bg-rose-950/60 border-rose-500/50 text-rose-400',
      dot: 'bg-rose-400',
      glow: 'shadow-[0_0_15px_rgba(255,77,90,0.6)] animate-pulse',
    },
  };

  const config = statusStyles[status];

  return (
    <span
      className={`inline-flex items-center rounded-full border font-mono font-semibold uppercase tracking-wider backdrop-blur-md transition-all duration-300 ${sizeClasses[size]} ${config.bg} ${config.glow}`}
    >
      <span className="relative flex h-2 w-2">
        {showPulse && (
          <span
            className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${config.dot}`}
          />
        )}
        <span className={`relative inline-flex h-2 w-2 rounded-full ${config.dot}`} />
      </span>
      {displayLabel}
    </span>
  );
};
