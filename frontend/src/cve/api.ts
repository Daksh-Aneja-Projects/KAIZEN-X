import { OntologyCategory, CognitiveEvent } from './ontology';
import { CognitiveSnapshot } from './engine';
import { ReactNode } from 'react';

export interface InspectorView {
  title: string;
  provenanceDetails?: any;
  history?: any[];
  relatedObjects?: string[];
}

export interface CognitivePlugin {
  id: string;
  name: string;
  consumes: OntologyCategory[]; 
  render: (state: CognitiveSnapshot) => ReactNode;
  inspect?: (objectId: string) => InspectorView | null;
  replay?: (time: number) => void;
}
