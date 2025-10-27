import type { Meta, StoryObj } from '@storybook/react';
import type { XYPosition } from 'reactflow';

import {
  SysMLDiagram,
  createActivityControlNode,
  createActionDefinitionNode,
  createActionUsageNode,
  createEdgesFromRelationships,
  createNodesFromSpecs,
  createConstraintDefinitionNode,
  createRequirementUsageNode,
  createSequenceLifelineNode,
  createSequenceMessageEdge,
  createStateMachineNode,
  createStateNode,
  createStateTransitionEdge,
  createUseCaseDefinitionNode,
  createUseCaseUsageNode,
  createPartDefinitionNode,
  createPartUsageNode,
  type SysMLNodeSpec,
  type SysMLRelationshipSpec,
  structuralDefinitionViewpoint,
  usageStructureViewpoint,
  type SysMLModel
} from '../index';

const nodeSpecs: SysMLNodeSpec[] = [
  {
    kind: 'requirement-usage',
    spec: {
      id: 'REQ-001',
      name: 'Maintain Power',
      text: 'The spacecraft shall provide > 2kW continuous bus power.',
      status: 'reviewed'
    }
  },
  {
    kind: 'part-definition',
    spec: {
      id: 'BLK-PCM',
      name: 'Power Conditioning Module',
      description: 'Manages battery charge/discharge and power routing.',
      attributes: [
        { name: 'batteryMgr', type: 'BatteryManager' },
        { name: 'distribution', type: 'PowerDistribution' },
        { name: 'efficiency', type: 'Real', value: '94%' },
        { name: 'mass', type: 'Real', value: '8.2', multiplicity: '[kg]' }
      ],
      ports: [
        { name: 'busIn', direction: 'in', type: 'PowerFlow' },
        { name: 'busOut', direction: 'out', type: 'PowerFlow' }
      ]
    }
  },
  {
    kind: 'action-definition',
    spec: {
      id: 'ACT-001',
      name: 'Balance Loads',
      description: 'Observes telemetry, predicts load, and commands switches',
      inputs: [{ name: 'telemetry', type: 'PowerTelemetry' }],
      outputs: [{ name: 'commands', type: 'SwitchCommand' }]
    }
  },
  {
    kind: 'constraint-definition',
    spec: {
      id: 'PAR-001',
      name: 'LoadConstraint',
      description: 'sum(load_i) <= 0.9 * capacity'
    }
  }
];

const relationshipSpecs: SysMLRelationshipSpec[] = [
  { id: 'edge-req', type: 'satisfy', source: 'BLK-PCM', target: 'REQ-001', label: 'satisfy' },
  { id: 'edge-alloc', type: 'allocate', source: 'BLK-PCM', target: 'ACT-001', label: 'allocate' },
  { id: 'edge-refine', type: 'refine', source: 'ACT-001', target: 'PAR-001', label: 'refine' }
];

const positions = {
  'REQ-001': { x: 0, y: 0 },
  'BLK-PCM': { x: 320, y: 80 },
  'ACT-001': { x: 640, y: 160 },
  'PAR-001': { x: 960, y: 80 }
};

const createGraph = () => ({
  nodes: createNodesFromSpecs(nodeSpecs, positions),
  edges: createEdgesFromRelationships(relationshipSpecs)
});

