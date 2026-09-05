import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RotateCw } from 'lucide-react';
import { soundEffects } from '../../services/soundEffects';

interface FlipCardProps {
  front: React.ReactNode;
  back: React.ReactNode;
  className?: string;
  glowColor?: 'cyan' | 'green' | 'amber' | 'crimson';
  enableManualFlip?: boolean;
}

export const FlipCard: React.FC<FlipCardProps> = ({
  front,
  back,
  className = '',
  enableManualFlip = true,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    if (!enableManualFlip) return;
    setIsFlipped(!isFlipped);
    soundEffects.playClick();
  };

  return (
    <div
      className={`group relative perspective-1000 cursor-pointer ${className}`}
      onClick={handleFlip}
    >
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.55, ease: [0.23, 1, 0.32, 1] }}
        style={{ transformStyle: 'preserve-3d' }}
        className="relative w-full h-full min-h-[140px]"
      >
        {/* Front Face */}
        <div
          className="absolute inset-0 w-full h-full backface-hidden"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {front}
          {enableManualFlip && (
            <button
              type="button"
              aria-label="Flip card for diagnostic details"
              className="absolute top-2.5 right-2.5 p-1 rounded-md text-cyan-400/40 hover:text-cyan-300 hover:bg-cyan-950/40 transition-colors"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Back Face */}
        <div
          className="absolute inset-0 w-full h-full backface-hidden"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          {back}
          {enableManualFlip && (
            <button
              type="button"
              aria-label="Flip back to overview"
              className="absolute top-2.5 right-2.5 p-1 rounded-md text-cyan-400/60 hover:text-cyan-300 hover:bg-cyan-950/40 transition-colors"
            >
              <RotateCw className="w-3.5 h-3.5 rotate-180" />
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
