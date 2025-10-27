import type { Edge, Node } from 'reactflow';

export type SysMLNodeKind =
  // Structural Elements
  | 'part-definition'
  | 'part-usage'
  | 'attribute-definition'
  | 'attribute-usage'
  | 'port-definition'
  | 'port-usage'
  | 'item-definition'
  | 'item-usage'
  | 'connection-definition'
  | 'connection-usage'
  | 'interface-definition'
  | 'interface-usage'
  | 'allocation-definition'
  | 'allocation-usage'
  | 'reference-usage'
  | 'occurrence-definition'
  | 'occurrence-usage'
  // Behavioral Elements
  | 'action-definition'
  | 'action-usage'
  | 'activity-control'
  | 'calculation-definition'
  | 'calculation-usage'
  | 'perform-action'
  | 'send-action'
  | 'accept-action'
  | 'assignment-action'
  | 'if-action'
  | 'for-loop-action'
  | 'while-loop-action'
  | 'state'
  | 'state-machine'
  | 'state-definition'
  | 'state-usage'
  | 'transition-usage'
  | 'exhibit-state'
  // Requirements & Cases
  | 'requirement-definition'
  | 'requirement-usage'
  | 'constraint-definition'
  | 'constraint-usage'
  | 'verification-case-definition'
  | 'verification-case-usage'
  | 'analysis-case-definition'
  | 'analysis-case-usage'
  | 'use-case-definition'
  | 'use-case-usage'
  | 'concern-definition'
  | 'concern-usage'
  // Organizational Elements
  | 'package'
  | 'library-package'
  // Interactions
  | 'sequence-lifeline'
  | 'interaction'
  // Metadata
  | 'metadata-definition'
  | 'metadata-usage'
  | 'comment'
  | 'documentation';

export type SysMLEdgeKind =
  // Dependency Relationships
  | 'dependency'
  // Requirement Relationships
  | 'satisfy'
  | 'verify'
  | 'refine'
  // Allocation
  | 'allocate'
  // Use Case Relationships
  | 'include'
  | 'extend'
  // State Machine Relationships
  | 'transition'
  // Interaction Relationships
  | 'message'
  | 'succession'
  | 'succession-as-usage'
  // Flow Relationships
  | 'control-flow'
  | 'flow-connection'
  | 'item-flow'
  | 'action-flow'
  // Type Relationships
  | 'specialization'
  | 'conjugation'
  | 'feature-typing'
  | 'subsetting'
  | 'redefinition'
  | 'type-featuring'
  // Definition/Usage Relationships
  | 'definition'
  | 'feature-membership'
  | 'owning-membership'
  | 'variant-membership'
  // Connector Relationships
  | 'binding-connector'
  | 'connector-as-usage'
  // Feature Relationships
  | 'feature-chaining'
  | 'feature-inverting'
  | 'feature-value'
  // Composition
  | 'composition'
  | 'aggregation';

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
  elementKind?: 'definition' | 'usage';
  baseDefinition?: string;
  redefines?: string[];
  subsets?: string[];
  controlType?: 'fork' | 'join' | 'decision' | 'merge';
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

export interface SysMLPartDefinitionSpec {
  id: string;
  name: string;
  stereotype?: string;
  description?: string;
  attributes?: SysMLPropertySpec[];
  ports?: SysMLPortSpec[];
  actions?: string[];
  states?: string[];
}

export interface SysMLPartUsageSpec {
  id: string;
  name: string;
  definition?: string;
  stereotype?: string;
  description?: string;
  redefines?: string[];
  subsets?: string[];
  attributes?: SysMLPropertySpec[];
  ports?: SysMLPortSpec[];
  parts?: string[];
}

export interface SysMLActionDefinitionSpec {
  id: string;
  name: string;
  stereotype?: string;
  description?: string;
  inputs?: SysMLPropertySpec[];
  outputs?: SysMLPropertySpec[];
}

export interface SysMLActionUsageSpec extends SysMLActionDefinitionSpec {
  definition?: string;
  redefines?: string[];
}

