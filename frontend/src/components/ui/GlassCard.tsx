import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

export interface GlassCardProps extends HTMLMotionProps<'div'> {
  glowColor?: 'cyan' | 'green' | 'amber' | 'crimson' | 'blue' | 'purple';
  enableHover3D?: boolean;
  enableFloating?: boolean;
  floatDelay?: number;
  floatDuration?: number;
  className?: string;
  children: React.ReactNode;
}

const GLOW_MAP = {
  cyan: 'rgba(0, 212, 255, 0.22)',
  green: 'rgba(34, 197, 94, 0.25)',
  amber: 'rgba(245, 158, 11, 0.25)',
  crimson: 'rgba(255, 77, 90, 0.35)',
  blue: 'rgba(47, 128, 237, 0.25)',
  purple: 'rgba(139, 92, 246, 0.25)',
};

const BORDER_MAP = {
  cyan: 'border-cyan-500/25 hover:border-cyan-400/50',
  green: 'border-emerald-500/25 hover:border-emerald-400/50',
  amber: 'border-amber-500/25 hover:border-amber-400/50',
  crimson: 'border-rose-500/35 hover:border-rose-400/60',
  blue: 'border-blue-500/25 hover:border-blue-400/50',
  purple: 'border-purple-500/25 hover:border-purple-400/50',
};

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  glowColor = 'cyan',
  enableHover3D = true,
  enableFloating = false,
  floatDelay = 0,
  floatDuration = 4.5,
  ...props
}) => {
  return (
    <motion.div
      {...props}
      animate={
        enableFloating
          ? {
              y: [0, -6, 0, 6, 0],
              transition: {
                duration: floatDuration,
                delay: floatDelay,
                repeat: Infinity,
                ease: 'easeInOut',
              },
            }
          : props.animate
      }
      whileHover={
        enableHover3D
          ? {
              scale: 1.012,
              rotateX: 1.2,
              rotateY: -1.2,
              boxShadow: `0 16px 40px -4px ${GLOW_MAP[glowColor]}`,
            }
          : undefined
      }
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      style={{ transformStyle: 'preserve-3d', ...props.style }}
      className={`relative rounded-xl border bg-[#0A1A2E]/75 p-4 backdrop-blur-xl transition-all duration-300 shadow-2xl ${BORDER_MAP[glowColor]} ${className}`}
    >
      {/* Top bevel light bar */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
      
      {/* Corner brackets */}
      <div className="pointer-events-none absolute top-1 left-1 w-2 h-2 border-t border-l border-cyan-400/40" />
      <div className="pointer-events-none absolute top-1 right-1 w-2 h-2 border-t border-r border-cyan-400/40" />
      <div className="pointer-events-none absolute bottom-1 left-1 w-2 h-2 border-b border-l border-cyan-400/40" />
      <div className="pointer-events-none absolute bottom-1 right-1 w-2 h-2 border-b border-r border-cyan-400/40" />

      {children}
    </motion.div>
  );
};
