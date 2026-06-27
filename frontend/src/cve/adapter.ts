import { CognitiveEvent } from './ontology';

/**
 * Base interface for Cognitive Instrumentation Adapters.
 * Adapters are responsible for normalizing product-specific signals 
 * into the universal Cognitive Ontology.
 */
export interface CognitiveAdapter {
  connect(onEvent: (event: CognitiveEvent) => void): void;
  disconnect(): void;
}

/**
 * KaizenAdapter
 * Translates KAIZEN-X specific events (from WS or local mocks) into Semantic Events.
 */
export class KaizenAdapter implements CognitiveAdapter {
  private listener: ((event: CognitiveEvent) => void) | null = null;
  private interval: NodeJS.Timeout | null = null;

  public connect(onEvent: (event: CognitiveEvent) => void): void {
    this.listener = onEvent;
    
    // TODO: Connect to actual backend WebSocket
    // For now, simulate cognitive events for Phase 1 testing
    
    this.interval = setInterval(() => {
      if (!this.listener) return;
      
      const randomType = Math.random();
      const now = Date.now();

      if (randomType < 0.3) {
        this.listener({
          id: `obs-${now}`,
          category: 'Observation',
          subCategory: 'Sensor Event',
          provenance: { type: 'Observed', timestamp: now },
          payload: { entity: 'Supply Chain', value: 'High Latency Detected' }
        });
      } else if (randomType < 0.6) {
        this.listener({
          id: `mem-${now}`,
          category: 'Memory',
          subCategory: 'Working Memory',
          provenance: { type: 'Retrieved', timestamp: now },
          payload: { concept: 'Vendor Risk', details: 'Previous delay recorded', confidence: 0.85 }
        });
      } else if (randomType < 0.8) {
        this.listener({
          id: `attn-${now}`,
          category: 'Attention',
          subCategory: 'Resource Allocation',
          provenance: { type: 'Inferred', timestamp: now },
          payload: { target: 'Operations', intensity: Math.random() }
        });
      } else {
        this.listener({
          id: `hypo-${now}`,
          category: 'Reasoning',
          subCategory: 'Hypothesis',
          provenance: { type: 'Derived', timestamp: now },
          payload: { claim: 'Potential logistics failure', probability: 0.65 }
        });
      }
    }, 3000); // Emits an event every 3 seconds
  }

  public disconnect(): void {
    if (this.interval) {
      clearInterval(this.interval);
    }
    this.listener = null;
  }
}
