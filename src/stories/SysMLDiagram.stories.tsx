import type { Meta, StoryObj } from '@storybook/react';
import { useEffect, useState } from 'react';
import { ReactFlowProvider } from 'reactflow';
import {
  SysMLDiagram,
  createNodesFromSpecs,
  createEdgesFromRelationships,
  applyRecommendedLayout,
  createSequenceLifelineNode,
  createSequenceMessageEdge,
  createStateNode,
  createStateTransitionEdge,
  type SysMLNodeSpec,
  type SysMLRelationshipSpec,
  type SysMLReactFlowNode,
  type SysMLReactFlowEdge
} from '../index';

/**
 * SysML v2.0 Diagram Visualization
 *
 * This library provides React components for visualizing SysML v2.0 diagrams
 * with automatic layout and comprehensive element support.
 *
 * Features:
 * - 60+ SysML v2.0 element types
 * - Automatic graph layout (5 algorithms)
 * - Light and dark mode support
 * - Type-safe TypeScript APIs
 */
const meta = {
  title: 'SysML v2.0 Diagrams',
  component: SysMLDiagram,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Interactive SysML v2.0 diagram visualization powered by React Flow with automatic layout capabilities.'
      }
    }
  },
  tags: ['autodocs']
} satisfies Meta<typeof SysMLDiagram>;

export default meta;
type Story = StoryObj<typeof meta>;

// Helper component for auto-layout stories
const AutoLayoutStory = ({
  specs,
  relationships,
  diagramType,
  background = 'light'
}: {
  specs: SysMLNodeSpec[];
  relationships: SysMLRelationshipSpec[];
  diagramType: 'bdd' | 'requirements' | 'stateMachine' | 'activity' | 'sequence';
  background?: 'light' | 'dark';
}) => {
  const [nodes, setNodes] = useState<SysMLReactFlowNode[]>([]);
  const [edges, setEdges] = useState<SysMLReactFlowEdge[]>([]);

  useEffect(() => {
    async function layout() {
      const initialNodes = createNodesFromSpecs(specs);
      const initialEdges = createEdgesFromRelationships(relationships);
      const layoutedNodes = await applyRecommendedLayout(initialNodes, initialEdges, diagramType);
      setNodes(layoutedNodes);
      setEdges(initialEdges);
    }
    layout();
  }, [specs, relationships, diagramType]);

  return (
    <ReactFlowProvider>
      <div style={{
        width: '100%',
        height: '100vh',
        background: background === 'dark' ? '#0b0c0f' : '#ffffff'
      }}>
        <SysMLDiagram nodes={nodes} edges={edges} fitView />
      </div>
    </ReactFlowProvider>
  );
};

// ============================================================================
// Block Definition Diagram (BDD) - Structural Hierarchy
// ============================================================================

const bddSpecs: SysMLNodeSpec[] = [
  {
    kind: 'part-definition',
    spec: {
      id: 'vehicle',
      name: 'Vehicle',
      description: 'Electric vehicle system',
      attributes: [
        { name: 'mass', type: 'Real', multiplicity: '[kg]' },
        { name: 'range', type: 'Real', multiplicity: '[km]' }
      ]
    }
  },
  {
    kind: 'part-definition',
    spec: {
      id: 'powertrain',
      name: 'Powertrain',
      description: 'Electric propulsion system',
      attributes: [
        { name: 'maxPower', type: 'Real', multiplicity: '[kW]' }
      ]
    }
  },
  {
    kind: 'part-definition',
    spec: {
      id: 'battery',
      name: 'BatteryPack',
      description: 'Energy storage system',
      attributes: [
        { name: 'capacity', type: 'Real', multiplicity: '[kWh]' },
        { name: 'voltage', type: 'Real', multiplicity: '[V]' }
      ]
    }
  },
  {
    kind: 'part-definition',
    spec: {
      id: 'motor',
      name: 'ElectricMotor',
      description: 'Propulsion motor',
      attributes: [
        { name: 'power', type: 'Real', multiplicity: '[kW]' },
        { name: 'torque', type: 'Real', multiplicity: '[Nm]' }
      ]
    }
  },
  {
    kind: 'part-definition',
    spec: {
      id: 'controller',
      name: 'MotorController',
      description: 'Power electronics',
      attributes: [
        { name: 'efficiency', type: 'Real', multiplicity: '[%]' }
      ]
    }
  }
];

