export interface Screen {
  id: string;
  name: string;
  features: Feature[];
}

export interface Feature {
  id: string;
  name: string;
  description: string;
  connections: string[];
}

export interface FlowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: { label: string; screen?: Screen; feature?: Feature; highlighted?: boolean };
  className?: string;
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  className?: string;
}

export interface SearchResult {
  screenId: string;
  featureIds: string[];
}