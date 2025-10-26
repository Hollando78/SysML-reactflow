import type { XYPosition } from 'reactflow';

import type {
  SysMLActionDefinitionSpec,
  SysMLActionUsageSpec,
  SysMLActivityControlSpec,
  SysMLActivitySpec,
  SysMLBlockSpec,
  SysMLCompartment,
  SysMLEdgeData,
  SysMLItemDefinitionSpec,
  SysMLItemUsageSpec,
  SysMLNodeData,
  SysMLNodeKind,
  SysMLNodeSpec,
  SysMLParametricSpec,
  SysMLPartDefinitionSpec,
  SysMLPartUsageSpec,
  SysMLPortDefinitionSpec,
  SysMLPortUsageSpec,
  SysMLPropertySpec,
  SysMLPortSpec,
  SysMLReactFlowEdge,
  SysMLReactFlowNode,
  SysMLRelationshipSpec,
  SysMLRequirementSpec,
  SysMLSequenceLifelineSpec,
  SysMLSequenceMessageSpec,
  SysMLStateMachineSpec,
  SysMLStateSpec,
  SysMLStateTransitionSpec,
  SysMLUseCaseSpec
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

const buildCompartment = (title: string, items: SysMLCompartment['items']): SysMLCompartment => ({
  title,
  items
});

const propertiesToItems = (
  title: string,
  properties?: SysMLPropertySpec[],
  formatter?: (prop: SysMLPropertySpec) => string
): SysMLCompartment | undefined => {
  if (!properties || properties.length === 0) {
    return undefined;
  }

  return buildCompartment(
    title,
    properties.map((property) => ({
      label: property.name,
      value:
        formatter?.(property) ?? [property.multiplicity, property.type, property.value].filter(Boolean).join(' ')
    }))
  );
};

const portsToCompartment = (ports?: SysMLPortSpec[]): SysMLCompartment | undefined => {
  if (!ports || ports.length === 0) {
    return undefined;
  }

  return buildCompartment(
    'ports',
    ports.map((port) => ({
      label: port.name,
      value: [port.direction?.toUpperCase(), port.type].filter(Boolean).join(' ')
    }))
  );
};

const stringsToCompartment = (title: string, values?: string[]): SysMLCompartment | undefined => {
  if (!values || values.length === 0) {
    return undefined;
  }

  return buildCompartment(
    title,
    values.map((value) => ({
      label: value
    }))
  );
};

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

export const createPartDefinitionNode = (
  spec: SysMLPartDefinitionSpec,
  position?: Partial<XYPosition>
): SysMLReactFlowNode => ({
  id: spec.id,
  type: 'sysml.part-definition',
  position: normalizePosition(position),
  data: {
    ...withBaseData(spec, 'part-definition'),
    elementKind: 'definition',
    compartments: [
      propertiesToItems('attributes', spec.attributes),
      portsToCompartment(spec.ports),
      stringsToCompartment('actions', spec.actions),
      stringsToCompartment('states', spec.states)
    ].filter(Boolean) as SysMLNodeData['compartments']
  }
});

export const createPartUsageNode = (
  spec: SysMLPartUsageSpec,
  position?: Partial<XYPosition>
): SysMLReactFlowNode => ({
  id: spec.id,
  type: 'sysml.part-usage',
  position: normalizePosition(position),
  data: {
    ...withBaseData(spec, 'part-usage'),
    elementKind: 'usage',
    baseDefinition: spec.definition,
    redefines: spec.redefines,
    subsets: spec.subsets,
    compartments: [propertiesToItems('attributes', spec.attributes), portsToCompartment(spec.ports)].filter(
      Boolean
    ) as SysMLNodeData['compartments']
  }
});

export const createActionDefinitionNode = (
  spec: SysMLActionDefinitionSpec,
  position?: Partial<XYPosition>
): SysMLReactFlowNode => ({
  id: spec.id,
  type: 'sysml.action-definition',
  position: normalizePosition(position),
  data: {
    ...withBaseData(spec, 'action-definition'),
    elementKind: 'definition',
    compartments: [
      propertiesToItems('inputs', spec.inputs),
      propertiesToItems('outputs', spec.outputs)
    ].filter(Boolean) as SysMLNodeData['compartments']
  }
});

export const createActionUsageNode = (
  spec: SysMLActionUsageSpec,
  position?: Partial<XYPosition>
): SysMLReactFlowNode => ({
  id: spec.id,
  type: 'sysml.action-usage',
  position: normalizePosition(position),
  data: {
    ...withBaseData(spec, 'action-usage'),
    elementKind: 'usage',
    baseDefinition: spec.definition,
    redefines: spec.redefines,
    compartments: [
      propertiesToItems('inputs', spec.inputs),
      propertiesToItems('outputs', spec.outputs)
    ].filter(Boolean) as SysMLNodeData['compartments']
  }
});

export const createPortDefinitionNode = (
  spec: SysMLPortDefinitionSpec,
  position?: Partial<XYPosition>
): SysMLReactFlowNode => ({
  id: spec.id,
  type: 'sysml.port-definition',
  position: normalizePosition(position),
  data: {
    ...withBaseData(spec, 'port-definition'),
    elementKind: 'definition',
    compartments: [
      stringsToCompartment('direction', spec.direction ? [spec.direction] : undefined),
      propertiesToItems('items', spec.items)
    ].filter(Boolean) as SysMLNodeData['compartments']
  }
});

export const createPortUsageNode = (
  spec: SysMLPortUsageSpec,
  position?: Partial<XYPosition>
): SysMLReactFlowNode => ({
  id: spec.id,
  type: 'sysml.port-usage',
  position: normalizePosition(position),
  data: {
    ...withBaseData(spec, 'port-usage'),
    elementKind: 'usage',
    baseDefinition: spec.definition,
    compartments: [
      stringsToCompartment('direction', spec.direction ? [spec.direction] : undefined),
      propertiesToItems('items', spec.items)
    ].filter(Boolean) as SysMLNodeData['compartments']
  }
});

export const createItemDefinitionNode = (
  spec: SysMLItemDefinitionSpec,
  position?: Partial<XYPosition>
): SysMLReactFlowNode => ({
  id: spec.id,
  type: 'sysml.item-definition',
  position: normalizePosition(position),
  data: {
    ...withBaseData(spec, 'item-definition'),
    elementKind: 'definition',
    compartments: [
      stringsToCompartment('quantity kind', spec.quantityKind ? [spec.quantityKind] : undefined),
      stringsToCompartment('unit', spec.unit ? [spec.unit] : undefined)
    ].filter(Boolean) as SysMLNodeData['compartments']
  }
});

export const createItemUsageNode = (
  spec: SysMLItemUsageSpec,
  position?: Partial<XYPosition>
): SysMLReactFlowNode => ({
  id: spec.id,
  type: 'sysml.item-usage',
  position: normalizePosition(position),
  data: {
    ...withBaseData(spec, 'item-usage'),
    elementKind: 'usage',
    baseDefinition: spec.definition,
    compartments: [
      stringsToCompartment('quantity kind', spec.quantityKind ? [spec.quantityKind] : undefined),
      stringsToCompartment('unit', spec.unit ? [spec.unit] : undefined)
    ].filter(Boolean) as SysMLNodeData['compartments']
  }
});

export const createActivityControlNode = (
  spec: SysMLActivityControlSpec,
  position?: Partial<XYPosition>
): SysMLReactFlowNode => ({
  id: spec.id,
  type: 'sysml.activity-control',
  position: normalizePosition(position),
  data: {
    ...withBaseData(
      {
        id: spec.id,
        name: spec.name,
        stereotype: spec.controlType,
        description: spec.documentation
      },
      'activity-control'
    ),
    controlType: spec.controlType
  }
});

export const createUseCaseNode = (
  spec: SysMLUseCaseSpec,
  position?: Partial<XYPosition>
): SysMLReactFlowNode => ({
  id: spec.id,
  type: 'sysml.use-case',
  position: normalizePosition(position),
  data: {
    ...withBaseData(
      { id: spec.id, name: spec.name, stereotype: spec.stereotype, description: spec.description },
      'use-case'
    ),
    status: spec.status,
    tags: spec.actors?.map((actor) => ({ key: 'actor', value: actor })),
    compartments: [
      spec.includes &&
        spec.includes.length > 0 && {
          title: 'includes',
          items: spec.includes.map((uc) => ({ label: uc }))
        },
      spec.extends &&
        spec.extends.length > 0 && {
          title: 'extends',
          items: spec.extends.map((uc) => ({ label: uc }))
        }
    ].filter(Boolean) as SysMLNodeData['compartments']
  }
});

export const createStateNode = (
  spec: SysMLStateSpec,
  position?: Partial<XYPosition>
): SysMLReactFlowNode => ({
  id: spec.id,
  type: 'sysml.state',
  position: normalizePosition(position),
  data: {
    ...withBaseData(
      {
        id: spec.id,
        name: spec.name,
        stereotype: 'state',
        description: undefined
      },
      'state'
    ),
    status: spec.status,
    compartments: [
      spec.entryAction && {
        title: 'entry',
        items: [{ label: spec.entryAction }]
      },
      spec.doActivity && {
        title: 'do',
        items: [{ label: spec.doActivity }]
      },
      spec.exitAction && {
        title: 'exit',
        items: [{ label: spec.exitAction }]
      }
    ].filter(Boolean) as SysMLNodeData['compartments']
  }
});

export const createStateMachineNode = (
  spec: SysMLStateMachineSpec,
  position?: Partial<XYPosition>
): SysMLReactFlowNode => ({
  id: spec.id,
  type: 'sysml.state-machine',
  position: normalizePosition(position),
  data: {
    ...withBaseData(
      {
        id: spec.id,
        name: spec.name,
        stereotype: spec.stereotype ?? 'stateMachine',
        description: undefined
      },
      'state-machine'
    ),
    compartments: [
      {
        title: 'states',
        items: spec.states.map((state) => ({ label: state.name }))
      }
    ]
  }
});

export const createSequenceLifelineNode = (
  spec: SysMLSequenceLifelineSpec,
  position?: Partial<XYPosition>
): SysMLReactFlowNode => ({
  id: spec.id,
  type: 'sysml.sequence-lifeline',
  position: normalizePosition(position),
  data: {
    ...withBaseData(
      {
        id: spec.id,
        name: spec.name,
        stereotype: spec.stereotype ?? 'lifeline',
        description: spec.classifier
      },
      'sequence-lifeline'
    )
  }
});

export const createStateTransitionEdge = (
  transition: SysMLStateTransitionSpec
): SysMLReactFlowEdge => ({
  id: transition.id,
  type: 'sysml.relationship',
  source: transition.source,
  target: transition.target,
  data: {
    kind: 'transition',
    label: transition.trigger ?? transition.id,
    guard: transition.guard,
    effect: transition.effect
  }
});

export const createSequenceMessageEdge = (
  message: SysMLSequenceMessageSpec
): SysMLReactFlowEdge => ({
  id: message.id,
  type: 'sysml.relationship',
  source: message.source,
  target: message.target,
  data: {
    kind: 'message',
    label: message.label,
    guard: message.guard,
    trigger: message.type
  }
});

export const createRelationshipEdge = (spec: SysMLRelationshipSpec): SysMLReactFlowEdge => ({
  id: spec.id,
  type: 'sysml.relationship',
  source: spec.source,
  target: spec.target,
  data: {
    kind: spec.type,
    label: spec.label,
    rationale: spec.rationale,
    trigger: spec.trigger,
    guard: spec.guard,
    effect: spec.effect
  } satisfies SysMLEdgeData
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
      case 'part-definition':
        return createPartDefinitionNode(descriptor.spec, position);
      case 'part-usage':
        return createPartUsageNode(descriptor.spec, position);
      case 'action-definition':
        return createActionDefinitionNode(descriptor.spec, position);
      case 'action-usage':
        return createActionUsageNode(descriptor.spec, position);
      case 'port-definition':
        return createPortDefinitionNode(descriptor.spec, position);
      case 'port-usage':
        return createPortUsageNode(descriptor.spec, position);
      case 'item-definition':
        return createItemDefinitionNode(descriptor.spec, position);
      case 'item-usage':
        return createItemUsageNode(descriptor.spec, position);
      case 'activity-control':
        return createActivityControlNode(descriptor.spec, position);
      case 'internal-block':
        return createBlockNode(descriptor.spec, position, 'internal-block');
      case 'use-case':
        return createUseCaseNode(descriptor.spec, position);
      case 'state':
        return createStateNode(descriptor.spec, position);
      case 'state-machine':
        return createStateMachineNode(descriptor.spec, position);
      case 'sequence-lifeline':
        return createSequenceLifelineNode(descriptor.spec, position);
      case 'block-definition':
      default:
        return createBlockNode(descriptor.spec as SysMLBlockSpec, position, 'block-definition');
    }
  });

export const createEdgesFromRelationships = (
  specs: SysMLRelationshipSpec[]
): SysMLReactFlowEdge[] => specs.map((relationship) => createRelationshipEdge(relationship));
