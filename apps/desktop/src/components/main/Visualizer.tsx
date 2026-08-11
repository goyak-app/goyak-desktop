import React from 'react';
import { DubbingStatus } from '../../types/audio';

interface VisualizerProps {
  status: DubbingStatus;
  activeLevel: number;
}

export const Visualizer: React.FC<VisualizerProps> = ({ status, activeLevel }) => {
  const isLive = status === 'listening' || status === 'translating' || status === 'playing';
  const barCount = 28;

  return (
    <div className="w-full h-16 bg-secondary/40 border border-border rounded-xl px-4 flex items-center justify-center space-x-1.5 rtl:space-x-reverse overflow-hidden">
      {Array.from({ length: barCount }).map((_, i) => {
        const factor = Math.sin((i / barCount) * Math.PI);
        const height = isLive
          ? Math.max(8, Math.min(52, (activeLevel * factor * (0.6 + Math.sin(Date.now() / 200 + i) * 0.4))))
          : 6;

        return (
          <div
            key={i}
            className={`w-1.5 rounded-full transition-all duration-75 ${
              isLive
                ? i % 2 === 0
                  ? 'bg-violet-500'
                  : 'bg-emerald-500'
                : 'bg-zinc-800'
            }`}
            style={{ height: `${height}px` }}
          />
        );
      })}
    </div>
  );
};
