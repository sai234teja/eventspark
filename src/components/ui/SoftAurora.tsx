'use client';

import React, { useEffect, useRef } from 'react';

interface SoftAuroraProps {
  speed?: number;
  scale?: number;
  brightness?: number;
  color1?: string;
  color2?: string;
  noiseFrequency?: number;
  noiseAmplitude?: number;
  bandHeight?: number;
  bandSpread?: number;
  octaveDecay?: number;
  layerOffset?: number;
  colorSpeed?: number;
  enableMouseInteraction?: boolean;
  mouseInfluence?: number;
}

export function SoftAurora({
  speed = 0.6,
  scale = 1.5,
  brightness = 1,
  color1 = '#f7f7f7',
  color2 = '#e100ff',
  enableMouseInteraction = false,
  mouseInfluence = 0.25,
}: SoftAuroraProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!enableMouseInteraction || !containerRef.current) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      
      containerRef.current.style.setProperty('--mouse-x', x.toString());
      containerRef.current.style.setProperty('--mouse-y', y.toString());
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [enableMouseInteraction]);

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none w-full h-full"
      style={{
        opacity: brightness,
        transform: `scale(${scale})`,
        '--mouse-x': '0.5',
        '--mouse-y': '0.5',
      } as React.CSSProperties}
    >
      <div 
        className="absolute inset-0 opacity-60 mix-blend-screen animate-aurora-1"
        style={{
          background: `radial-gradient(circle at calc(var(--mouse-x, 0.5) * 100%) calc(var(--mouse-y, 0.5) * 100%), ${color1} 0%, transparent 50%)`,
          animationDuration: `${10 / speed}s`,
          transform: enableMouseInteraction ? `translate(calc((var(--mouse-x) - 0.5) * ${mouseInfluence * 100}px), calc((var(--mouse-y) - 0.5) * ${mouseInfluence * 100}px))` : 'none',
          transition: 'transform 0.2s ease-out'
        }}
      />
      <div 
        className="absolute inset-0 opacity-40 mix-blend-multiply animate-aurora-2"
        style={{
          background: `radial-gradient(circle at calc(100% - (var(--mouse-x, 0.5) * 100%)) calc(100% - (var(--mouse-y, 0.5) * 100%)), ${color2} 0%, transparent 60%)`,
          animationDuration: `${14 / speed}s`,
          transform: enableMouseInteraction ? `translate(calc((0.5 - var(--mouse-x)) * ${mouseInfluence * 100}px), calc((0.5 - var(--mouse-y)) * ${mouseInfluence * 100}px))` : 'none',
          transition: 'transform 0.2s ease-out'
        }}
      />
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes aurora-1 {
          0% { transform: scale(1) translate(0, 0); }
          33% { transform: scale(1.2) translate(10%, -10%); }
          66% { transform: scale(0.9) translate(-10%, 10%); }
          100% { transform: scale(1) translate(0, 0); }
        }
        @keyframes aurora-2 {
          0% { transform: scale(1) translate(0, 0); }
          33% { transform: scale(1.3) translate(-15%, 5%); }
          66% { transform: scale(0.8) translate(15%, -15%); }
          100% { transform: scale(1) translate(0, 0); }
        }
      `}} />
    </div>
  );
}
