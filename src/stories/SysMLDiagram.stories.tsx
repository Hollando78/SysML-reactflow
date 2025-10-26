import type { Meta, StoryObj } from '@storybook/react';

import {
  SysMLDiagram,
  createActivityNode,
  createBlockNode,
  createEdgesFromRelationships,
  createNodesFromSpecs,
  createParametricNode,
  createRequirementNode,
  createSequenceLifelineNode,
  createSequenceMessageEdge,
  createStateMachineNode,
  createStateNode,
  createStateTransitionEdge,
  createUseCaseNode,
  type SysMLNodeSpec,
  type SysMLRelationshipSpec
} from '../index';

const nodeSpecs: SysMLNodeSpec[] = [
  {
    kind: 'requirement',
    spec: {
      id: 'REQ-001',
      name: 'Maintain Power',
      text: 'The spacecraft shall provide > 2kW continuous bus power.',
      verification: 'analysis',
      risk: 'high',
      status: 'reviewed',
      derivedFrom: ['MISSION-1'],
      stereotype: 'requirement'
    }
  },
  {
    kind: 'block-definition',
    spec: {
      id: 'BLK-PCM',
      name: 'Power Conditioning Module',
      stereotype: 'block',
      description: 'Manages battery charge/discharge and power routing.',
      parts: [
        { name: 'batteryMgr', type: 'BatteryManager' },
        { name: 'distribution', type: 'PowerDistribution' }
      ],
      values: [
        { name: 'efficiency', value: '94%' },
        { name: 'mass', value: '8.2 kg' }
      ],
      ports: [
        { name: 'busIn', direction: 'in', type: 'PowerFlow' },
        { name: 'busOut', direction: 'out', type: 'PowerFlow' }
      ],
      status: 'approved'
    }
  },
  {
    kind: 'activity',
    spec: {
      id: 'ACT-001',
      name: 'Balance Loads',
      actions: ['Observe telemetry', 'Predict load', 'Command switches'],
      inputs: [{ name: 'telemetry', type: 'PowerTelemetry' }],
      outputs: [{ name: 'commands', type: 'SwitchCommand' }],
      status: 'draft'
    }
  },
  {
    kind: 'parametric',
    spec: {
      id: 'PAR-001',
      name: 'LoadConstraint',
      equation: 'sum(load_i) <= 0.9 * capacity',
      parameters: [
        { name: 'load_i', type: 'kW' },
        { name: 'capacity', type: 'kW' }
      ]
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

const bddGraph = (() => {
  const nodes = createNodesFromSpecs(
    [
      {
        kind: 'block-definition',
        spec: {
          id: 'BLK-Power',
          name: 'PowerController',
          description: 'Coordinates distribution logic.',
          parts: [
            { name: 'batteryMgr', type: 'BatteryManager' },
            { name: 'telemetryBus', type: 'DataBus' }
          ],
          values: [{ name: 'priority', value: 'critical' }]
        }
      },
      {
        kind: 'block-definition',
        spec: {
          id: 'BLK-Battery',
          name: 'BatteryModule',
          description: 'Provides stored energy.',
          parts: [
            { name: 'cells', type: 'Li-IonPack', multiplicity: '8' },
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
  const controller = createBlockNode(
    {
      id: 'IBD-CONTROLLER',
      name: 'Controller',
      parts: [
        { name: 'psu', type: 'PowerSupply' },
        { name: 'swMatrix', type: 'SwitchMatrix' }
      ],
      ports: [
        { name: 'powerIn', direction: 'in', type: '28V' },
        { name: 'powerOut', direction: 'out', type: '28V' }
      ]
    },
    { x: 0, y: 40 },
    'internal-block'
  );

  const payload = createBlockNode(
    {
      id: 'IBD-PAYLOAD',
      name: 'PayloadBay',
      ports: [
        { name: 'powerIn', direction: 'in', type: '28V' },
        { name: 'telemetry', direction: 'out', type: 'CAN' }
      ]
    },
    { x: 380, y: 60 },
    'internal-block'
  );

  const monitor = createActivityNode(
    {
      id: 'IBD-MON',
      name: 'MonitorLoads',
      actions: ['Measure currents', 'Report anomalies'],
      inputs: [{ name: 'telemetry', type: 'CAN' }],
      outputs: [{ name: 'alerts', type: 'Event' }]
    },
    { x: 760, y: 140 }
  );

  const edges = createEdgesFromRelationships([
    { id: 'ibd-alloc', type: 'allocate', source: 'IBD-CONTROLLER', target: 'IBD-MON', label: 'allocate' },
    { id: 'ibd-dep', type: 'dependency', source: 'IBD-CONTROLLER', target: 'IBD-PAYLOAD', label: 'feeds' }
  ]);

  return { nodes: [controller, payload, monitor], edges };
})();

const useCaseGraph = (() => {
  const operator = createRequirementNode(
    {
      id: 'ACT-Operator',
      name: 'Operator',
      stereotype: 'actor',
      text: 'Ground operator interacts with the power system.'
    },
    { x: -120, y: 40 }
  );

  const managePower = createUseCaseNode(
    {
      id: 'UC-Manage',
      name: 'Manage Power',
      description: 'Configure loads and review reports.',
      actors: ['Operator'],
      includes: ['Log Telemetry']
    },
    { x: 200, y: 20 }
  );

  const logTelemetry = createUseCaseNode(
    {
      id: 'UC-Log',
      name: 'Log Telemetry',
      description: 'Persist all power events.',
      actors: ['Operator']
    },
    { x: 520, y: 100 }
  );

  const recover = createUseCaseNode(
    {
      id: 'UC-Recover',
      name: 'Recover From Fault',
      description: 'Isolate bad branches and restore nominal ops.',
      actors: ['Operator'],
      extends: ['Manage Power']
    },
    { x: 200, y: 260 }
  );

  const edges = createEdgesFromRelationships([
    { id: 'uc-include', type: 'include', source: 'UC-Manage', target: 'UC-Log', label: 'include' },
    { id: 'uc-extend', type: 'extend', source: 'UC-Recover', target: 'UC-Manage', label: 'extend' },
    { id: 'uc-actor', type: 'dependency', source: 'ACT-Operator', target: 'UC-Manage', label: 'interacts' }
  ]);

  return { nodes: [operator, managePower, logTelemetry, recover], edges };
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
    { id: 'SEQ-CTRL', name: 'Controller', classifier: 'BlockDefinition::Controller' },
    { x: 0, y: 0 }
  );
  const pcm = createSequenceLifelineNode(
    { id: 'SEQ-PCM', name: 'PCM', classifier: 'BlockDefinition::PCM' },
    { x: 260, y: 0 }
  );
  const load = createSequenceLifelineNode(
    { id: 'SEQ-LOAD', name: 'Load', classifier: 'BlockDefinition::Load' },
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
      description: { story: 'Block definition relationships between controller and battery modules.' }
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
