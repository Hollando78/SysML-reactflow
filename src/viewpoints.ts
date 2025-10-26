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
    'block-definition',
    'action-definition',
    'port-definition',
    'item-definition',
    'parametric'
  ],
  includeEdgeKinds: ['specialization', 'definition', 'dependency', 'flow-connection']
};

export const usageStructureViewpoint: SysMLViewpoint = {
  id: 'sysml.usageStructure',
  name: 'Usage Structure Viewpoint',
  description: 'Shows part, port, action, and item usages mapped back to their definitions.',
  includeNodeKinds: ['part-usage', 'port-usage', 'action-usage', 'item-usage', 'activity'],
  includeEdgeKinds: ['definition', 'dependency', 'allocate', 'action-flow', 'flow-connection']
};

export const behaviorControlViewpoint: SysMLViewpoint = {
  id: 'sysml.behaviorControl',
  name: 'Behavior & Control Viewpoint',
  description: 'Captures activities, actions, and control nodes with their control and action flows.',
  includeNodeKinds: ['activity', 'action-definition', 'action-usage', 'activity-control'],
  includeEdgeKinds: ['control-flow', 'action-flow', 'dependency']
};

export const interactionViewpoint: SysMLViewpoint = {
  id: 'sysml.interaction',
  name: 'Interaction Viewpoint',
  description: 'Sequence lifelines and messages for interaction scenarios.',
  includeNodeKinds: ['sequence-lifeline'],
  includeEdgeKinds: ['message']
};

export const stateViewpoint: SysMLViewpoint = {
  id: 'sysml.state',
  name: 'State Viewpoint',
  description: 'State machines, states, and transitions as described in SysML v2 Module 5.',
  includeNodeKinds: ['state-machine', 'state'],
  includeEdgeKinds: ['transition']
};

export const requirementViewpoint: SysMLViewpoint = {
  id: 'sysml.requirement',
  name: 'Requirement Viewpoint',
  description: 'Requirement usages with satisfy/refine/verify relationships.',
  includeNodeKinds: ['requirement'],
  includeEdgeKinds: ['satisfy', 'refine', 'verify', 'dependency']
};

export const sysmlViewpoints = {
  structuralDefinitionViewpoint,
  usageStructureViewpoint,
  behaviorControlViewpoint,
  interactionViewpoint,
  stateViewpoint,
  requirementViewpoint
};
