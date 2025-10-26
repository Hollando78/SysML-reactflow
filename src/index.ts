export { SysMLDiagram, type SysMLDiagramProps } from './SysMLDiagram';
export { sysmlNodeTypes } from './nodes';
export { sysmlEdgeTypes } from './edges';
export {
  createRequirementNode,
  createBlockNode,
  createActivityNode,
  createParametricNode,
  createRelationshipEdge,
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
  SysMLReactFlowEdge,
  SysMLReactFlowNode,
  SysMLRelationshipSpec,
  SysMLRequirementSpec
} from './types';
