import type { Edge, Node } from 'reactflow';

export type SysMLNodeKind =
  | 'block-definition'
  | 'internal-block'
  | 'requirement'
  | 'activity'
  | 'parametric'
  | 'use-case'
  | 'state'
  | 'state-machine'
  | 'sequence-lifeline'
  | 'activity-control';

export type SysMLEdgeKind =
  | 'dependency'
  | 'satisfy'
  | 'verify'
  | 'allocate'
  | 'refine'
  | 'include'
  | 'extend'
  | 'transition'
  | 'message'
  | 'control-flow';

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
  controlType?: 'fork' | 'join' | 'decision' | 'merge';
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

export interface SysMLActivityControlSpec {
  id: string;
  name: string;
  controlType: 'fork' | 'join' | 'decision' | 'merge';
  documentation?: string;
}

export interface SysMLUseCaseSpec {
  id: string;
  name: string;
  stereotype?: string;
  description?: string;
  actors?: string[];
  includes?: string[];
  extends?: string[];
  status?: 'draft' | 'reviewed' | 'approved' | 'deprecated';
}

export interface SysMLStateSpec {
  id: string;
  name: string;
  entryAction?: string;
  exitAction?: string;
  doActivity?: string;
  status?: 'draft' | 'reviewed' | 'approved' | 'deprecated';
}

export interface SysMLStateMachineSpec {
  id: string;
  name: string;
  stereotype?: string;
  states: SysMLStateSpec[];
}

export interface SysMLStateTransitionSpec {
  id: string;
  source: string;
  target: string;
  trigger?: string;
  guard?: string;
  effect?: string;
}

export interface SysMLSequenceLifelineSpec {
  id: string;
  name: string;
  classifier?: string;
  stereotype?: string;
}

export interface SysMLSequenceMessageSpec {
  id: string;
  type: 'sync' | 'async' | 'return';
  source: string;
  target: string;
  label: string;
  guard?: string;
}

export interface SysMLRelationshipSpec {
  id: string;
  type: SysMLEdgeKind;
  source: string;
  target: string;
  label?: string;
  rationale?: string;
  trigger?: string;
  guard?: string;
  effect?: string;
}

export type SysMLNodeSpec =
  | { kind: 'requirement'; spec: SysMLRequirementSpec }
  | { kind: 'block-definition'; spec: SysMLBlockSpec }
  | { kind: 'internal-block'; spec: SysMLBlockSpec }
  | { kind: 'activity'; spec: SysMLActivitySpec }
  | { kind: 'parametric'; spec: SysMLParametricSpec }
  | { kind: 'use-case'; spec: SysMLUseCaseSpec }
  | { kind: 'state'; spec: SysMLStateSpec }
  | { kind: 'state-machine'; spec: SysMLStateMachineSpec }
  | { kind: 'sequence-lifeline'; spec: SysMLSequenceLifelineSpec }
  | { kind: 'activity-control'; spec: SysMLActivityControlSpec };

export type SysMLReactFlowNode = Node<SysMLNodeData>;
export type SysMLReactFlowEdge = Edge<SysMLEdgeData>;

export interface SysMLEdgeData {
  kind: SysMLEdgeKind;
  label?: string;
  rationale?: string;
  trigger?: string;
  guard?: string;
  effect?: string;
}
