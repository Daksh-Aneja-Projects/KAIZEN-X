import React from 'react';
import { CognitivePlugin } from '../api';
import { CognitiveSnapshot } from '../engine';

export const CognitiveStatePlugin: CognitivePlugin = {
  id: 'state-plugin',
  name: 'Cognitive State View',
  consumes: ['Observation', 'Memory', 'Reasoning', 'Decision', 'Execution', 'Learning'],
  render: (state: CognitiveSnapshot) => {
    // Only show the last 3 items to keep it compact
    const memories = state.workingMemory.slice(-3);
    const hypotheses = state.hypotheses.slice(-3);
    const decisions = state.decisions.slice(-3);

    return (
      <div className="grid grid-cols-4 gap-px bg-[var(--color-border-subtle)] border-b border-[var(--color-border-subtle)] text-[10px] font-mono w-full">
        <div className="bg-[var(--color-background)] p-3">
           <h4 className="text-[var(--color-text-muted)] uppercase tracking-widest mb-2 font-bold flex items-center justify-between">
              Working Memory
              <span className="bg-[var(--color-primary)]/20 text-[var(--color-primary)] px-1 rounded-sm">{state.workingMemory.length}</span>
           </h4>
           <div className="flex flex-col gap-1.5 h-[60px] overflow-hidden">
             {memories.length === 0 ? <span className="text-gray-600 italic">No context retrieved...</span> : memories.map((m, i) => (
                <div key={i} className="text-gray-300 truncate"><span className="text-[var(--color-primary)] opacity-50 mr-1">&gt;</span> {m.concept || JSON.stringify(m)}</div>
             ))}
           </div>
        </div>

        <div className="bg-[var(--color-background)] p-3">
           <h4 className="text-[var(--color-text-muted)] uppercase tracking-widest mb-2 font-bold flex items-center justify-between">
              Attention Vector
              <span className="bg-[var(--color-warning)]/20 text-[var(--color-warning)] px-1 rounded-sm">{Object.keys(state.attention).length}</span>
           </h4>
           <div className="flex flex-col gap-1.5 h-[60px] overflow-hidden">
             {Object.keys(state.attention).length === 0 ? <span className="text-gray-600 italic">No focal points...</span> : Object.entries(state.attention).slice(-3).map(([key, val], i) => (
                <div key={i} className="flex justify-between text-gray-300">
                  <span className="truncate">{key}</span>
                  <span className="text-[var(--color-warning)]">{(val as number * 100).toFixed(0)}%</span>
                </div>
             ))}
           </div>
        </div>

        <div className="bg-[var(--color-background)] p-3">
           <h4 className="text-[var(--color-text-muted)] uppercase tracking-widest mb-2 font-bold flex items-center justify-between">
              Hypotheses
              <span className="bg-[var(--color-critical)]/20 text-[var(--color-critical)] px-1 rounded-sm">{state.hypotheses.length}</span>
           </h4>
           <div className="flex flex-col gap-1.5 h-[60px] overflow-hidden">
             {hypotheses.length === 0 ? <span className="text-gray-600 italic">No hypotheses...</span> : hypotheses.map((h, i) => (
                <div key={i} className="text-gray-300 truncate"><span className="text-[var(--color-critical)] opacity-50 mr-1">&gt;</span> {h.claim || JSON.stringify(h)}</div>
             ))}
           </div>
        </div>

        <div className="bg-[var(--color-background)] p-3">
           <h4 className="text-[var(--color-text-muted)] uppercase tracking-widest mb-2 font-bold flex items-center justify-between">
              Decisions
              <span className="bg-[var(--color-success)]/20 text-[var(--color-success)] px-1 rounded-sm">{state.decisions.length}</span>
           </h4>
           <div className="flex flex-col gap-1.5 h-[60px] overflow-hidden">
             {decisions.length === 0 ? <span className="text-gray-600 italic">No directives...</span> : decisions.map((d, i) => (
                <div key={i} className="text-gray-300 truncate"><span className="text-[var(--color-success)] opacity-50 mr-1">&gt;</span> {d.action || JSON.stringify(d)}</div>
             ))}
           </div>
        </div>
      </div>
    );
  }
};
