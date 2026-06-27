import { CognitiveEvent, OntologyCategory } from './ontology';

export interface CognitiveSnapshot {
  timestamp: number;
  workingMemory: any[];
  attention: Record<string, number>;
  hypotheses: any[];
  decisions: any[];
  activePhase: string;
}

export class CognitiveStateEngine {
  private events: CognitiveEvent[] = [];
  private snapshots: CognitiveSnapshot[] = [];
  
  constructor() {
    this.snapshots.push(this.getInitialState());
  }

  private getInitialState(): CognitiveSnapshot {
    return {
      timestamp: Date.now(),
      workingMemory: [],
      attention: {},
      hypotheses: [],
      decisions: [],
      activePhase: 'Idle',
    };
  }

  public dispatch(event: CognitiveEvent) {
    this.events.push(event);
    
    // Create new immutable snapshot
    const currentState = this.snapshots[this.snapshots.length - 1];
    const newState = this.reduce(currentState, event);
    this.snapshots.push(newState);
  }

  private reduce(state: CognitiveSnapshot, event: CognitiveEvent): CognitiveSnapshot {
    // Deep clone for immutability
    const next = JSON.parse(JSON.stringify(state));
    next.timestamp = event.provenance.timestamp;
    
    // Naive reducer for phase 1
    if (event.category === 'Observation') {
      next.activePhase = 'Observation';
    } else if (event.category === 'Memory') {
      next.activePhase = 'Memory Retrieval';
      next.workingMemory.push(event.payload);
    } else if (event.category === 'Attention') {
      next.attention[event.payload.target] = event.payload.intensity;
    } else if (event.category === 'Reasoning') {
      next.activePhase = 'Reasoning';
      if (event.subCategory === 'Hypothesis') {
        next.hypotheses.push(event.payload);
      }
    } else if (event.category === 'Decision') {
      next.activePhase = 'Decision';
      next.decisions.push(event.payload);
    }
    
    return next;
  }

  public getCurrentSnapshot(): CognitiveSnapshot {
    return this.snapshots[this.snapshots.length - 1];
  }

  public getSnapshotAt(timestamp: number): CognitiveSnapshot | null {
    // Find closest snapshot <= timestamp
    for (let i = this.snapshots.length - 1; i >= 0; i--) {
      if (this.snapshots[i].timestamp <= timestamp) {
        return this.snapshots[i];
      }
    }
    return this.snapshots[0] || null;
  }

  public getEvents(): CognitiveEvent[] {
    return this.events;
  }
}

// Global Singleton for the Engine
export const cveEngine = new CognitiveStateEngine();
