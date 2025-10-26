import type { XYPosition } from 'reactflow';

import type {
  SysMLActivitySpec,
  SysMLEdgeData,
  SysMLNodeData,
  SysMLNodeKind,
  SysMLNodeSpec,
  SysMLParametricSpec,
  SysMLReactFlowEdge,
  SysMLReactFlowNode,
  SysMLRelationshipSpec,
  SysMLRequirementSpec,
  SysMLBlockSpec
} from './types';

const defaultPosition: XYPosition = { x: 0, y: 0 };

const normalizePosition = (position?: Partial<XYPosition>): XYPosition => ({
  x: position?.x ?? defaultPosition.x,
  y: position?.y ?? defaultPosition.y
});

const withBaseData = (
  spec: { id: string; name: string; stereotype?: string; description?: string },
  kind: SysMLNodeKind
): SysMLNodeData => ({
  id: spec.id,
  name: spec.name,
  stereotype: spec.stereotype,
  documentation: spec.description,
  kind
});

export const createRequirementNode = (
  spec: SysMLRequirementSpec,
  position?: Partial<XYPosition>
): SysMLReactFlowNode => ({
  id: spec.id,
  type: 'sysml.requirement',
  position: normalizePosition(position),
  data: {
    ...withBaseData(
      { id: spec.id, name: spec.name, stereotype: spec.stereotype, description: spec.text },
      'requirement'
    ),
    status: spec.status,
    tags: spec.derivedFrom?.map((id) => ({ key: 'derivedFrom', value: id })),
    compartments: [
      {
        items: [
          { label: 'Text', value: spec.text },
          spec.verification ? { label: 'Verify', value: spec.verification } : undefined,
          spec.risk ? { label: 'Risk', value: spec.risk.toUpperCase() } : undefined
        ].filter(Boolean) as { label: string; value: string }[]
      }
    ]
  }
});

export const createBlockNode = (
  spec: SysMLBlockSpec,
  position?: Partial<XYPosition>,
  kind: Extract<SysMLNodeKind, 'block-definition' | 'internal-block'> = 'block-definition'
): SysMLReactFlowNode => ({
  id: spec.id,
  type: kind === 'internal-block' ? 'sysml.internal-block' : 'sysml.block',
  position: normalizePosition(position),
  data: {
    ...withBaseData(
      { id: spec.id, name: spec.name, stereotype: spec.stereotype, description: spec.description },
      kind
    ),
    status: spec.status,
    compartments: [
      spec.parts &&
        spec.parts.length > 0 && {
          title: 'parts',
          items: spec.parts.map((part) => ({
            label: part.name,
            value: [part.multiplicity, part.type].filter(Boolean).join(' ')
          }))
        },
      spec.values &&
        spec.values.length > 0 && {
          title: 'values',
          items: spec.values.map((value) => ({
            label: value.name,
            value: value.value ?? value.type ?? ''
          }))
        },
      spec.ports &&
        spec.ports.length > 0 && {
          title: 'ports',
          items: spec.ports.map((port) => ({
            label: port.name,
            value: [port.direction?.toUpperCase(), port.type].filter(Boolean).join(' ')
          }))
        }
    ].filter(Boolean) as SysMLNodeData['compartments']
  }
});

export const createActivityNode = (
  spec: SysMLActivitySpec,
  position?: Partial<XYPosition>
): SysMLReactFlowNode => ({
  id: spec.id,
  type: 'sysml.activity',
  position: normalizePosition(position),
  data: {
    ...withBaseData(
      { id: spec.id, name: spec.name, stereotype: spec.stereotype, description: undefined },
      'activity'
    ),
    status: spec.status,
    emphasis: spec.actions?.[0],
    compartments: [
      spec.inputs &&
        spec.inputs.length > 0 && {
          title: 'inputs',
          items: spec.inputs.map((input) => ({ label: input.name, value: input.type ?? input.value }))
        },
      spec.outputs &&
        spec.outputs.length > 0 && {
          title: 'outputs',
          items: spec.outputs.map((output) => ({ label: output.name, value: output.type ?? output.value }))
        },
      spec.actions &&
        spec.actions.length > 0 && {
          title: 'actions',
          items: spec.actions.map((action) => ({ label: action }))
        }
    ].filter(Boolean) as SysMLNodeData['compartments']
  }
});

export const createParametricNode = (
  spec: SysMLParametricSpec,
  position?: Partial<XYPosition>
): SysMLReactFlowNode => ({
  id: spec.id,
  type: 'sysml.parametric',
  position: normalizePosition(position),
  data: {
    ...withBaseData(
      {
        id: spec.id,
        name: spec.name,
        stereotype: spec.stereotype,
        description: spec.equation
      },
      'parametric'
    ),
    emphasis: spec.equation,
    compartments: [
      {
        title: 'parameters',
        items: spec.parameters.map((parameter) => ({
          label: parameter.name,
          value: parameter.value ?? parameter.type
        }))
      }
    ]
  }
});

export const createRelationshipEdge = (spec: SysMLRelationshipSpec): SysMLReactFlowEdge => ({
  id: spec.id,
  type: 'sysml.relationship',
  source: spec.source,
  target: spec.target,
  data: { kind: spec.type, label: spec.label, rationale: spec.rationale } satisfies SysMLEdgeData
});

export const createNodesFromSpecs = (
  specs: SysMLNodeSpec[],
  positions: Record<string, Partial<XYPosition>> = {}
): SysMLReactFlowNode[] =>
  specs.map((descriptor, index) => {
    const fallback = { x: (index % 3) * 320, y: Math.floor(index / 3) * 260 };
    const position = positions[descriptor.spec.id] ?? fallback;

    switch (descriptor.kind) {
      case 'requirement':
        return createRequirementNode(descriptor.spec, position);
      case 'activity':
        return createActivityNode(descriptor.spec, position);
      case 'parametric':
        return createParametricNode(descriptor.spec, position);
      case 'internal-block':
        return createBlockNode(descriptor.spec, position, 'internal-block');
      case 'block-definition':
      default:
        return createBlockNode(descriptor.spec as SysMLBlockSpec, position, 'block-definition');
    }
  });

export const createEdgesFromRelationships = (
  specs: SysMLRelationshipSpec[]
): SysMLReactFlowEdge[] => specs.map((relationship) => createRelationshipEdge(relationship));