const bddRelationships: SysMLRelationshipSpec[] = [
  { id: 'e1', type: 'composition', source: 'vehicle', target: 'powertrain', label: 'contains' },
  { id: 'e2', type: 'composition', source: 'powertrain', target: 'battery', label: 'contains' },
  { id: 'e3', type: 'composition', source: 'powertrain', target: 'motor', label: 'contains' },
  { id: 'e4', type: 'composition', source: 'powertrain', target: 'controller', label: 'contains' }
];

export const BlockDefinitionDiagram_Light: Story = {
  render: () => <AutoLayoutStory specs={bddSpecs} relationships={bddRelationships} diagramType="bdd" background="light" />,
  parameters: {
    docs: {
      description: {
        story: 'Block Definition Diagram showing vehicle system hierarchy with automatic hierarchical layout. Light mode.'
      }
    }
  }
};

export const BlockDefinitionDiagram_Dark: Story = {
  render: () => <AutoLayoutStory specs={bddSpecs} relationships={bddRelationships} diagramType="bdd" background="dark" />,
  parameters: {
    docs: {
      description: {
        story: 'Block Definition Diagram showing vehicle system hierarchy with automatic hierarchical layout. Dark mode.'
      }
    }
  }
};

// ============================================================================
// Requirement Diagram - Requirements Hierarchy
// ============================================================================

const requirementSpecs: SysMLNodeSpec[] = [
  {
    kind: 'requirement-definition',
    spec: {
      id: 'sys-req',
      name: 'System Requirements',
      text: 'The vehicle shall meet all operational requirements'
    }
  },
  {
    kind: 'requirement-usage',
    spec: {
      id: 'perf-req',
      name: 'Performance Requirements',
      definition: 'sys-req',
      text: 'The vehicle shall achieve target performance metrics',
      status: 'reviewed'
    }
  },
  {
    kind: 'requirement-usage',
    spec: {
      id: 'safety-req',
      name: 'Safety Requirements',
      definition: 'sys-req',
      text: 'The vehicle shall operate safely in all conditions',
      status: 'approved'
    }
  },
  {
    kind: 'requirement-usage',
    spec: {
      id: 'speed-req',
      name: 'Maximum Speed',
      definition: 'perf-req',
      text: 'Top speed shall be at least 180 km/h',
      status: 'reviewed'
    }
  },
  {
    kind: 'requirement-usage',
    spec: {
      id: 'accel-req',
      name: 'Acceleration',
      definition: 'perf-req',
      text: '0-100 km/h in less than 6 seconds',
      status: 'reviewed'
    }
  },
  {
    kind: 'requirement-usage',
    spec: {
      id: 'range-req',
      name: 'Range',
      definition: 'perf-req',
      text: 'Minimum range of 400 km on single charge',
      status: 'draft'
    }
  }
];

const requirementRelationships: SysMLRelationshipSpec[] = [
  { id: 'e1', type: 'specialization', source: 'perf-req', target: 'sys-req', label: 'specializes' },
  { id: 'e2', type: 'specialization', source: 'safety-req', target: 'sys-req', label: 'specializes' },
  { id: 'e3', type: 'specialization', source: 'speed-req', target: 'perf-req', label: 'specializes' },
  { id: 'e4', type: 'specialization', source: 'accel-req', target: 'perf-req', label: 'specializes' },
  { id: 'e5', type: 'specialization', source: 'range-req', target: 'perf-req', label: 'specializes' }
];

export const RequirementDiagram_Light: Story = {
  render: () => <AutoLayoutStory specs={requirementSpecs} relationships={requirementRelationships} diagramType="requirements" background="light" />,
  parameters: {
    docs: {
      description: {
        story: 'Requirement hierarchy showing performance and safety requirements with status indicators. Light mode.'
      }
    }
  }
};

export const RequirementDiagram_Dark: Story = {
  render: () => <AutoLayoutStory specs={requirementSpecs} relationships={requirementRelationships} diagramType="requirements" background="dark" />,
  parameters: {
    docs: {
      description: {
        story: 'Requirement hierarchy showing performance and safety requirements with status indicators. Dark mode.'
      }
    }
  }
};

// ============================================================================
// State Machine Diagram - Behavioral States
// ============================================================================