const definitionUsageSpecs: SysMLNodeSpec[] = [
  {
    kind: 'part-definition',
    spec: {
      id: 'VEHICLE-DEF',
      name: 'Vehicle',
      description: 'Part definition with attributes, ports, actions, and states.',
      attributes: [
        { name: 'mass', type: 'ISQ::Mass' },
        { name: 'position', type: 'Vector3' }
      ],
      ports: [
        { name: 'fuelCmdPort', direction: 'in', type: 'FuelCmd' },
        { name: 'vehicleRoadPort', direction: 'inout', type: 'RoadContact' }
      ]
    }
  },
  {
    kind: 'part-definition',
    spec: {
      id: 'SUV-DEF',
      name: 'SUV',
      description: 'Specializes Vehicle with steering feature.',
      attributes: [{ name: 'steeringAngle', type: 'Angle' }]
    }
  },
  {
    kind: 'part-usage',
    spec: {
      id: 'vehicle_b',
      name: 'vehicle_b:Vehicle',
      definition: 'Vehicle',
      attributes: [{ name: 'dryMass', type: 'Real', value: '1200', multiplicity: '[kg]' }],
      ports: [
        { name: 'fuelCmdPort', direction: 'in', type: 'FuelCmd' },
        { name: 'vehicleRoadPort', direction: 'inout', type: 'RoadContact' }
      ]
    }
  },
  {
    kind: 'action-definition',
    spec: {
      id: 'ProvidePower',
      name: 'ProvidePower',
      inputs: [{ name: 'pwrCmd', type: 'FuelCmd' }],
      outputs: [{ name: 'torqueToWheels', type: 'Torque', multiplicity: '[*]' }]
    }
  },
  {
    kind: 'action-usage',
    spec: {
      id: 'providePowerUsage',
      name: 'ProvidePower()',
      definition: 'ProvidePower',
      inputs: [{ name: 'pwrCmd', type: 'FuelCmd' }],
      outputs: [{ name: 'torqueToWheels', type: 'Torque' }]
    }
  },
  {
    kind: 'port-definition',
    spec: {
      id: 'FuelCmdPortDef',
      name: 'FuelCmdPort',
      direction: 'in',
      items: [{ name: 'fuelCmd', type: 'FuelCmd' }]
    }
  },
  {
    kind: 'port-usage',
    spec: {
      id: 'FuelCmdPortUsage',
      name: 'fuelCmdPort',
      definition: 'FuelCmdPort',
      direction: 'in',
      items: [{ name: 'fuelCmd', type: 'FuelCmd' }]
    }
  },
  {
    kind: 'item-definition',
    spec: {
      id: 'FuelCmdDef',
      name: 'FuelCmd',
      quantityKind: 'Command',
      unit: 'n/a'
    }
  },
  {
    kind: 'item-usage',
    spec: {
      id: 'FuelCmdUsage',
      name: 'fuelCmd',
      definition: 'FuelCmd'
    }
  }
];

const definitionUsageRelationships: SysMLRelationshipSpec[] = [
  { id: 'def-specialization', type: 'specialization', source: 'SUV-DEF', target: 'VEHICLE-DEF', label: 'specializes' },
  { id: 'usage-definition', type: 'definition', source: 'vehicle_b', target: 'VEHICLE-DEF', label: 'defined by' },
  { id: 'action-definition', type: 'definition', source: 'providePowerUsage', target: 'ProvidePower', label: 'defined by' },
  { id: 'port-definition', type: 'definition', source: 'FuelCmdPortUsage', target: 'FuelCmdPortDef', label: 'defined by' },
  { id: 'item-definition', type: 'definition', source: 'FuelCmdUsage', target: 'FuelCmdDef', label: 'defined by' },
  { id: 'flow-connection', type: 'flow-connection', source: 'FuelCmdPortUsage', target: 'providePowerUsage', label: 'flow' },
  { id: 'action-flow', type: 'action-flow', source: 'providePowerUsage', target: 'vehicle_b', label: 'performed on' }
];

const definitionUsagePositions: Record<string, Partial<XYPosition>> = {
  'VEHICLE-DEF': { x: 0, y: -40 },
  'SUV-DEF': { x: 260, y: -40 },
  vehicle_b: { x: 0, y: 200 },
  ProvidePower: { x: 520, y: -60 },
  providePowerUsage: { x: 520, y: 140 },
  FuelCmdPortDef: { x: -240, y: -40 },
  FuelCmdPortUsage: { x: -240, y: 160 },
  FuelCmdDef: { x: 260, y: -220 },
  FuelCmdUsage: { x: 260, y: 40 }
};

const definitionUsageModel: SysMLModel = {
  nodes: definitionUsageSpecs,
  relationships: definitionUsageRelationships
};

const bddGraph = (() => {
  const nodes = createNodesFromSpecs(
    [
      {
        kind: 'part-definition',
        spec: {
          id: 'BLK-Power',
          name: 'PowerController',
          description: 'Coordinates distribution logic.',
          attributes: [
            { name: 'batteryMgr', type: 'BatteryManager' },
            { name: 'telemetryBus', type: 'DataBus' },
            { name: 'priority', type: 'String', value: 'critical' }
          ]
        }
      },
      {
        kind: 'part-definition',
        spec: {
          id: 'BLK-Battery',
          name: 'BatteryModule',
          description: 'Provides stored energy.',
          attributes: [
            { name: 'cells', type: 'Li-IonPack', multiplicity: '[8]' },
            { name: 'heater', type: 'ThermalLoop' }
          ],
          ports: [{ name: 'powerOut', direction: 'out', type: '28V' }]
        }
      }
    ],
    {
      'BLK-Power': { x: 0, y: 60 },
      'BLK-Battery': { x: 360, y: 60 }
    }
  );

  const edges = createEdgesFromRelationships([
    { id: 'bdd-dependency', type: 'dependency', source: 'BLK-Power', target: 'BLK-Battery', label: 'uses' }
  ]);

  return { nodes, edges };
})();

