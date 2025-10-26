import type { Edge, Node } from 'reactflow';

export type SysMLNodeKind =
  | 'block-definition'
  | 'internal-block'
  | 'requirement'
  | 'activity'
  | 'parametric';

export type SysMLEdgeKind = 'dependency' | 'satisfy' | 'verify' | 'allocate' | 'refine';

export interface SysMLTag {
  key: string;
  value: string;
}

export interface SysMLCompartmentItem {
  label: string;
  value?: string;
  emphasis?: boolean;
}

export interface SysMLCompartment {
  title?: string;
  items: SysMLCompartmentItem[];
}

export interface SysMLNodeData {
  id: string;
  kind: SysMLNodeKind;
  name: string;
  stereotype?: string;
  documentation?: string;
  tags?: SysMLTag[];
  compartments?: SysMLCompartment[];
  status?: 'draft' | 'reviewed' | 'approved' | 'deprecated';
  emphasis?: string;
}

export interface SysMLRequirementSpec {
  id: string;
  name: string;
  stereotype?: string;
  text: string;
  verification?: string;
  risk?: 'low' | 'medium' | 'high';
  status?: 'draft' | 'reviewed' | 'approved' | 'deprecated';
  derivedFrom?: string[];
}

export interface SysMLPropertySpec {
  name: string;
  type?: string;
  multiplicity?: string;
  value?: string;
}

export interface SysMLPortSpec {
  name: string;
  type?: string;
  direction?: 'in' | 'out' | 'inout';
}

export interface SysMLBlockSpec {
  id: string;
  name: string;
  stereotype?: string;
  description?: string;
  parts?: SysMLPropertySpec[];
  values?: SysMLPropertySpec[];
  ports?: SysMLPortSpec[];
  status?: 'draft' | 'reviewed' | 'approved' | 'deprecated';
}

export interface SysMLActivitySpec {
  id: string;
  name: string;
  stereotype?: string;
  inputs?: SysMLPropertySpec[];
  outputs?: SysMLPropertySpec[];
  actions?: string[];
  status?: 'draft' | 'reviewed' | 'approved' | 'deprecated';
}

export interface SysMLParametricSpec {
  id: string;
  name: string;
  stereotype?: string;
  equation: string;
  parameters: SysMLPropertySpec[];
}

export interface SysMLRelationshipSpec {
  id: string;
  type: SysMLEdgeKind;
  source: string;
  target: string;
  label?: string;
  rationale?: string;
}

export type SysMLNodeSpec =
  | { kind: 'requirement'; spec: SysMLRequirementSpec }
  | { kind: 'block-definition'; spec: SysMLBlockSpec }
  | { kind: 'internal-block'; spec: SysMLBlockSpec }
  | { kind: 'activity'; spec: SysMLActivitySpec }
  | { kind: 'parametric'; spec: SysMLParametricSpec };

export type SysMLReactFlowNode = Node<SysMLNodeData>;
export type SysMLReactFlowEdge = Edge<SysMLEdgeData>;

export interface SysMLEdgeData {
  kind: SysMLEdgeKind;
  label?: string;
  rationale?: string;
}
