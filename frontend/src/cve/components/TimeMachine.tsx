import React from 'react';

interface TimeMachineProps {
  eventCount: number;
  currentIndex: number;
  onScrub: (index: number) => void;
}

export function TimeMachine({ eventCount, currentIndex, onScrub }: TimeMachineProps) {
  return (
    <div className="flex items-center gap-4 px-4 py-2 border-t border-[var(--color-border-subtle)] bg-[var(--color-background)] mt-auto">
      <div className="text-[10px] font-mono text-[var(--color-text-muted)] whitespace-nowrap">
        COGNITIVE REPLAY
      </div>
      <input 
        type="range" 
        min="0" 
        max={Math.max(0, eventCount - 1)} 
        value={currentIndex}
        onChange={(e) => onScrub(parseInt(e.target.value, 10))}
        className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-[var(--color-primary)]"
      />
      <div className="text-[10px] font-mono text-[var(--color-text-muted)] whitespace-nowrap">
        {currentIndex} / {Math.max(0, eventCount - 1)}
      </div>
    </div>
  );
}