const ibdGraph = (() => {
  const nodes = createNodesFromSpecs(
    [
      {
        kind: 'part-usage',
        spec: {
          id: 'IBD-CONTROLLER',
          name: 'Controller',
          attributes: [
            { name: 'psu', type: 'PowerSupply' },
            { name: 'swMatrix', type: 'SwitchMatrix' }
          ],
          ports: [
            { name: 'powerIn', direction: 'in', type: '28V' },
            { name: 'powerOut', direction: 'out', type: '28V' }
          ]
        }
      },
      {
        kind: 'part-usage',
        spec: {
          id: 'IBD-PAYLOAD',
          name: 'PayloadBay',
          ports: [
            { name: 'powerIn', direction: 'in', type: '28V' },
            { name: 'telemetry', direction: 'out', type: 'CAN' }
          ]
        }
      },
      {
        kind: 'action-usage',
        spec: {
          id: 'IBD-MON',
          name: 'MonitorLoads',
          description: 'Measures currents and reports anomalies',
          inputs: [{ name: 'telemetry', type: 'CAN' }],
          outputs: [{ name: 'alerts', type: 'Event' }]
        }
      }
    ],
    {
      'IBD-CONTROLLER': { x: 0, y: 40 },
      'IBD-PAYLOAD': { x: 380, y: 60 },
      'IBD-MON': { x: 760, y: 140 }
    }
  );

  const edges = createEdgesFromRelationships([
    { id: 'ibd-alloc', type: 'allocate', source: 'IBD-CONTROLLER', target: 'IBD-MON', label: 'allocate' },
    { id: 'ibd-dep', type: 'dependency', source: 'IBD-CONTROLLER', target: 'IBD-PAYLOAD', label: 'feeds' }
  ]);

  return { nodes, edges };
})();

const useCaseGraph = (() => {
  const nodes = createNodesFromSpecs(
    [
      {
        kind: 'use-case-definition',
        spec: {
          id: 'ACT-Operator',
          name: 'Operator',
          description: 'Ground operator interacts with the power system.'
        }
      },
      {
        kind: 'use-case-usage',
        spec: {
          id: 'UC-Manage',
          name: 'Manage Power',
          description: 'Configure loads and review reports.'
        }
      },
      {
        kind: 'use-case-usage',
        spec: {
          id: 'UC-Log',
          name: 'Log Telemetry',
          description: 'Persist all power events.'
        }
      },
      {
        kind: 'use-case-usage',
        spec: {
          id: 'UC-Recover',
          name: 'Recover From Fault',
          description: 'Isolate bad branches and restore nominal ops.'
        }
      }
    ],
    {
      'ACT-Operator': { x: -120, y: 40 },
      'UC-Manage': { x: 200, y: 20 },
      'UC-Log': { x: 520, y: 100 },
      'UC-Recover': { x: 200, y: 260 }
    }
  );

  const edges = createEdgesFromRelationships([
    { id: 'uc-include', type: 'include', source: 'UC-Manage', target: 'UC-Log', label: 'include' },
    { id: 'uc-extend', type: 'extend', source: 'UC-Recover', target: 'UC-Manage', label: 'extend' },
    { id: 'uc-actor', type: 'dependency', source: 'ACT-Operator', target: 'UC-Manage', label: 'interacts' }
  ]);

  return { nodes, edges };
})();

