import type { XYPosition } from 'reactflow';

import type {
  SysMLEdgeKind,
  SysMLNodeKind,
  SysMLNodeSpec,
  SysMLRelationshipSpec
} from './types';
import { createEdgesFromRelationships, createNodesFromSpecs } from './factories';

export interface SysMLModel {
  nodes: SysMLNodeSpec[];
  relationships: SysMLRelationshipSpec[];
}

export interface SysMLViewpoint {
  id: string;
  name: string;
  description: string;
  includeNodeKinds: SysMLNodeKind[];
  includeEdgeKinds?: SysMLEdgeKind[];
  nodeFilter?: (spec: SysMLNodeSpec) => boolean;
  relationshipFilter?: (relationship: SysMLRelationshipSpec) => boolean;
}

export interface ViewMaterializationOptions {
  positions?: Record<string, Partial<XYPosition>>;
}

export const realizeViewpoint = (
  model: SysMLModel,
  viewpoint: SysMLViewpoint,
  options?: ViewMaterializationOptions
) => {
  const nodes = createNodesFromSpecs(
    model.nodes.filter(
      (spec) =>
        viewpoint.includeNodeKinds.includes(spec.kind) &&
        (viewpoint.nodeFilter ? viewpoint.nodeFilter(spec) : true)
    ),
    options?.positions ?? {}
  );

  const edges = createEdgesFromRelationships(
    model.relationships.filter((relationship) => {
      const kindIncluded = viewpoint.includeEdgeKinds
        ? viewpoint.includeEdgeKinds.includes(relationship.type)
        : true;
      const passesFilter = viewpoint.relationshipFilter ? viewpoint.relationshipFilter(relationship) : true;
      return kindIncluded && passesFilter;
    })
  );

  return { nodes, edges };
};

export const structuralDefinitionViewpoint: SysMLViewpoint = {
  id: 'sysml.structuralDefinition',
  name: 'Structural Definition Viewpoint',
  description:
    'Focuses on part/action/port/item definitions and the specialization chains that tie them together as described in the SysML v2 specification.',
  includeNodeKinds: [
    'part-definition',
    'action-definition',
    'port-definition',
    'item-definition',
    'attribute-definition',
    'connection-definition',
    'constraint-definition',
    'calculation-definition'
  ],
  includeEdgeKinds: ['specialization', 'definition', 'dependency', 'flow-connection']
};

export const usageStructureViewpoint: SysMLViewpoint = {
  id: 'sysml.usageStructure',
  name: 'Usage Structure Viewpoint',
  description: 'Shows part, port, action, and item usages mapped back to their definitions.',
  includeNodeKinds: ['part-usage', 'port-usage', 'action-usage', 'item-usage'],
  includeEdgeKinds: ['definition', 'dependency', 'allocate', 'action-flow', 'flow-connection']
};

export const behaviorControlViewpoint: SysMLViewpoint = {
  id: 'sysml.behaviorControl',
  name: 'Behavior & Control Viewpoint',
  description: 'Captures actions and control nodes with their control and action flows.',
  includeNodeKinds: ['action-definition', 'action-usage', 'activity-control', 'perform-action'],
  includeEdgeKinds: ['control-flow', 'action-flow', 'dependency']
};

export const interactionViewpoint: SysMLViewpoint = {
  id: 'sysml.interaction',
  name: 'Interaction Viewpoint',
  description: 'Sequence lifelines and messages for interaction scenarios.',
  includeNodeKinds: ['sequence-lifeline', 'interaction'],
  includeEdgeKinds: ['message', 'succession']
};

export const stateViewpoint: SysMLViewpoint = {
  id: 'sysml.state',
  name: 'State Viewpoint',
  description: 'State machines, states, and transitions as described in SysML v2 Module 5.',
  includeNodeKinds: ['state-machine', 'state', 'state-definition', 'state-usage', 'transition-usage', 'exhibit-state'],
  includeEdgeKinds: ['transition', 'succession', 'succession-as-usage']
};

export const requirementViewpoint: SysMLViewpoint = {
  id: 'sysml.requirement',
  name: 'Requirement Viewpoint',
  description: 'Requirement definitions and usages with satisfy/refine/verify relationships.',
  includeNodeKinds: [
    'requirement-definition', 'requirement-usage',
    'constraint-definition', 'constraint-usage',
    'concern-definition', 'concern-usage'
  ],
  includeEdgeKinds: ['satisfy', 'refine', 'verify', 'dependency', 'composition', 'specialization']
};

export const useCaseViewpoint: SysMLViewpoint = {
  id: 'sysml.useCase',
  name: 'Use Case Viewpoint',
  description: 'Use case definitions and usages with include/extend relationships.',
  includeNodeKinds: ['use-case-definition', 'use-case-usage', 'part-usage'],
  includeEdgeKinds: ['include', 'extend', 'association', 'dependency']
};

export const verificationViewpoint: SysMLViewpoint = {
  id: 'sysml.verification',
  name: 'Verification Viewpoint',
  description: 'Verification and analysis cases with their requirement relationships.',
  includeNodeKinds: [
    'verification-case-definition', 'verification-case-usage',
    'analysis-case-definition', 'analysis-case-usage',
    'requirement-definition', 'requirement-usage'
  ],
  includeEdgeKinds: ['verify', 'satisfy', 'refine', 'dependency']
};

export const sysmlViewpoints = {
  structuralDefinitionViewpoint,
  usageStructureViewpoint,
  behaviorControlViewpoint,
  interactionViewpoint,
  stateViewpoint,
  requirementViewpoint,
  useCaseViewpoint,
  verificationViewpoint
};