const StateMachineStory = ({ background = 'light' }: { background?: 'light' | 'dark' }) => {
  const [nodes, setNodes] = useState<SysMLReactFlowNode[]>([]);
  const [edges, setEdges] = useState<SysMLReactFlowEdge[]>([]);

  useEffect(() => {
    async function layout() {
      const stateNodes = [
        createStateNode({ id: 'off', name: 'Off', entryAction: 'disablePower()', exitAction: 'logStateChange()' }, { x: 0, y: 0 }),
        createStateNode({ id: 'standby', name: 'Standby', entryAction: 'enableMonitoring()', doActivity: 'monitorBattery()', exitAction: 'logStateChange()' }, { x: 0, y: 0 }),
        createStateNode({ id: 'ready', name: 'Ready', entryAction: 'initializeSystems()', doActivity: 'checkSafety()', exitAction: 'logStateChange()' }, { x: 0, y: 0 }),
        createStateNode({ id: 'active', name: 'Active', entryAction: 'enableDrive()', doActivity: 'controlMotor()', exitAction: 'disableDrive()' }, { x: 0, y: 0 }),
        createStateNode({ id: 'fault', name: 'Fault', entryAction: 'triggerAlarm()', doActivity: 'logError()', exitAction: 'clearFault()' }, { x: 0, y: 0 })
      ];

      const transitions = [
        createStateTransitionEdge({ id: 't1', source: 'off', target: 'standby', trigger: 'powerOn', guard: 'batteryOk' }),
        createStateTransitionEdge({ id: 't2', source: 'standby', target: 'ready', trigger: 'startRequested', guard: 'systemsHealthy' }),
        createStateTransitionEdge({ id: 't3', source: 'ready', target: 'active', trigger: 'acceleratorPressed', guard: 'safetyCheckPass' }),
        createStateTransitionEdge({ id: 't4', source: 'active', target: 'ready', trigger: 'stopped' }),
        createStateTransitionEdge({ id: 't5', source: 'ready', target: 'standby', trigger: 'shutdown' }),
        createStateTransitionEdge({ id: 't6', source: 'standby', target: 'off', trigger: 'powerOff' }),
        createStateTransitionEdge({ id: 't7', source: 'active', target: 'fault', trigger: 'errorDetected' }),
        createStateTransitionEdge({ id: 't8', source: 'fault', target: 'standby', trigger: 'faultCleared', effect: 'resetSystem()' })
      ];

      const layoutedNodes = await applyRecommendedLayout(stateNodes, transitions, 'stateMachine');
      setNodes(layoutedNodes);
      setEdges(transitions);
    }
    layout();
  }, []);

  return (
    <ReactFlowProvider>
      <div style={{
        width: '100%',
        height: '100vh',
        background: background === 'dark' ? '#0b0c0f' : '#ffffff'
      }}>
        <SysMLDiagram nodes={nodes} edges={edges} fitView />
      </div>
    </ReactFlowProvider>
  );
};

export const StateMachineDiagram_Light: Story = {
  render: () => <StateMachineStory background="light" />,
  parameters: {
    docs: {
      description: {
        story: 'State machine for vehicle power management with entry/do/exit actions, triggers, and guards. Force-directed layout. Light mode.'
      }
    }
  }
};

export const StateMachineDiagram_Dark: Story = {
  render: () => <StateMachineStory background="dark" />,
  parameters: {
    docs: {
      description: {
        story: 'State machine for vehicle power management with entry/do/exit actions, triggers, and guards. Force-directed layout. Dark mode.'
      }
    }
  }
};

// ============================================================================
// Activity Diagram - Action Flow
// ============================================================================

const activitySpecs: SysMLNodeSpec[] = [
  {
    kind: 'action-definition',
    spec: {
      id: 'start',
      name: 'Start Vehicle',
      description: 'Initialize vehicle systems',
      outputs: [{ name: 'systemStatus', type: 'Status' }]
    }
  },
  {
    kind: 'action-usage',
    spec: {
      id: 'check-battery',
      name: 'Check Battery',
      definition: 'start',
      inputs: [{ name: 'systemStatus', type: 'Status' }],
      outputs: [{ name: 'batteryOk', type: 'Boolean' }]
    }
  },
  {
    kind: 'action-usage',
    spec: {
      id: 'init-motor',
      name: 'Initialize Motor',
      definition: 'start',
      inputs: [{ name: 'batteryOk', type: 'Boolean' }],
      outputs: [{ name: 'motorReady', type: 'Boolean' }]
    }
  },
  {
    kind: 'action-usage',
    spec: {
      id: 'enable-drive',
      name: 'Enable Drive',
      definition: 'start',
      inputs: [{ name: 'motorReady', type: 'Boolean' }],
      outputs: [{ name: 'driveEnabled', type: 'Boolean' }]
    }
  },
  {
    kind: 'action-usage',
    spec: {
      id: 'complete',
      name: 'Ready to Drive',
      definition: 'start',
      inputs: [{ name: 'driveEnabled', type: 'Boolean' }]
    }
  }
];

