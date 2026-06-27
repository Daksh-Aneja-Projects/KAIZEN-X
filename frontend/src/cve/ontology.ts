export type ProvenanceType = 
  | 'Observed'
  | 'Derived'
  | 'Retrieved'
  | 'Predicted'
  | 'Simulated'
  | 'Inferred'
  | 'Human Input';

export interface Provenance {
  type: ProvenanceType;
  sourceId?: string; // ID of the tool, agent, or sensor
  timestamp: number;
}

export type OntologyCategory = 
  | 'Observation'
  | 'Memory'
  | 'Attention'
  | 'Reasoning'
  | 'Evidence'
  | 'Decision'
  | 'Execution'
  | 'Learning';

export interface BaseEvent {
  id: string;
  category: OntologyCategory;
  subCategory: string; // e.g., 'User Prompt', 'Working Memory'
  provenance: Provenance;
  payload: any;
}

export interface ObservationEvent extends BaseEvent {
  category: 'Observation';
  subCategory: 'User Prompt' | 'Sensor Event' | 'System Update' | 'Message';
  payload: {
    entity: string;
    value: any;
  };
}

export interface MemoryEvent extends BaseEvent {
  category: 'Memory';
  subCategory: 'Working Memory' | 'Long-term Memory' | 'Vector Retrieval' | 'Graph Retrieval';
  payload: {
    concept: string;
    details: any;
    confidence: number;
  };
}

export interface AttentionEvent extends BaseEvent {
  category: 'Attention';
  subCategory: 'Resource Allocation' | 'Model Focus';
  payload: {
    target: string;
    intensity: number; // 0.0 to 1.0
  };
}

export interface ReasoningEvent extends BaseEvent {
  category: 'Reasoning';
  subCategory: 'Hypothesis' | 'Agent Debate' | 'Simulation';
  payload: {
    claim: string;
    probability?: number;
    support?: string[];
    opposition?: string[];
  };
}

export interface EvidenceEvent extends BaseEvent {
  category: 'Evidence';
  subCategory: 'Supporting' | 'Contradicting';
  payload: {
    targetId: string; // ID of hypothesis or decision it targets
    strength: number;
    description: string;
  };
}

export interface DecisionEvent extends BaseEvent {
  category: 'Decision';
  subCategory: 'Candidate' | 'Accepted' | 'Rejected' | 'Deferred';
  payload: {
    action: string;
    confidence: number;
    impact?: string;
  };
}

export interface ExecutionEvent extends BaseEvent {
  category: 'Execution';
  subCategory: 'Started' | 'Completed' | 'Failed';
  payload: {
    taskId: string;
    system: string;
  };
}

export interface LearningEvent extends BaseEvent {
  category: 'Learning';
  subCategory: 'Reflection' | 'Knowledge Update';
  payload: {
    insight: string;
    graphUpdates: any[];
  };
}

export type CognitiveEvent = 
  | ObservationEvent
  | MemoryEvent
  | AttentionEvent
  | ReasoningEvent
  | EvidenceEvent
  | DecisionEvent
  | ExecutionEvent
  | LearningEvent;
