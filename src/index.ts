export { SysMLDiagram, type SysMLDiagramProps } from './SysMLDiagram';
export { sysmlNodeTypes } from './nodes';
export { sysmlEdgeTypes } from './edges';
export {
  createRequirementNode,
  createBlockNode,
  createActivityNode,
  createParametricNode,
  createUseCaseNode,
  createStateNode,
  createStateMachineNode,
  createSequenceLifelineNode,
  createRelationshipEdge,
  createStateTransitionEdge,
  createSequenceMessageEdge,
  createNodesFromSpecs,
  createEdgesFromRelationships
} from './factories';
export type {
  SysMLActivitySpec,
  SysMLBlockSpec,
  SysMLEdgeData,
  SysMLEdgeKind,
  SysMLNodeData,
  SysMLNodeKind,
  SysMLNodeSpec,
  SysMLParametricSpec,
  SysMLUseCaseSpec,
  SysMLStateSpec,
  SysMLStateMachineSpec,
  SysMLSequenceLifelineSpec,
  SysMLSequenceMessageSpec,
  SysMLReactFlowEdge,
  SysMLReactFlowNode,
  SysMLRelationshipSpec,
  SysMLStateTransitionSpec,
  SysMLRequirementSpec
} from './types';
