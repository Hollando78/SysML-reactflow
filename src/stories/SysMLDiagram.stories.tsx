import type { Meta, StoryObj } from '@storybook/react';

import {
  SysMLDiagram,
  createEdgesFromRelationships,
  createNodesFromSpecs,
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
