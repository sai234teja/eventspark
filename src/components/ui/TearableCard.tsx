"use client";

import { motion } from 'motion/react';
import { ReactNode } from 'react';

interface TearableCardProps {
  children: ReactNode;
  isTorn: boolean;
  onTearComplete?: () => void;
}

export function TearableCard({ children, isTorn, onTearComplete }: TearableCardProps) {
  return (
    <div className="relative w-full">
      {/* Top Half */}
      <motion.div
        className="absolute inset-0 w-full z-20"
        initial={{ y: 0, x: 0, rotate: 0, opacity: 1, scale: 1 }}
        animate={isTorn ? { y: -150, x: -50, rotate: -8, opacity: 0, scale: 1.1 } : { y: 0, x: 0, rotate: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, ease: [0.32, 0.72, 0, 1] }}
        style={{ 
          // Jagged tear path across the middle
          clipPath: 'polygon(0 0, 100% 0, 100% 45%, 80% 50%, 60% 42%, 40% 55%, 20% 45%, 0 52%)',
          pointerEvents: isTorn ? 'none' : 'auto'
        }}
        onAnimationComplete={() => {
          if (isTorn && onTearComplete) onTearComplete();
        }}
      >
        {children}
      </motion.div>

      {/* Bottom Half */}
      <motion.div
        className="absolute inset-0 w-full z-10"
        initial={{ y: 0, x: 0, rotate: 0, opacity: 1, scale: 1 }}
        animate={isTorn ? { y: 150, x: 50, rotate: 8, opacity: 0, scale: 1.1 } : { y: 0, x: 0, rotate: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, ease: [0.32, 0.72, 0, 1] }}
        style={{ 
          clipPath: 'polygon(0 52%, 20% 45%, 40% 55%, 60% 42%, 80% 50%, 100% 45%, 100% 100%, 0 100%)',
          pointerEvents: isTorn ? 'none' : 'auto'
        }}
      >
        {children}
      </motion.div>

      {/* Invisible placeholder to maintain size in the document flow */}
      <div className="opacity-0 pointer-events-none" aria-hidden="true">
        {children}
      </div>
    </div>
  );
}
