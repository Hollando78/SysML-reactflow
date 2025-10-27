export { SysMLDiagram, type SysMLDiagramProps } from './SysMLDiagram';
export { sysmlNodeTypes } from './nodes';
export { sysmlEdgeTypes } from './edges';
export {
  // Base factories (still used for some v2 elements)
  createActivityControlNode,
  createPartDefinitionNode,
  createPartUsageNode,
  createActionDefinitionNode,
  createActionUsageNode,
  createPortDefinitionNode,
  createPortUsageNode,
  createItemDefinitionNode,
  createItemUsageNode,
  createStateNode,
  createStateMachineNode,
  createSequenceLifelineNode,
  // SysML v2 Structural Element Factories
  createAttributeDefinitionNode,
  createAttributeUsageNode,
  createConnectionDefinitionNode,
  createConnectionUsageNode,
  createInterfaceDefinitionNode,
  createInterfaceUsageNode,
  createAllocationDefinitionNode,
  createAllocationUsageNode,
  createReferenceUsageNode,
  createOccurrenceDefinitionNode,
  createOccurrenceUsageNode,
  // SysML v2 Behavioral Element Factories
  createCalculationDefinitionNode,
  createCalculationUsageNode,
  createPerformActionNode,
  createSendActionNode,
  createAcceptActionNode,
  createAssignmentActionNode,
  createIfActionNode,
  createForLoopActionNode,
  createWhileLoopActionNode,
  createStateDefinitionNode,
  createStateUsageNode,
  createTransitionUsageNode,
  createExhibitStateNode,
  // SysML v2 Requirements & Cases Factories
  createRequirementDefinitionNode,
  createRequirementUsageNode,
  createConstraintDefinitionNode,
  createConstraintUsageNode,
  createVerificationCaseDefinitionNode,
  createVerificationCaseUsageNode,
  createAnalysisCaseDefinitionNode,
  createAnalysisCaseUsageNode,
  createUseCaseDefinitionNode,
  createUseCaseUsageNode,
  createConcernDefinitionNode,
  createConcernUsageNode,
  // SysML v2 Organizational Factories
  createPackageNode,
  createLibraryPackageNode,
  // SysML v2 Interaction Factories
  createInteractionNode,
  // SysML v2 Metadata Factories
  createMetadataDefinitionNode,
  createMetadataUsageNode,
  createCommentNode,
  createDocumentationNode,
  // Edge factories
  createRelationshipEdge,
  createStateTransitionEdge,
  createSequenceMessageEdge,
  // Batch factories
  createNodesFromSpecs,
  createEdgesFromRelationships
} from './factories';
export {
  sysmlViewpoints,
  structuralDefinitionViewpoint,
  usageStructureViewpoint,
  behaviorControlViewpoint,
  interactionViewpoint,
  stateViewpoint,
  requirementViewpoint,
  realizeViewpoint
} from './viewpoints';
export type {
  // Core types
  SysMLNodeData,
  SysMLNodeKind,
  SysMLNodeSpec,
  SysMLEdgeData,
  SysMLEdgeKind,
  SysMLReactFlowEdge,
  SysMLReactFlowNode,
  SysMLRelationshipSpec,
  // Base specs (still used for some v2 elements)
  SysMLActivityControlSpec,
  SysMLActionDefinitionSpec,
  SysMLActionUsageSpec,
  SysMLItemDefinitionSpec,
  SysMLItemUsageSpec,
  SysMLPartDefinitionSpec,
  SysMLPartUsageSpec,
  SysMLPortDefinitionSpec,
  SysMLPortUsageSpec,
  SysMLStateSpec,
  SysMLStateMachineSpec,
  SysMLSequenceLifelineSpec,
  SysMLSequenceMessageSpec,
  SysMLStateTransitionSpec,
  // SysML v2 Structural Element Specs
  SysMLAttributeDefinitionSpec,
  SysMLAttributeUsageSpec,
  SysMLConnectionDefinitionSpec,
  SysMLConnectionUsageSpec,
  SysMLInterfaceDefinitionSpec,
  SysMLInterfaceUsageSpec,
  SysMLAllocationDefinitionSpec,
  SysMLAllocationUsageSpec,
  SysMLReferenceUsageSpec,
  SysMLOccurrenceDefinitionSpec,
  SysMLOccurrenceUsageSpec,
  // SysML v2 Behavioral Element Specs
  SysMLCalculationDefinitionSpec,
  SysMLCalculationUsageSpec,
  SysMLPerformActionSpec,
  SysMLSendActionSpec,
  SysMLAcceptActionSpec,
  SysMLAssignmentActionSpec,
  SysMLIfActionSpec,
  SysMLForLoopActionSpec,
  SysMLWhileLoopActionSpec,
  SysMLStateDefinitionSpec,
  SysMLStateUsageSpec,
  SysMLTransitionUsageSpec,
  SysMLExhibitStateSpec,
  // SysML v2 Requirements & Cases Specs
  SysMLRequirementDefinitionSpec,
  SysMLRequirementUsageSpec,
  SysMLConstraintDefinitionSpec,
  SysMLConstraintUsageSpec,
  SysMLVerificationCaseDefinitionSpec,
  SysMLVerificationCaseUsageSpec,
  SysMLAnalysisCaseDefinitionSpec,
  SysMLAnalysisCaseUsageSpec,
  SysMLUseCaseDefinitionSpec,
  SysMLUseCaseUsageSpec,
  SysMLConcernDefinitionSpec,
  SysMLConcernUsageSpec,
  // SysML v2 Organizational Specs
  SysMLPackageSpec,
  SysMLLibraryPackageSpec,
  // SysML v2 Interaction Specs
  SysMLInteractionSpec,
  // SysML v2 Metadata Specs
  SysMLMetadataDefinitionSpec,
  SysMLMetadataUsageSpec,
  SysMLCommentSpec,
  SysMLDocumentationSpec
} from './types';
export type { SysMLModel, SysMLViewpoint, ViewMaterializationOptions } from './viewpoints';
export {
  applyLayout,
  applyRecommendedLayout,
  recommendedLayouts,
  type LayoutOptions,
  type LayoutAlgorithm,
  type LayoutDirection
} from './layout';