const activityRelationships: SysMLRelationshipSpec[] = [
  { id: 'e1', type: 'succession', source: 'start', target: 'check-battery', label: 'then' },
  { id: 'e2', type: 'succession', source: 'check-battery', target: 'init-motor', label: 'then' },
  { id: 'e3', type: 'succession', source: 'init-motor', target: 'enable-drive', label: 'then' },
  { id: 'e4', type: 'succession', source: 'enable-drive', target: 'complete', label: 'then' }
];

export const ActivityDiagram_Light: Story = {
  render: () => <AutoLayoutStory specs={activitySpecs} relationships={activityRelationships} diagramType="activity" background="light" />,
  parameters: {
    docs: {
      description: {
        story: 'Activity diagram showing vehicle startup action flow with inputs and outputs. Hierarchical layout. Light mode.'
      }
    }
  }
};

export const ActivityDiagram_Dark: Story = {
  render: () => <AutoLayoutStory specs={activitySpecs} relationships={activityRelationships} diagramType="activity" background="dark" />,
  parameters: {
    docs: {
      description: {
        story: 'Activity diagram showing vehicle startup action flow with inputs and outputs. Hierarchical layout. Dark mode.'
      }
    }
  }
};

// ============================================================================
// Sequence Diagram - Interaction
// ============================================================================

const SequenceDiagramStory = ({ background = 'light' }: { background?: 'light' | 'dark' }) => {
  const [nodes, setNodes] = useState<SysMLReactFlowNode[]>([]);
  const [edges, setEdges] = useState<SysMLReactFlowEdge[]>([]);

  useEffect(() => {
    async function layout() {
      const lifelines = [
        createSequenceLifelineNode({ id: 'driver', name: 'driver: Driver', classifier: 'Actor::Driver' }, { x: 0, y: 0 }),
        createSequenceLifelineNode({ id: 'controller', name: 'controller: VehicleController', classifier: 'Part::VehicleController' }, { x: 0, y: 0 }),
        createSequenceLifelineNode({ id: 'battery', name: 'battery: BatteryManager', classifier: 'Part::BatteryManager' }, { x: 0, y: 0 }),
        createSequenceLifelineNode({ id: 'motor', name: 'motor: MotorController', classifier: 'Part::MotorController' }, { x: 0, y: 0 })
      ];

      const messages = [
        createSequenceMessageEdge({ id: 'm1', type: 'sync', source: 'driver', target: 'controller', label: 'pressStartButton()' }),
        createSequenceMessageEdge({ id: 'm2', type: 'sync', source: 'controller', target: 'battery', label: 'checkStatus()' }),
        createSequenceMessageEdge({ id: 'm3', type: 'return', source: 'battery', target: 'controller', label: 'BatteryStatus(ok)' }),
        createSequenceMessageEdge({ id: 'm4', type: 'sync', source: 'controller', target: 'motor', label: 'initialize()', guard: 'batteryOk' }),
        createSequenceMessageEdge({ id: 'm5', type: 'return', source: 'motor', target: 'controller', label: 'MotorStatus(ready)' }),
        createSequenceMessageEdge({ id: 'm6', type: 'async', source: 'controller', target: 'driver', label: 'displayReadyStatus()' })
      ];

      const layoutedNodes = await applyRecommendedLayout(lifelines, messages, 'sequence');
      setNodes(layoutedNodes);
      setEdges(messages);
    }
    layout();
  }, []);

  return (
    <ReactFlowProvider>
      <div style={{
        width: '100%',
        height: '100vh',
        background: background === 'dark' ? '#0b0c0f' : '#ffffff'
      }}>
        <SysMLDiagram nodes={nodes} edges={edges} fitView />
      </div>
    </ReactFlowProvider>
  );
};

export const SequenceDiagram_Light: Story = {
  render: () => <SequenceDiagramStory background="light" />,
  parameters: {
    docs: {
      description: {
        story: 'Sequence diagram showing vehicle startup interaction with sync/async messages and return values. Automatic horizontal lifeline layout. Light mode.'
      }
    }
  }
};

export const SequenceDiagram_Dark: Story = {
  render: () => <SequenceDiagramStory background="dark" />,
  parameters: {
    docs: {
      description: {
        story: 'Sequence diagram showing vehicle startup interaction with sync/async messages and return values. Automatic horizontal lifeline layout. Dark mode.'
      }
    }
  }
};