export interface SysMLPortDefinitionSpec {
  id: string;
  name: string;
  stereotype?: string;
  description?: string;
  direction?: 'in' | 'out' | 'inout';
  items?: SysMLPropertySpec[];
}

export interface SysMLPortUsageSpec extends SysMLPortDefinitionSpec {
  definition?: string;
}

export interface SysMLItemDefinitionSpec {
  id: string;
  name: string;
  stereotype?: string;
  description?: string;
  unit?: string;
  quantityKind?: string;
}

export interface SysMLItemUsageSpec extends SysMLItemDefinitionSpec {
  definition?: string;
}

export interface SysMLActivityControlSpec {
  id: string;
  name: string;
  controlType: 'fork' | 'join' | 'decision' | 'merge';
  documentation?: string;
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

// Attribute Definition and Usage
export interface SysMLAttributeDefinitionSpec {
  id: string;
  name: string;
  stereotype?: string;
  description?: string;
  type?: string;
  defaultValue?: string;
  isAbstract?: boolean;
}

export interface SysMLAttributeUsageSpec {
  id: string;
  name: string;
  definition?: string;
  stereotype?: string;
  description?: string;
  type?: string;
  value?: string;
  isReadOnly?: boolean;
  isDerived?: boolean;
  redefines?: string[];
  subsets?: string[];
}

// Connection Definition and Usage
export interface SysMLConnectionDefinitionSpec {
  id: string;
  name: string;
  stereotype?: string;
  description?: string;
  ends?: SysMLPropertySpec[];
  attributes?: SysMLPropertySpec[];
  isAbstract?: boolean;
}

export interface SysMLConnectionUsageSpec {
  id: string;
  name: string;
  definition?: string;
  stereotype?: string;
  description?: string;
  connectedParts?: string[];
  attributes?: SysMLPropertySpec[];
  redefines?: string[];
}

// Interface Definition and Usage
export interface SysMLInterfaceDefinitionSpec {
  id: string;
  name: string;
  stereotype?: string;
  description?: string;
  ports?: SysMLPortSpec[];
  attributes?: SysMLPropertySpec[];
  conjugate?: string;
}

export interface SysMLInterfaceUsageSpec {
  id: string;
  name: string;
  definition?: string;
  stereotype?: string;
  description?: string;
  connectedPorts?: string[];
}

// Allocation Definition and Usage
export interface SysMLAllocationDefinitionSpec {
  id: string;
  name: string;
  stereotype?: string;
  description?: string;
  source?: string;
  target?: string;
}

export interface SysMLAllocationUsageSpec {
  id: string;
  name: string;
  definition?: string;
  stereotype?: string;
  description?: string;
  allocatedFrom?: string;
  allocatedTo?: string;
}

// Reference Usage
export interface SysMLReferenceUsageSpec {
  id: string;
  name: string;
  stereotype?: string;
  description?: string;
  referencedElement?: string;
  redefines?: string[];
}

// Occurrence Definition and Usage
export interface SysMLOccurrenceDefinitionSpec {
  id: string;
  name: string;
  stereotype?: string;
  description?: string;
  isIndividual?: boolean;
  lifeClass?: string;
}

export interface SysMLOccurrenceUsageSpec {
  id: string;
  name: string;
  definition?: string;
  stereotype?: string;
  description?: string;
  portionOf?: string;
  isSnapshot?: boolean;
}

// Calculation Definition and Usage
export interface SysMLCalculationDefinitionSpec {
  id: string;
  name: string;
  stereotype?: string;
  description?: string;
  inputs?: SysMLPropertySpec[];
  outputs?: SysMLPropertySpec[];
  expression?: string;
  returnResult?: string;
}

export interface SysMLCalculationUsageSpec {
  id: string;
  name: string;
  definition?: string;
  stereotype?: string;
  description?: string;
  inputs?: SysMLPropertySpec[];
  outputs?: SysMLPropertySpec[];
  calculationBody?: string;
}

// Advanced Action Types
export interface SysMLPerformActionSpec {
  id: string;
  name: string;
  stereotype?: string;
  performedAction?: string;
  inputs?: SysMLPropertySpec[];
  outputs?: SysMLPropertySpec[];
}

export interface SysMLSendActionSpec {
  id: string;
  name: string;
  stereotype?: string;
  payload?: string;
  target?: string;
  via?: string;
}

export interface SysMLAcceptActionSpec {
  id: string;
  name: string;
  stereotype?: string;
  payloadType?: string;
  via?: string;
  receiver?: string;
}

export interface SysMLAssignmentActionSpec {
  id: string;
  name: string;
  stereotype?: string;
  targetFeature?: string;
  valueExpression?: string;
}

export interface SysMLIfActionSpec {
  id: string;
  name: string;
  stereotype?: string;
  condition?: string;
  thenAction?: string;
  elseAction?: string;
}

export interface SysMLForLoopActionSpec {
  id: string;
  name: string;
  stereotype?: string;
  variable?: string;
  collection?: string;
  body?: string;
}

export interface SysMLWhileLoopActionSpec {
  id: string;
  name: string;
  stereotype?: string;
  condition?: string;
  body?: string;
}

// State Definition and Usage (proper v2 version)
export interface SysMLStateDefinitionSpec {
  id: string;
  name: string;
  stereotype?: string;
  description?: string;
  isParallel?: boolean;
  substates?: string[];
}

export interface SysMLStateUsageSpec {
  id: string;
  name: string;
  definition?: string;
  stereotype?: string;
  entryAction?: string;
  doAction?: string;
  exitAction?: string;
  substates?: string[];
}

export interface SysMLTransitionUsageSpec {
  id: string;
  name: string;
  source: string;
  target: string;
  trigger?: string;
  guard?: string;
  effect?: string;
}

export interface SysMLExhibitStateSpec {
  id: string;
  name: string;
  exhibitedState?: string;
  performer?: string;
}

// Requirement Definition and Usage (proper v2 version)
export interface SysMLRequirementDefinitionSpec {
  id: string;
  name: string;
  stereotype?: string;
  description?: string;
  text?: string;
  reqId?: string;
  subjectParameter?: string;
  assumeConstraint?: string[];
  requireConstraint?: string[];
  framedConcerns?: string[];
  actors?: string[];
}

export interface SysMLRequirementUsageSpec {
  id: string;
  name: string;
  definition?: string;
  stereotype?: string;
  text?: string;
  reqId?: string;
  subjectParameter?: string;
  assumeConstraint?: string[];
  requireConstraint?: string[];
  status?: 'draft' | 'reviewed' | 'approved' | 'deprecated';
}

// Constraint Definition and Usage
export interface SysMLConstraintDefinitionSpec {
  id: string;
  name: string;
  stereotype?: string;
  description?: string;
  expression?: string;
  isNegated?: boolean;
}

export interface SysMLConstraintUsageSpec {
  id: string;
  name: string;
  definition?: string;
  stereotype?: string;
  expression?: string;
  isNegated?: boolean;
}

// Verification Case Definition and Usage
export interface SysMLVerificationCaseDefinitionSpec {
  id: string;
  name: string;
  stereotype?: string;
  description?: string;
  verifiedRequirement?: string;
  subjectParameter?: string;
  objectiveRequirement?: string;
}

export interface SysMLVerificationCaseUsageSpec {
  id: string;
  name: string;
  definition?: string;
  stereotype?: string;
  verifiedRequirement?: string;
  verificationMethod?: 'analysis' | 'inspection' | 'test' | 'demonstration';
  status?: 'draft' | 'reviewed' | 'approved' | 'deprecated';
}

// Analysis Case Definition and Usage
export interface SysMLAnalysisCaseDefinitionSpec {
  id: string;
  name: string;
  stereotype?: string;
  description?: string;
  analysisAction?: string;
  resultExpression?: string;
  subjectParameter?: string;
}

export interface SysMLAnalysisCaseUsageSpec {
  id: string;
  name: string;
  definition?: string;
  stereotype?: string;
  analysisAction?: string;
  resultExpression?: string;
  status?: 'draft' | 'in-progress' | 'completed';
}

// Use Case Definition and Usage (proper v2 version)
export interface SysMLUseCaseDefinitionSpec {
  id: string;
  name: string;
  stereotype?: string;
  description?: string;
  includedUseCases?: string[];
  subjectParameter?: string;
  objectiveRequirement?: string;
}

export interface SysMLUseCaseUsageSpec {
  id: string;
  name: string;
  definition?: string;
  stereotype?: string;
  description?: string;
  actors?: string[];
  includes?: string[];
  extends?: string[];
  status?: 'draft' | 'reviewed' | 'approved' | 'deprecated';
}

// Concern Definition and Usage
export interface SysMLConcernDefinitionSpec {
  id: string;
  name: string;
  stereotype?: string;
  description?: string;
  text?: string;
}

export interface SysMLConcernUsageSpec {
  id: string;
  name: string;
  definition?: string;
  stereotype?: string;
  text?: string;
  stakeholders?: string[];
}

// Package and Library Package
export interface SysMLPackageSpec {
  id: string;
  name: string;
  stereotype?: string;
  description?: string;
  members?: string[];
  imports?: string[];
  visibility?: 'public' | 'private' | 'protected';
}

export interface SysMLLibraryPackageSpec {
  id: string;
  name: string;
  stereotype?: string;
  description?: string;
  isStandard?: boolean;
  members?: string[];
}

// Interaction
export interface SysMLInteractionSpec {
  id: string;
  name: string;
  stereotype?: string;
  description?: string;
  participants?: string[];
  messages?: string[];
}

// Metadata
export interface SysMLMetadataDefinitionSpec {
  id: string;
  name: string;
  stereotype?: string;
  description?: string;
  baseType?: string;
  attributes?: SysMLPropertySpec[];
}

export interface SysMLMetadataUsageSpec {
  id: string;
  name: string;
  definition?: string;
  metadataValues?: Record<string, string>;
  annotatedElement?: string;
}

export interface SysMLCommentSpec {
  id: string;
  body: string;
  locale?: string;
  annotatedElement?: string;
}

export interface SysMLDocumentationSpec {
  id: string;
  body: string;
  documentedElement?: string;
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
  // Structural Elements
  | { kind: 'part-definition'; spec: SysMLPartDefinitionSpec }
  | { kind: 'part-usage'; spec: SysMLPartUsageSpec }
  | { kind: 'attribute-definition'; spec: SysMLAttributeDefinitionSpec }
  | { kind: 'attribute-usage'; spec: SysMLAttributeUsageSpec }
  | { kind: 'port-definition'; spec: SysMLPortDefinitionSpec }
  | { kind: 'port-usage'; spec: SysMLPortUsageSpec }
  | { kind: 'item-definition'; spec: SysMLItemDefinitionSpec }
  | { kind: 'item-usage'; spec: SysMLItemUsageSpec }
  | { kind: 'connection-definition'; spec: SysMLConnectionDefinitionSpec }
  | { kind: 'connection-usage'; spec: SysMLConnectionUsageSpec }
  | { kind: 'interface-definition'; spec: SysMLInterfaceDefinitionSpec }
  | { kind: 'interface-usage'; spec: SysMLInterfaceUsageSpec }
  | { kind: 'allocation-definition'; spec: SysMLAllocationDefinitionSpec }
  | { kind: 'allocation-usage'; spec: SysMLAllocationUsageSpec }
  | { kind: 'reference-usage'; spec: SysMLReferenceUsageSpec }
  | { kind: 'occurrence-definition'; spec: SysMLOccurrenceDefinitionSpec }
  | { kind: 'occurrence-usage'; spec: SysMLOccurrenceUsageSpec }
  // Behavioral Elements
  | { kind: 'action-definition'; spec: SysMLActionDefinitionSpec }
  | { kind: 'action-usage'; spec: SysMLActionUsageSpec }
  | { kind: 'activity-control'; spec: SysMLActivityControlSpec }
  | { kind: 'calculation-definition'; spec: SysMLCalculationDefinitionSpec }
  | { kind: 'calculation-usage'; spec: SysMLCalculationUsageSpec }
  | { kind: 'perform-action'; spec: SysMLPerformActionSpec }
  | { kind: 'send-action'; spec: SysMLSendActionSpec }
  | { kind: 'accept-action'; spec: SysMLAcceptActionSpec }
  | { kind: 'assignment-action'; spec: SysMLAssignmentActionSpec }
  | { kind: 'if-action'; spec: SysMLIfActionSpec }
  | { kind: 'for-loop-action'; spec: SysMLForLoopActionSpec }
  | { kind: 'while-loop-action'; spec: SysMLWhileLoopActionSpec }
  | { kind: 'state'; spec: SysMLStateSpec }
  | { kind: 'state-machine'; spec: SysMLStateMachineSpec }
  | { kind: 'state-definition'; spec: SysMLStateDefinitionSpec }
  | { kind: 'state-usage'; spec: SysMLStateUsageSpec }
  | { kind: 'transition-usage'; spec: SysMLTransitionUsageSpec }
  | { kind: 'exhibit-state'; spec: SysMLExhibitStateSpec }
  // Requirements & Cases
  | { kind: 'requirement-definition'; spec: SysMLRequirementDefinitionSpec }
  | { kind: 'requirement-usage'; spec: SysMLRequirementUsageSpec }
  | { kind: 'constraint-definition'; spec: SysMLConstraintDefinitionSpec }
  | { kind: 'constraint-usage'; spec: SysMLConstraintUsageSpec }
  | { kind: 'verification-case-definition'; spec: SysMLVerificationCaseDefinitionSpec }
  | { kind: 'verification-case-usage'; spec: SysMLVerificationCaseUsageSpec }
  | { kind: 'analysis-case-definition'; spec: SysMLAnalysisCaseDefinitionSpec }
  | { kind: 'analysis-case-usage'; spec: SysMLAnalysisCaseUsageSpec }
  | { kind: 'use-case-definition'; spec: SysMLUseCaseDefinitionSpec }
  | { kind: 'use-case-usage'; spec: SysMLUseCaseUsageSpec }
  | { kind: 'concern-definition'; spec: SysMLConcernDefinitionSpec }
  | { kind: 'concern-usage'; spec: SysMLConcernUsageSpec }
  // Organizational Elements
  | { kind: 'package'; spec: SysMLPackageSpec }
  | { kind: 'library-package'; spec: SysMLLibraryPackageSpec }
  // Interactions
  | { kind: 'sequence-lifeline'; spec: SysMLSequenceLifelineSpec }
  | { kind: 'interaction'; spec: SysMLInteractionSpec }
  // Metadata
  | { kind: 'metadata-definition'; spec: SysMLMetadataDefinitionSpec }
  | { kind: 'metadata-usage'; spec: SysMLMetadataUsageSpec }
  | { kind: 'comment'; spec: SysMLCommentSpec }
  | { kind: 'documentation'; spec: SysMLDocumentationSpec };

export type SysMLReactFlowNode = Node<SysMLNodeData>;
export type SysMLReactFlowEdge = Edge<SysMLEdgeData>;

export interface SysMLRoutePoint {
  x: number;
  y: number;
}

export type SysMLEdgeRouting = 'orthogonal' | 'spline';

export interface SysMLEdgeRoute {
  points: SysMLRoutePoint[];
  routing: SysMLEdgeRouting;
}

export interface SysMLEdgeData {
  kind: SysMLEdgeKind;
  label?: string;
  rationale?: string;
  trigger?: string;
  guard?: string;
  effect?: string;
  route?: SysMLEdgeRoute;
}
