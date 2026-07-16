/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from 'motion/react';
import { useEffect } from 'react';

export interface MangaSoundEffect {
  id: string;
  text: string;
  x?: number; // Percent position from left (optional, or centered)
  y?: number; // Percent position from top (optional, or centered)
  size?: 'sm' | 'md' | 'lg' | 'xl';
  rotation?: number; // angle
  color?: string;
}

interface ImpactBurstProps {
  effects: MangaSoundEffect[];
  onComplete: (id: string) => void;
}

export function ImpactBurst({ effects, onComplete }: ImpactBurstProps) {
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <AnimatePresence>
        {effects.map((effect) => (
          <MangaBubble
            key={effect.id}
            effect={effect}
            onComplete={() => onComplete(effect.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

interface BubbleProps {
  key?: string;
  effect: MangaSoundEffect;
  onComplete: () => void;
}

function MangaBubble({ effect, onComplete }: BubbleProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 900); // Effect duration is 900ms
    return () => clearTimeout(timer);
  }, [effect.id, onComplete]);

  // Handle sizes (scaled beautifully for mobile vs desktop)
  const sizeClasses = {
    sm: 'text-xl md:text-3xl px-3 py-1.5',
    md: 'text-3xl md:text-5xl px-5 py-2.5',
    lg: 'text-5xl md:text-7xl px-7 py-3.5',
    xl: 'text-6xl md:text-9xl px-10 py-5',
  }[effect.size || 'md'];

  const colorStyle = effect.color || '#FF003C';

  // Custom styling with absolute wrapper container so translate(-50%, -50%) is preserved
  return (
    <div
      className="absolute select-none pointer-events-none flex items-center justify-center"
      style={{
        left: effect.x !== undefined ? `${effect.x}%` : '50%',
        top: effect.y !== undefined ? `${effect.y}%` : '50%',
        transform: 'translate(-50%, -50%)',
      }}
    >
      <motion.div
        initial={{ scale: 0, rotate: (effect.rotation || 0) - 20, opacity: 0 }}
        animate={{ 
          scale: [0, 1.3, 1], 
          rotate: [effect.rotation || 0, (effect.rotation || 0) + 5, effect.rotation || 0],
          opacity: [0, 1, 1, 0],
          y: [0, -15, -30]
        }}
        exit={{ scale: 1.5, opacity: 0 }}
        transition={{ 
          duration: 0.85, 
          times: [0, 0.15, 0.8, 1],
          ease: "easeOut"
        }}
        className="flex flex-col items-center justify-center"
      >
        {/* Visual Star/Burst behind the sound text */}
        <div className="relative flex items-center justify-center">
          {/* Jagged speed explosion */}
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: [1, 1.15, 1], rotate: [0, 45, 90] }}
            transition={{ duration: 0.5, repeat: 1 }}
            className="absolute w-48 h-48 md:w-64 md:h-64 opacity-20 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(circle, ${colorStyle} 10%, transparent 70%)`,
              clipPath: 'polygon(50% 0%, 55% 35%, 100% 30%, 65% 55%, 85% 100%, 50% 70%, 15% 100%, 35% 55%, 0% 30%, 45% 35%)'
            }}
          />
          
          {/* Impact spikes */}
          <div 
            className="absolute w-32 h-32 md:w-44 md:h-44 opacity-40 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle, #000 20%, transparent 60%)',
              clipPath: 'polygon(50% 0%, 53% 40%, 90% 10%, 57% 47%, 100% 50%, 57% 53%, 90% 90%, 53% 60%, 50% 100%, 47% 60%, 10% 90%, 43% 53%, 0% 50%, 43% 47%, 10% 10%, 47% 40%)'
            }}
          />

          {/* Thick outline container for manga print authenticity */}
          <span 
            className={`relative font-brush text-white uppercase tracking-wider text-stroke-manga inline-block transform ${sizeClasses}`}
            style={{
              textShadow: `
                4px 4px 0px #000,
                -4px -4px 0px #000,
                4px -4px 0px #000,
                -4px 4px 0px #000,
                0px 6px 0px ${colorStyle},
                6px 6px 0px #000
              `
            }}
          >
            {effect.text}
          </span>
        </div>
      </motion.div>
    </div>
  );
}