// ============================================================================
// Allocation Diagram - System to Subsystem Allocation
// ============================================================================

const allocationSpecs: SysMLNodeSpec[] = [
  {
    kind: 'requirement-usage',
    spec: {
      id: 'perf-001',
      name: 'Performance Requirement',
      text: 'System shall achieve 0-100 km/h in < 6s',
      status: 'approved'
    }
  },
  {
    kind: 'part-definition',
    spec: {
      id: 'motor-sys',
      name: 'MotorSystem',
      description: 'Electric propulsion',
      attributes: [
        { name: 'power', type: 'Real', multiplicity: '[kW]' }
      ]
    }
  },
  {
    kind: 'action-definition',
    spec: {
      id: 'accelerate',
      name: 'Accelerate',
      description: 'Control motor acceleration',
      inputs: [{ name: 'throttle', type: 'Real' }],
      outputs: [{ name: 'torque', type: 'Real' }]
    }
  },
  {
    kind: 'constraint-definition',
    spec: {
      id: 'accel-constraint',
      name: 'AccelerationConstraint',
      description: 'torque >= requiredTorque(speed)'
    }
  }
];

const allocationRelationships: SysMLRelationshipSpec[] = [
  { id: 'e1', type: 'satisfy', source: 'motor-sys', target: 'perf-001', label: 'satisfies' },
  { id: 'e2', type: 'allocate', source: 'motor-sys', target: 'accelerate', label: 'allocated to' },
  { id: 'e3', type: 'refine', source: 'accelerate', target: 'accel-constraint', label: 'refines' }
];

export const AllocationDiagram_Light: Story = {
  render: () => <AutoLayoutStory specs={allocationSpecs} relationships={allocationRelationships} diagramType="requirements" background="light" />,
  parameters: {
    docs: {
      description: {
        story: 'Allocation diagram showing how requirements are satisfied by parts, allocated to actions, and refined by constraints. Light mode.'
      }
    }
  }
};

export const AllocationDiagram_Dark: Story = {
  render: () => <AutoLayoutStory specs={allocationSpecs} relationships={allocationRelationships} diagramType="requirements" background="dark" />,
  parameters: {
    docs: {
      description: {
        story: 'Allocation diagram showing how requirements are satisfied by parts, allocated to actions, and refined by constraints. Dark mode.'
      }
    }
  }
};

// ============================================================================
// Use Case Diagram
// ============================================================================

const useCaseSpecs: SysMLNodeSpec[] = [
  {
    kind: 'use-case-definition',
    spec: {
      id: 'drive-vehicle',
      name: 'Drive Vehicle',
      description: 'Operate vehicle in normal driving mode'
    }
  },
  {
    kind: 'use-case-usage',
    spec: {
      id: 'start-vehicle',
      name: 'Start Vehicle',
      definition: 'drive-vehicle'
    }
  },
  {
    kind: 'use-case-usage',
    spec: {
      id: 'monitor-battery',
      name: 'Monitor Battery',
      definition: 'drive-vehicle'
    }
  },
  {
    kind: 'use-case-usage',
    spec: {
      id: 'charge-battery',
      name: 'Charge Battery',
      definition: 'drive-vehicle'
    }
  }
];

const useCaseRelationships: SysMLRelationshipSpec[] = [
  { id: 'e1', type: 'include', source: 'drive-vehicle', target: 'start-vehicle', label: 'includes' },
  { id: 'e2', type: 'include', source: 'drive-vehicle', target: 'monitor-battery', label: 'includes' },
  { id: 'e3', type: 'extend', source: 'charge-battery', target: 'monitor-battery', label: 'extends' }
];

export const UseCaseDiagram_Light: Story = {
  render: () => <AutoLayoutStory specs={useCaseSpecs} relationships={useCaseRelationships} diagramType="requirements" background="light" />,
  parameters: {
    docs: {
      description: {
        story: 'Use case diagram showing vehicle operation scenarios with include and extend relationships. Light mode.'
      }
    }
  }
};

export const UseCaseDiagram_Dark: Story = {
  render: () => <AutoLayoutStory specs={useCaseSpecs} relationships={useCaseRelationships} diagramType="requirements" background="dark" />,
  parameters: {
    docs: {
      description: {
        story: 'Use case diagram showing vehicle operation scenarios with include and extend relationships. Dark mode.'
      }
    }
  }
};
