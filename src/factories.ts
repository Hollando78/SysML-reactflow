import type { XYPosition } from 'reactflow';

import type {
  SysMLActionDefinitionSpec,
  SysMLActionUsageSpec,
  SysMLActivityControlSpec,
  SysMLCompartment,
  SysMLEdgeData,
  SysMLItemDefinitionSpec,
  SysMLItemUsageSpec,
  SysMLNodeData,
  SysMLNodeKind,
  SysMLNodeSpec,
  SysMLPartDefinitionSpec,
  SysMLPartUsageSpec,
  SysMLPortDefinitionSpec,
  SysMLPortUsageSpec,
  SysMLPropertySpec,
  SysMLPortSpec,
  SysMLReactFlowEdge,
  SysMLReactFlowNode,
  SysMLRelationshipSpec,
  SysMLSequenceLifelineSpec,
  SysMLSequenceMessageSpec,
  SysMLStateMachineSpec,
  SysMLStateSpec,
  SysMLStateTransitionSpec
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

// New SysML v2 Factory Functions

import type {
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
  SysMLPackageSpec,
  SysMLLibraryPackageSpec,
  SysMLInteractionSpec,
  SysMLMetadataDefinitionSpec,
  SysMLMetadataUsageSpec,
  SysMLCommentSpec,
  SysMLDocumentationSpec
} from './types';

// Attribute Definition and Usage
export const createAttributeDefinitionNode = (
  spec: SysMLAttributeDefinitionSpec,
  position?: Partial<XYPosition>
): SysMLReactFlowNode => ({
  id: spec.id,
  type: 'sysml.attribute-definition',
  position: normalizePosition(position),
  data: {
    ...withBaseData(spec, 'attribute-definition'),
    elementKind: 'definition',
    compartments: [
      spec.type ? buildCompartment('type', [{ label: spec.type }]) : undefined,
      spec.defaultValue ? buildCompartment('default', [{ label: spec.defaultValue }]) : undefined
    ].filter(Boolean) as SysMLCompartment[]
  }
});

export const createAttributeUsageNode = (
  spec: SysMLAttributeUsageSpec,
  position?: Partial<XYPosition>
): SysMLReactFlowNode => ({
  id: spec.id,
  type: 'sysml.attribute-usage',
  position: normalizePosition(position),
  data: {
    ...withBaseData(spec, 'attribute-usage'),
    elementKind: 'usage',
    baseDefinition: spec.definition,
    redefines: spec.redefines,
    subsets: spec.subsets,
    compartments: [
      spec.type ? buildCompartment('type', [{ label: spec.type }]) : undefined,
      spec.value ? buildCompartment('value', [{ label: spec.value }]) : undefined
    ].filter(Boolean) as SysMLCompartment[]
  }
});

// Connection Definition and Usage
export const createConnectionDefinitionNode = (
  spec: SysMLConnectionDefinitionSpec,
  position?: Partial<XYPosition>
): SysMLReactFlowNode => ({
  id: spec.id,
  type: 'sysml.connection-definition',
  position: normalizePosition(position),
  data: {
    ...withBaseData(spec, 'connection-definition'),
    elementKind: 'definition',
    compartments: [
      propertiesToItems('ends', spec.ends),
      propertiesToItems('attributes', spec.attributes)
    ].filter(Boolean) as SysMLCompartment[]
  }
});

export const createConnectionUsageNode = (
  spec: SysMLConnectionUsageSpec,
  position?: Partial<XYPosition>
): SysMLReactFlowNode => ({
  id: spec.id,
  type: 'sysml.connection-usage',
  position: normalizePosition(position),
  data: {
    ...withBaseData(spec, 'connection-usage'),
    elementKind: 'usage',
    baseDefinition: spec.definition,
    redefines: spec.redefines,
    compartments: [
      stringsToCompartment('connected', spec.connectedParts),
      propertiesToItems('attributes', spec.attributes)
    ].filter(Boolean) as SysMLCompartment[]
  }
});

// Interface Definition and Usage
export const createInterfaceDefinitionNode = (
  spec: SysMLInterfaceDefinitionSpec,
  position?: Partial<XYPosition>
): SysMLReactFlowNode => ({
  id: spec.id,
  type: 'sysml.interface-definition',
  position: normalizePosition(position),
  data: {
    ...withBaseData(spec, 'interface-definition'),
    elementKind: 'definition',
    compartments: [
      portsToCompartment(spec.ports),
      propertiesToItems('attributes', spec.attributes)
    ].filter(Boolean) as SysMLCompartment[]
  }
});

export const createInterfaceUsageNode = (
  spec: SysMLInterfaceUsageSpec,
  position?: Partial<XYPosition>
): SysMLReactFlowNode => ({
  id: spec.id,
  type: 'sysml.interface-usage',
  position: normalizePosition(position),
  data: {
    ...withBaseData(spec, 'interface-usage'),
    elementKind: 'usage',
    baseDefinition: spec.definition,
    compartments: [
      stringsToCompartment('ports', spec.connectedPorts)
    ].filter(Boolean) as SysMLCompartment[]
  }
});

// Allocation Definition and Usage
export const createAllocationDefinitionNode = (
  spec: SysMLAllocationDefinitionSpec,
  position?: Partial<XYPosition>
): SysMLReactFlowNode => ({
  id: spec.id,
  type: 'sysml.allocation-definition',
  position: normalizePosition(position),
  data: {
    ...withBaseData(spec, 'allocation-definition'),
    elementKind: 'definition',
    compartments: [
      spec.source ? buildCompartment('source', [{ label: spec.source }]) : undefined,
      spec.target ? buildCompartment('target', [{ label: spec.target }]) : undefined
    ].filter(Boolean) as SysMLCompartment[]
  }
});

export const createAllocationUsageNode = (
  spec: SysMLAllocationUsageSpec,
  position?: Partial<XYPosition>
): SysMLReactFlowNode => ({
  id: spec.id,
  type: 'sysml.allocation-usage',
  position: normalizePosition(position),
  data: {
    ...withBaseData(spec, 'allocation-usage'),
    elementKind: 'usage',
    baseDefinition: spec.definition,
    compartments: [
      spec.allocatedFrom ? buildCompartment('from', [{ label: spec.allocatedFrom }]) : undefined,
      spec.allocatedTo ? buildCompartment('to', [{ label: spec.allocatedTo }]) : undefined
    ].filter(Boolean) as SysMLCompartment[]
  }
});

// Reference Usage
export const createReferenceUsageNode = (
  spec: SysMLReferenceUsageSpec,
  position?: Partial<XYPosition>
): SysMLReactFlowNode => ({
  id: spec.id,
  type: 'sysml.reference-usage',
  position: normalizePosition(position),
  data: {
    ...withBaseData(spec, 'reference-usage'),
    elementKind: 'usage',
    redefines: spec.redefines,
    compartments: [
      spec.referencedElement ? buildCompartment('references', [{ label: spec.referencedElement }]) : undefined
    ].filter(Boolean) as SysMLCompartment[]
  }
});

// Occurrence Definition and Usage
export const createOccurrenceDefinitionNode = (
  spec: SysMLOccurrenceDefinitionSpec,
  position?: Partial<XYPosition>
): SysMLReactFlowNode => ({
  id: spec.id,
  type: 'sysml.occurrence-definition',
  position: normalizePosition(position),
  data: {
    ...withBaseData(spec, 'occurrence-definition'),
    elementKind: 'definition',
    compartments: [
      spec.lifeClass ? buildCompartment('lifeClass', [{ label: spec.lifeClass }]) : undefined
    ].filter(Boolean) as SysMLCompartment[]
  }
});

export const createOccurrenceUsageNode = (
  spec: SysMLOccurrenceUsageSpec,
  position?: Partial<XYPosition>
): SysMLReactFlowNode => ({
  id: spec.id,
  type: 'sysml.occurrence-usage',
  position: normalizePosition(position),
  data: {
    ...withBaseData(spec, 'occurrence-usage'),
    elementKind: 'usage',
    baseDefinition: spec.definition,
    compartments: [
      spec.portionOf ? buildCompartment('portionOf', [{ label: spec.portionOf }]) : undefined
    ].filter(Boolean) as SysMLCompartment[]
  }
});

// Calculation Definition and Usage
export const createCalculationDefinitionNode = (
  spec: SysMLCalculationDefinitionSpec,
  position?: Partial<XYPosition>
): SysMLReactFlowNode => ({
  id: spec.id,
  type: 'sysml.calculation-definition',
  position: normalizePosition(position),
  data: {
    ...withBaseData(spec, 'calculation-definition'),
    elementKind: 'definition',
    emphasis: spec.expression,
    compartments: [
      propertiesToItems('inputs', spec.inputs),
      propertiesToItems('outputs', spec.outputs),
      spec.returnResult ? buildCompartment('return', [{ label: spec.returnResult }]) : undefined
    ].filter(Boolean) as SysMLCompartment[]
  }
});

export const createCalculationUsageNode = (
  spec: SysMLCalculationUsageSpec,
  position?: Partial<XYPosition>
): SysMLReactFlowNode => ({
  id: spec.id,
  type: 'sysml.calculation-usage',
  position: normalizePosition(position),
  data: {
    ...withBaseData(spec, 'calculation-usage'),
    elementKind: 'usage',
    baseDefinition: spec.definition,
    emphasis: spec.calculationBody,
    compartments: [
      propertiesToItems('inputs', spec.inputs),
      propertiesToItems('outputs', spec.outputs)
    ].filter(Boolean) as SysMLCompartment[]
  }
});

// Advanced Action Types
export const createPerformActionNode = (
  spec: SysMLPerformActionSpec,
  position?: Partial<XYPosition>
): SysMLReactFlowNode => ({
  id: spec.id,
  type: 'sysml.perform-action',
  position: normalizePosition(position),
  data: {
    ...withBaseData(spec, 'perform-action'),
    compartments: [
      spec.performedAction ? buildCompartment('performs', [{ label: spec.performedAction }]) : undefined,
      propertiesToItems('inputs', spec.inputs),
      propertiesToItems('outputs', spec.outputs)
    ].filter(Boolean) as SysMLCompartment[]
  }
});

export const createSendActionNode = (
  spec: SysMLSendActionSpec,
  position?: Partial<XYPosition>
): SysMLReactFlowNode => ({
  id: spec.id,
  type: 'sysml.send-action',
  position: normalizePosition(position),
  data: {
    ...withBaseData(spec, 'send-action'),
    compartments: [
      spec.payload ? buildCompartment('payload', [{ label: spec.payload }]) : undefined,
      spec.target ? buildCompartment('to', [{ label: spec.target }]) : undefined,
      spec.via ? buildCompartment('via', [{ label: spec.via }]) : undefined
    ].filter(Boolean) as SysMLCompartment[]
  }
});

export const createAcceptActionNode = (
  spec: SysMLAcceptActionSpec,
  position?: Partial<XYPosition>
): SysMLReactFlowNode => ({
  id: spec.id,
  type: 'sysml.accept-action',
  position: normalizePosition(position),
  data: {
    ...withBaseData(spec, 'accept-action'),
    compartments: [
      spec.payloadType ? buildCompartment('accepts', [{ label: spec.payloadType }]) : undefined,
      spec.via ? buildCompartment('via', [{ label: spec.via }]) : undefined,
      spec.receiver ? buildCompartment('receiver', [{ label: spec.receiver }]) : undefined
    ].filter(Boolean) as SysMLCompartment[]
  }
});

export const createAssignmentActionNode = (
  spec: SysMLAssignmentActionSpec,
  position?: Partial<XYPosition>
): SysMLReactFlowNode => ({
  id: spec.id,
  type: 'sysml.assignment-action',
  position: normalizePosition(position),
  data: {
    ...withBaseData(spec, 'assignment-action'),
    compartments: [
      spec.targetFeature ? buildCompartment('target', [{ label: spec.targetFeature }]) : undefined,
      spec.valueExpression ? buildCompartment('value', [{ label: spec.valueExpression }]) : undefined
    ].filter(Boolean) as SysMLCompartment[]
  }
});

export const createIfActionNode = (
  spec: SysMLIfActionSpec,
  position?: Partial<XYPosition>
): SysMLReactFlowNode => ({
  id: spec.id,
  type: 'sysml.if-action',
  position: normalizePosition(position),
  data: {
    ...withBaseData(spec, 'if-action'),
    compartments: [
      spec.condition ? buildCompartment('if', [{ label: spec.condition }]) : undefined,
      spec.thenAction ? buildCompartment('then', [{ label: spec.thenAction }]) : undefined,
      spec.elseAction ? buildCompartment('else', [{ label: spec.elseAction }]) : undefined
    ].filter(Boolean) as SysMLCompartment[]
  }
});

export const createForLoopActionNode = (
  spec: SysMLForLoopActionSpec,
  position?: Partial<XYPosition>
): SysMLReactFlowNode => ({
  id: spec.id,
  type: 'sysml.for-loop-action',
  position: normalizePosition(position),
  data: {
    ...withBaseData(spec, 'for-loop-action'),
    compartments: [
      spec.variable ? buildCompartment('var', [{ label: spec.variable }]) : undefined,
      spec.collection ? buildCompartment('in', [{ label: spec.collection }]) : undefined,
      spec.body ? buildCompartment('do', [{ label: spec.body }]) : undefined
    ].filter(Boolean) as SysMLCompartment[]
  }
});

export const createWhileLoopActionNode = (
  spec: SysMLWhileLoopActionSpec,
  position?: Partial<XYPosition>
): SysMLReactFlowNode => ({
  id: spec.id,
  type: 'sysml.while-loop-action',
  position: normalizePosition(position),
  data: {
    ...withBaseData(spec, 'while-loop-action'),
    compartments: [
      spec.condition ? buildCompartment('while', [{ label: spec.condition }]) : undefined,
      spec.body ? buildCompartment('do', [{ label: spec.body }]) : undefined
    ].filter(Boolean) as SysMLCompartment[]
  }
});

// State Definition and Usage
export const createStateDefinitionNode = (
  spec: SysMLStateDefinitionSpec,
  position?: Partial<XYPosition>
): SysMLReactFlowNode => ({
  id: spec.id,
  type: 'sysml.state-definition',
  position: normalizePosition(position),
  data: {
    ...withBaseData(spec, 'state-definition'),
    elementKind: 'definition',
    compartments: [
      stringsToCompartment('substates', spec.substates)
    ].filter(Boolean) as SysMLCompartment[]
  }
});

export const createStateUsageNode = (
  spec: SysMLStateUsageSpec,
  position?: Partial<XYPosition>
): SysMLReactFlowNode => ({
  id: spec.id,
  type: 'sysml.state-usage',
  position: normalizePosition(position),
  data: {
    ...withBaseData(spec, 'state-usage'),
    elementKind: 'usage',
    baseDefinition: spec.definition,
    compartments: [
      spec.entryAction ? buildCompartment('entry', [{ label: spec.entryAction }]) : undefined,
      spec.doAction ? buildCompartment('do', [{ label: spec.doAction }]) : undefined,
      spec.exitAction ? buildCompartment('exit', [{ label: spec.exitAction }]) : undefined,
      stringsToCompartment('substates', spec.substates)
    ].filter(Boolean) as SysMLCompartment[]
  }
});

export const createTransitionUsageNode = (
  spec: SysMLTransitionUsageSpec,
  position?: Partial<XYPosition>
): SysMLReactFlowNode => ({
  id: spec.id,
  type: 'sysml.transition-usage',
  position: normalizePosition(position),
  data: {
    ...withBaseData(spec, 'transition-usage'),
    compartments: [
      spec.trigger ? buildCompartment('trigger', [{ label: spec.trigger }]) : undefined,
      spec.guard ? buildCompartment('guard', [{ label: spec.guard }]) : undefined,
      spec.effect ? buildCompartment('effect', [{ label: spec.effect }]) : undefined
    ].filter(Boolean) as SysMLCompartment[]
  }
});

export const createExhibitStateNode = (
  spec: SysMLExhibitStateSpec,
  position?: Partial<XYPosition>
): SysMLReactFlowNode => ({
  id: spec.id,
  type: 'sysml.exhibit-state',
  position: normalizePosition(position),
  data: {
    ...withBaseData(spec, 'exhibit-state'),
    compartments: [
      spec.exhibitedState ? buildCompartment('state', [{ label: spec.exhibitedState }]) : undefined,
      spec.performer ? buildCompartment('performer', [{ label: spec.performer }]) : undefined
    ].filter(Boolean) as SysMLCompartment[]
  }
});

// Requirement Definition and Usage
export const createRequirementDefinitionNode = (
  spec: SysMLRequirementDefinitionSpec,
  position?: Partial<XYPosition>
): SysMLReactFlowNode => ({
  id: spec.id,
  type: 'sysml.requirement-definition',
  position: normalizePosition(position),
  data: {
    ...withBaseData(spec, 'requirement-definition'),
    elementKind: 'definition',
    compartments: [
      spec.text ? buildCompartment('text', [{ label: spec.text }]) : undefined,
      spec.reqId ? buildCompartment('id', [{ label: spec.reqId }]) : undefined,
      stringsToCompartment('assume', spec.assumeConstraint),
      stringsToCompartment('require', spec.requireConstraint),
      stringsToCompartment('concerns', spec.framedConcerns),
      stringsToCompartment('actors', spec.actors)
    ].filter(Boolean) as SysMLCompartment[]
  }
});

export const createRequirementUsageNode = (
  spec: SysMLRequirementUsageSpec,
  position?: Partial<XYPosition>
): SysMLReactFlowNode => ({
  id: spec.id,
  type: 'sysml.requirement-usage',
  position: normalizePosition(position),
  data: {
    ...withBaseData(spec, 'requirement-usage'),
    elementKind: 'usage',
    baseDefinition: spec.definition,
    status: spec.status,
    compartments: [
      spec.text ? buildCompartment('text', [{ label: spec.text }]) : undefined,
      spec.reqId ? buildCompartment('id', [{ label: spec.reqId }]) : undefined,
      stringsToCompartment('assume', spec.assumeConstraint),
      stringsToCompartment('require', spec.requireConstraint)
    ].filter(Boolean) as SysMLCompartment[]
  }
});

// Constraint Definition and Usage
export const createConstraintDefinitionNode = (
  spec: SysMLConstraintDefinitionSpec,
  position?: Partial<XYPosition>
): SysMLReactFlowNode => ({
  id: spec.id,
  type: 'sysml.constraint-definition',
  position: normalizePosition(position),
  data: {
    ...withBaseData(spec, 'constraint-definition'),
    elementKind: 'definition',
    emphasis: spec.expression,
    compartments: []
  }
});

export const createConstraintUsageNode = (
  spec: SysMLConstraintUsageSpec,
  position?: Partial<XYPosition>
): SysMLReactFlowNode => ({
  id: spec.id,
  type: 'sysml.constraint-usage',
  position: normalizePosition(position),
  data: {
    ...withBaseData(spec, 'constraint-usage'),
    elementKind: 'usage',
    baseDefinition: spec.definition,
    emphasis: spec.expression,
    compartments: []
  }
});

// Verification Case Definition and Usage
export const createVerificationCaseDefinitionNode = (
  spec: SysMLVerificationCaseDefinitionSpec,
  position?: Partial<XYPosition>
): SysMLReactFlowNode => ({
  id: spec.id,
  type: 'sysml.verification-case-definition',
  position: normalizePosition(position),
  data: {
    ...withBaseData(spec, 'verification-case-definition'),
    elementKind: 'definition',
    compartments: [
      spec.verifiedRequirement ? buildCompartment('verifies', [{ label: spec.verifiedRequirement }]) : undefined,
      spec.objectiveRequirement ? buildCompartment('objective', [{ label: spec.objectiveRequirement }]) : undefined
    ].filter(Boolean) as SysMLCompartment[]
  }
});

export const createVerificationCaseUsageNode = (
  spec: SysMLVerificationCaseUsageSpec,
  position?: Partial<XYPosition>
): SysMLReactFlowNode => ({
  id: spec.id,
  type: 'sysml.verification-case-usage',
  position: normalizePosition(position),
  data: {
    ...withBaseData(spec, 'verification-case-usage'),
    elementKind: 'usage',
    baseDefinition: spec.definition,
    status: spec.status,
    compartments: [
      spec.verifiedRequirement ? buildCompartment('verifies', [{ label: spec.verifiedRequirement }]) : undefined,
      spec.verificationMethod ? buildCompartment('method', [{ label: spec.verificationMethod }]) : undefined
    ].filter(Boolean) as SysMLCompartment[]
  }
});

// Analysis Case Definition and Usage
export const createAnalysisCaseDefinitionNode = (
  spec: SysMLAnalysisCaseDefinitionSpec,
  position?: Partial<XYPosition>
): SysMLReactFlowNode => ({
  id: spec.id,
  type: 'sysml.analysis-case-definition',
  position: normalizePosition(position),
  data: {
    ...withBaseData(spec, 'analysis-case-definition'),
    elementKind: 'definition',
    compartments: [
      spec.analysisAction ? buildCompartment('action', [{ label: spec.analysisAction }]) : undefined,
      spec.resultExpression ? buildCompartment('result', [{ label: spec.resultExpression }]) : undefined
    ].filter(Boolean) as SysMLCompartment[]
  }
});

export const createAnalysisCaseUsageNode = (
  spec: SysMLAnalysisCaseUsageSpec,
  position?: Partial<XYPosition>
): SysMLReactFlowNode => ({
  id: spec.id,
  type: 'sysml.analysis-case-usage',
  position: normalizePosition(position),
  data: {
    ...withBaseData(spec, 'analysis-case-usage'),
    elementKind: 'usage',
    baseDefinition: spec.definition,
    compartments: [
      spec.analysisAction ? buildCompartment('action', [{ label: spec.analysisAction }]) : undefined,
      spec.resultExpression ? buildCompartment('result', [{ label: spec.resultExpression }]) : undefined
    ].filter(Boolean) as SysMLCompartment[]
  }
});

// Use Case Definition and Usage
export const createUseCaseDefinitionNode = (
  spec: SysMLUseCaseDefinitionSpec,
  position?: Partial<XYPosition>
): SysMLReactFlowNode => ({
  id: spec.id,
  type: 'sysml.use-case-definition',
  position: normalizePosition(position),
  data: {
    ...withBaseData(spec, 'use-case-definition'),
    elementKind: 'definition',
    compartments: [
      stringsToCompartment('includes', spec.includedUseCases),
      spec.objectiveRequirement ? buildCompartment('objective', [{ label: spec.objectiveRequirement }]) : undefined
    ].filter(Boolean) as SysMLCompartment[]
  }
});

export const createUseCaseUsageNode = (
  spec: SysMLUseCaseUsageSpec,
  position?: Partial<XYPosition>
): SysMLReactFlowNode => ({
  id: spec.id,
  type: 'sysml.use-case-usage',
  position: normalizePosition(position),
  data: {
    ...withBaseData(spec, 'use-case-usage'),
    elementKind: 'usage',
    baseDefinition: spec.definition,
    status: spec.status,
    compartments: [
      stringsToCompartment('actors', spec.actors),
      stringsToCompartment('includes', spec.includes),
      stringsToCompartment('extends', spec.extends)
    ].filter(Boolean) as SysMLCompartment[]
  }
});

// Concern Definition and Usage
export const createConcernDefinitionNode = (
  spec: SysMLConcernDefinitionSpec,
  position?: Partial<XYPosition>
): SysMLReactFlowNode => ({
  id: spec.id,
  type: 'sysml.concern-definition',
  position: normalizePosition(position),
  data: {
    ...withBaseData(spec, 'concern-definition'),
    elementKind: 'definition',
    compartments: [
      spec.text ? buildCompartment('text', [{ label: spec.text }]) : undefined
    ].filter(Boolean) as SysMLCompartment[]
  }
});

export const createConcernUsageNode = (
  spec: SysMLConcernUsageSpec,
  position?: Partial<XYPosition>
): SysMLReactFlowNode => ({
  id: spec.id,
  type: 'sysml.concern-usage',
  position: normalizePosition(position),
  data: {
    ...withBaseData(spec, 'concern-usage'),
    elementKind: 'usage',
    baseDefinition: spec.definition,
    compartments: [
      spec.text ? buildCompartment('text', [{ label: spec.text }]) : undefined,
      stringsToCompartment('stakeholders', spec.stakeholders)
    ].filter(Boolean) as SysMLCompartment[]
  }
});

// Package and Library Package
export const createPackageNode = (
  spec: SysMLPackageSpec,
  position?: Partial<XYPosition>
): SysMLReactFlowNode => ({
  id: spec.id,
  type: 'sysml.package',
  position: normalizePosition(position),
  data: {
    ...withBaseData(spec, 'package'),
    compartments: [
      stringsToCompartment('members', spec.members),
      stringsToCompartment('imports', spec.imports)
    ].filter(Boolean) as SysMLCompartment[]
  }
});

export const createLibraryPackageNode = (
  spec: SysMLLibraryPackageSpec,
  position?: Partial<XYPosition>
): SysMLReactFlowNode => ({
  id: spec.id,
  type: 'sysml.library-package',
  position: normalizePosition(position),
  data: {
    ...withBaseData(spec, 'library-package'),
    compartments: [
      stringsToCompartment('members', spec.members)
    ].filter(Boolean) as SysMLCompartment[]
  }
});

// Interaction
export const createInteractionNode = (
  spec: SysMLInteractionSpec,
  position?: Partial<XYPosition>
): SysMLReactFlowNode => ({
  id: spec.id,
  type: 'sysml.interaction',
  position: normalizePosition(position),
  data: {
    ...withBaseData(spec, 'interaction'),
    compartments: [
      stringsToCompartment('participants', spec.participants),
      stringsToCompartment('messages', spec.messages)
    ].filter(Boolean) as SysMLCompartment[]
  }
});

// Metadata
export const createMetadataDefinitionNode = (
  spec: SysMLMetadataDefinitionSpec,
  position?: Partial<XYPosition>
): SysMLReactFlowNode => ({
  id: spec.id,
  type: 'sysml.metadata-definition',
  position: normalizePosition(position),
  data: {
    ...withBaseData(spec, 'metadata-definition'),
    elementKind: 'definition',
    compartments: [
      spec.baseType ? buildCompartment('baseType', [{ label: spec.baseType }]) : undefined,
      propertiesToItems('attributes', spec.attributes)
    ].filter(Boolean) as SysMLCompartment[]
  }
});

export const createMetadataUsageNode = (
  spec: SysMLMetadataUsageSpec,
  position?: Partial<XYPosition>
): SysMLReactFlowNode => ({
  id: spec.id,
  type: 'sysml.metadata-usage',
  position: normalizePosition(position),
  data: {
    ...withBaseData(spec, 'metadata-usage'),
    elementKind: 'usage',
    baseDefinition: spec.definition,
    compartments: [
      spec.annotatedElement ? buildCompartment('annotates', [{ label: spec.annotatedElement }]) : undefined
    ].filter(Boolean) as SysMLCompartment[]
  }
});

export const createCommentNode = (
  spec: SysMLCommentSpec,
  position?: Partial<XYPosition>
): SysMLReactFlowNode => ({
  id: spec.id,
  type: 'sysml.comment',
  position: normalizePosition(position),
  data: {
    id: spec.id,
    name: 'Comment',
    kind: 'comment',
    documentation: spec.body,
    compartments: [
      spec.annotatedElement ? buildCompartment('annotates', [{ label: spec.annotatedElement }]) : undefined
    ].filter(Boolean) as SysMLCompartment[]
  }
});

export const createDocumentationNode = (
  spec: SysMLDocumentationSpec,
  position?: Partial<XYPosition>
): SysMLReactFlowNode => ({
  id: spec.id,
  type: 'sysml.documentation',
  position: normalizePosition(position),
  data: {
    id: spec.id,
    name: 'Documentation',
    kind: 'documentation',
    documentation: spec.body,
    compartments: [
      spec.documentedElement ? buildCompartment('documents', [{ label: spec.documentedElement }]) : undefined
    ].filter(Boolean) as SysMLCompartment[]
  }
});

export const createNodesFromSpecs = (
  specs: SysMLNodeSpec[],
  positions: Record<string, Partial<XYPosition>> = {}
): SysMLReactFlowNode[] =>
  specs.map((descriptor, index) => {
    const fallback = { x: (index % 3) * 320, y: Math.floor(index / 3) * 260 };
    const position = positions[descriptor.spec.id] ?? fallback;

    switch (descriptor.kind) {
      // Structural Elements
      case 'part-definition':
        return createPartDefinitionNode(descriptor.spec, position);
      case 'part-usage':
        return createPartUsageNode(descriptor.spec, position);
      case 'attribute-definition':
        return createAttributeDefinitionNode(descriptor.spec, position);
      case 'attribute-usage':
        return createAttributeUsageNode(descriptor.spec, position);
      case 'port-definition':
        return createPortDefinitionNode(descriptor.spec, position);
      case 'port-usage':
        return createPortUsageNode(descriptor.spec, position);
      case 'item-definition':
        return createItemDefinitionNode(descriptor.spec, position);
      case 'item-usage':
        return createItemUsageNode(descriptor.spec, position);
      case 'connection-definition':
        return createConnectionDefinitionNode(descriptor.spec, position);
      case 'connection-usage':
        return createConnectionUsageNode(descriptor.spec, position);
      case 'interface-definition':
        return createInterfaceDefinitionNode(descriptor.spec, position);
      case 'interface-usage':
        return createInterfaceUsageNode(descriptor.spec, position);
      case 'allocation-definition':
        return createAllocationDefinitionNode(descriptor.spec, position);
      case 'allocation-usage':
        return createAllocationUsageNode(descriptor.spec, position);
      case 'reference-usage':
        return createReferenceUsageNode(descriptor.spec, position);
      case 'occurrence-definition':
        return createOccurrenceDefinitionNode(descriptor.spec, position);
      case 'occurrence-usage':
        return createOccurrenceUsageNode(descriptor.spec, position);
      // Behavioral Elements
      case 'action-definition':
        return createActionDefinitionNode(descriptor.spec, position);
      case 'action-usage':
        return createActionUsageNode(descriptor.spec, position);
      case 'activity-control':
        return createActivityControlNode(descriptor.spec, position);
      case 'calculation-definition':
        return createCalculationDefinitionNode(descriptor.spec, position);
      case 'calculation-usage':
        return createCalculationUsageNode(descriptor.spec, position);
      case 'perform-action':
        return createPerformActionNode(descriptor.spec, position);
      case 'send-action':
        return createSendActionNode(descriptor.spec, position);
      case 'accept-action':
        return createAcceptActionNode(descriptor.spec, position);
      case 'assignment-action':
        return createAssignmentActionNode(descriptor.spec, position);
      case 'if-action':
        return createIfActionNode(descriptor.spec, position);
      case 'for-loop-action':
        return createForLoopActionNode(descriptor.spec, position);
      case 'while-loop-action':
        return createWhileLoopActionNode(descriptor.spec, position);
      case 'state':
        return createStateNode(descriptor.spec, position);
      case 'state-machine':
        return createStateMachineNode(descriptor.spec, position);
      case 'state-definition':
        return createStateDefinitionNode(descriptor.spec, position);
      case 'state-usage':
        return createStateUsageNode(descriptor.spec, position);
      case 'transition-usage':
        return createTransitionUsageNode(descriptor.spec, position);
      case 'exhibit-state':
        return createExhibitStateNode(descriptor.spec, position);
      // Requirements & Cases
      case 'requirement-definition':
        return createRequirementDefinitionNode(descriptor.spec, position);
      case 'requirement-usage':
        return createRequirementUsageNode(descriptor.spec, position);
      case 'constraint-definition':
        return createConstraintDefinitionNode(descriptor.spec, position);
      case 'constraint-usage':
        return createConstraintUsageNode(descriptor.spec, position);
      case 'verification-case-definition':
        return createVerificationCaseDefinitionNode(descriptor.spec, position);
      case 'verification-case-usage':
        return createVerificationCaseUsageNode(descriptor.spec, position);
      case 'analysis-case-definition':
        return createAnalysisCaseDefinitionNode(descriptor.spec, position);
      case 'analysis-case-usage':
        return createAnalysisCaseUsageNode(descriptor.spec, position);
      case 'use-case-definition':
        return createUseCaseDefinitionNode(descriptor.spec, position);
      case 'use-case-usage':
        return createUseCaseUsageNode(descriptor.spec, position);
      case 'concern-definition':
        return createConcernDefinitionNode(descriptor.spec, position);
      case 'concern-usage':
        return createConcernUsageNode(descriptor.spec, position);
      // Organizational
      case 'package':
        return createPackageNode(descriptor.spec, position);
      case 'library-package':
        return createLibraryPackageNode(descriptor.spec, position);
      // Interactions
      case 'sequence-lifeline':
        return createSequenceLifelineNode(descriptor.spec, position);
      case 'interaction':
        return createInteractionNode(descriptor.spec, position);
      // Metadata
      case 'metadata-definition':
        return createMetadataDefinitionNode(descriptor.spec, position);
      case 'metadata-usage':
        return createMetadataUsageNode(descriptor.spec, position);
      case 'comment':
        return createCommentNode(descriptor.spec, position);
      case 'documentation':
        return createDocumentationNode(descriptor.spec, position);
    }
  });

export const createEdgesFromRelationships = (
  specs: SysMLRelationshipSpec[]
): SysMLReactFlowEdge[] => specs.map((relationship) => createRelationshipEdge(relationship));
