import React from 'react';
import { CognitivePlugin } from '../api';
import { CognitiveSnapshot } from '../engine';

const STAGES = [
  'Observation', 
  'Memory Retrieval', 
  'Hypothesis', 
  'Evidence', 
  'Simulation', 
  'Decision', 
  'Execution', 
  'Learning'
];

export const TimelinePlugin: CognitivePlugin = {
  id: 'timeline-plugin',
  name: 'Cognitive Timeline',
  consumes: ['Observation', 'Memory', 'Reasoning', 'Decision', 'Execution', 'Learning'],
  render: (state: CognitiveSnapshot) => {
    return (
      <div className="flex items-center gap-2 w-full justify-between px-4 py-2 border-b border-[var(--color-border-subtle)] bg-[var(--color-background)]">
        {STAGES.map((stage, idx) => {
          const isActive = state.activePhase === stage;
          return (
            <div key={stage} className="flex items-center gap-2">
              <div className={`text-[10px] font-mono tracking-wider transition-colors duration-500 ${isActive ? 'text-[var(--color-primary)] font-bold' : 'text-gray-600'}`}>
                {stage.toUpperCase()}
              </div>
              {idx < STAGES.length - 1 && (
                <div className={`h-[1px] w-4 transition-colors duration-500 ${isActive ? 'bg-[var(--color-primary)]' : 'bg-gray-800'}`} />
              )}
            </div>
          );
        })}
      </div>
    );
  }
};