const stateMachineGraph = (() => {
  const machine = createStateMachineNode(
    {
      id: 'SM-Power',
      name: 'Power State Machine',
      states: [
        { id: 'SM-Idle', name: 'Idle' },
        { id: 'SM-Ready', name: 'Ready' },
        { id: 'SM-Fault', name: 'Fault' }
      ]
    },
    { x: -200, y: -20 }
  );

  const idle = createStateNode(
    {
      id: 'SM-Idle',
      name: 'Idle',
      entryAction: 'reset()',
      doActivity: 'monitor()'
    },
    { x: 200, y: -60 }
  );

  const ready = createStateNode(
    {
      id: 'SM-Ready',
      name: 'Ready',
      entryAction: 'prepPower()',
      doActivity: 'supply()',
      exitAction: 'handoff()'
    },
    { x: 520, y: 40 }
  );

  const fault = createStateNode(
    {
      id: 'SM-Fault',
      name: 'Fault',
      entryAction: 'isolate()',
      doActivity: 'diagnose()'
    },
    { x: 520, y: 260 }
  );

  const edges = [
    createStateTransitionEdge({
      id: 'sm-start',
      source: 'SM-Idle',
      target: 'SM-Ready',
      trigger: 'activate()',
      guard: 'batteryOk'
    }),
    createStateTransitionEdge({
      id: 'sm-fault',
      source: 'SM-Ready',
      target: 'SM-Fault',
      trigger: 'faultDetected',
      effect: 'notify()'
    }),
    createStateTransitionEdge({
      id: 'sm-reset',
      source: 'SM-Fault',
      target: 'SM-Idle',
      trigger: 'resetCommand'
    })
  ];

  return { nodes: [machine, idle, ready, fault], edges };
})();

const sequenceGraph = (() => {
  const controller = createSequenceLifelineNode(
    { id: 'SEQ-CTRL', name: 'Controller', classifier: 'PartDefinition::Controller' },
    { x: 0, y: 0 }
  );
  const pcm = createSequenceLifelineNode(
    { id: 'SEQ-PCM', name: 'PCM', classifier: 'PartDefinition::PCM' },
    { x: 260, y: 0 }
  );
  const load = createSequenceLifelineNode(
    { id: 'SEQ-LOAD', name: 'Load', classifier: 'PartDefinition::Load' },
    { x: 520, y: 0 }
  );

  const edges = [
    createSequenceMessageEdge({
      id: 'msg-1',
      type: 'sync',
      source: 'SEQ-CTRL',
      target: 'SEQ-PCM',
      label: 'enablePower()'
    }),
    createSequenceMessageEdge({
      id: 'msg-2',
      type: 'async',
      source: 'SEQ-PCM',
      target: 'SEQ-LOAD',
      label: 'applyLoad(loadId)',
      guard: 'available'
    }),
    createSequenceMessageEdge({
      id: 'msg-3',
      type: 'return',
      source: 'SEQ-LOAD',
      target: 'SEQ-CTRL',
      label: 'ack()'
    })
  ];

  return { nodes: [controller, pcm, load], edges };
})();

const activityGraph = (() => {
  const nodes = createNodesFromSpecs(
    [
      {
        kind: 'action-usage',
        spec: {
          id: 'ACT-Init',
          name: 'Initialize',
          description: 'Boot subsystems',
          outputs: [{ name: 'ready', type: 'Signal' }]
        }
      },
      {
        kind: 'action-usage',
        spec: {
          id: 'ACT-Config',
          name: 'Configure Loads',
          description: 'Resolve priorities',
          inputs: [{ name: 'ready', type: 'Signal' }]
        }
      },
      {
        kind: 'action-usage',
        spec: {
          id: 'ACT-Monitor',
          name: 'Monitor Current',
          description: 'Sample sensors',
          outputs: [{ name: 'currents', type: 'Telemetry' }]
        }
      },
      {
        kind: 'action-usage',
        spec: {
          id: 'ACT-Recover',
          name: 'Recover Fault',
          description: 'Isolate branch and notify ground'
        }
      },
      {
        kind: 'action-usage',
        spec: {
          id: 'ACT-Shutdown',
          name: 'Shutdown',
          description: 'Deactivate loads'
        }
      }
    ],
    {
      'ACT-Init': { x: -100, y: 0 },
      'ACT-Config': { x: 380, y: -80 },
      'ACT-Monitor': { x: 380, y: 120 },
      'ACT-Recover': { x: 860, y: 180 },
      'ACT-Shutdown': { x: 1280, y: 40 }
    }
  );

  const fork = createActivityControlNode(
    { id: 'ACT-Fork', name: 'Fork', controlType: 'fork' },
    { x: 180, y: 40 }
  );

  const decision = createActivityControlNode(
    { id: 'ACT-Decision', name: 'Decision', controlType: 'decision' },
    { x: 620, y: 40 }
  );

  const merge = createActivityControlNode(
    { id: 'ACT-Merge', name: 'Merge', controlType: 'merge' },
    { x: 860, y: 0 }
  );

  const join = createActivityControlNode(
    { id: 'ACT-Join', name: 'Join', controlType: 'join' },
    { x: 1080, y: 40 }
  );

  const edges = createEdgesFromRelationships([
    { id: 'cf-1', type: 'control-flow', source: 'ACT-Init', target: 'ACT-Fork', label: 'ready' },
    { id: 'cf-2', type: 'control-flow', source: 'ACT-Fork', target: 'ACT-Config' },
    { id: 'cf-3', type: 'control-flow', source: 'ACT-Fork', target: 'ACT-Monitor' },
    { id: 'cf-4', type: 'control-flow', source: 'ACT-Config', target: 'ACT-Decision' },
    { id: 'cf-5', type: 'control-flow', source: 'ACT-Monitor', target: 'ACT-Decision' },
    { id: 'cf-6', type: 'control-flow', source: 'ACT-Decision', target: 'ACT-Recover', label: 'fault' },
    { id: 'cf-7', type: 'control-flow', source: 'ACT-Decision', target: 'ACT-Merge', label: 'nominal' },
    { id: 'cf-8', type: 'control-flow', source: 'ACT-Recover', target: 'ACT-Join' },
    { id: 'cf-9', type: 'control-flow', source: 'ACT-Merge', target: 'ACT-Join' },
    { id: 'cf-10', type: 'control-flow', source: 'ACT-Join', target: 'ACT-Shutdown' }
  ]);

  return {
    nodes: [...nodes, fork, decision, merge, join],
    edges
  };
})();

const definitionUsageGraph = (() => ({
  nodes: createNodesFromSpecs(definitionUsageSpecs, definitionUsagePositions),
  edges: createEdgesFromRelationships(definitionUsageRelationships)
}))();

const meta = {
  title: 'SysML/SysMLDiagram',
  component: SysMLDiagram,
  args: createGraph(),
  parameters: {
    docs: {
      description: {
        component:
          'SysMLDiagram wires the provided node/edge registries, minimap, and controls on top of React Flow.'
      }
    }
  }
} satisfies Meta<typeof SysMLDiagram>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const MinimalChrome: Story = {
  args: {
    ...createGraph(),
    showMiniMap: false,
    showControls: false,
    showBackground: false
  }
};

export const BlockDefinitionDiagram: Story = {
  args: bddGraph,
  parameters: {
    docs: {
      description: { story: 'Part definition relationships between controller and battery modules.' }
    }
  }
};

export const InternalBlockDiagram: Story = {
  args: ibdGraph,
  parameters: {
    docs: {
      description: { story: 'Internal block view showing allocated activities and port-based flows.' }
    }
  }
};

export const UseCaseDiagram: Story = {
  args: useCaseGraph,
  parameters: {
    docs: {
      description: { story: 'Use-case coverage with include/extend connectors and actors.' }
    }
  }
};

export const StateMachineDiagram: Story = {
  args: stateMachineGraph,
  parameters: {
    docs: {
      description: { story: 'State machine nodes with transition edges carrying triggers/guards.' }
    }
  }
};

export const SequenceDiagram: Story = {
  args: sequenceGraph,
  parameters: {
    docs: {
      description: { story: 'Lifelines connected by synchronous and asynchronous message edges.' }
    }
  }
};

export const ActivityDiagram: Story = {
  args: activityGraph,
  parameters: {
    docs: {
      description: { story: 'Activity nodes connected with fork/join/decision/merge control nodes.' }
    }
  }
};

export const DefinitionUsageDiagram: Story = {
  args: definitionUsageGraph,
  parameters: {
    docs: {
      description: {
        story:
          'Part/action/port/item definitions and usages linked via specialization, definition, and flow/action-flow edges.'
      }
    }
  }
};

export const StructuralDefinitionView: Story = {
  args: {
    model: definitionUsageModel,
    viewpoint: structuralDefinitionViewpoint
  },
  parameters: {
    docs: {
      description: { story: 'SysML v2 Structural Definition Viewpoint realized automatically from the model specs.' }
    }
  }
};

export const UsageStructureView: Story = {
  args: {
    model: definitionUsageModel,
    viewpoint: usageStructureViewpoint
  },
  parameters: {
    docs: {
      description: {
        story: 'Usage-focused viewpoint showing how usages trace back to definitions via definition/action-flow edges.'
      }
    }
  }
};
