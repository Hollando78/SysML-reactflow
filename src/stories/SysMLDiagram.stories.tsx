import type { Meta, StoryObj } from '@storybook/react';
import { useEffect, useState } from 'react';
import { ReactFlowProvider } from 'reactflow';
import {
  SysMLDiagram,
  createNodesFromSpecs,
  createEdgesFromRelationships,
  createSequenceLifelineNode,
  createSequenceMessageEdge,
  createStateNode,
  createStateTransitionEdge,
  layoutAndRoute,
  layoutAndRouteFromSpecs,
  recommendedLayouts,
  type SysMLNodeSpec,
  type SysMLRelationshipSpec,
  type SysMLReactFlowNode,
  type SysMLReactFlowEdge,
  type LayoutPipelineOptions
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
  title: 'Examples/Diagram Gallery',
  component: SysMLDiagram,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Gallery of pre-materialized SysML diagrams generated from explicit nodes/edges to demonstrate layout pipelines and styling.'
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
      const { nodes: layoutedNodes, edges: layoutedEdges } = await layoutAndRouteFromSpecs(
        specs,
        relationships,
        diagramType,
        { measure: true }
      );
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
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
      status: 'approved' as const
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

      const { nodes: layoutedNodes, edges: layoutedEdges } = await layoutAndRoute(
        stateNodes,
        transitions,
        { measure: true, ...recommendedLayouts.stateMachine }
      );
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
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

      const { nodes: layoutedNodes, edges: layoutedEdges } = await layoutAndRoute(
        lifelines,
        messages,
        { measure: true, ...recommendedLayouts.sequence }
      );
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
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
      status: 'approved' as const
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

// ============================================================================
// Specialization Hierarchy - Hollow Triangle Markers
// ============================================================================

const specializationSpecs: SysMLNodeSpec[] = [
  {
    kind: 'part-definition',
    spec: {
      id: 'vehicle-base',
      name: 'Vehicle',
      description: 'Base vehicle definition',
      attributes: [
        { name: 'vin', type: 'String' },
        { name: 'mass', type: 'Real', multiplicity: '[kg]' }
      ]
    }
  },
  {
    kind: 'part-definition',
    spec: {
      id: 'electric-vehicle',
      name: 'ElectricVehicle',
      description: 'Electric vehicle specialization',
      attributes: [
        { name: 'batteryCapacity', type: 'Real', multiplicity: '[kWh]' },
        { name: 'range', type: 'Real', multiplicity: '[km]' }
      ]
    }
  },
  {
    kind: 'part-definition',
    spec: {
      id: 'hybrid-vehicle',
      name: 'HybridVehicle',
      description: 'Hybrid vehicle specialization',
      attributes: [
        { name: 'fuelCapacity', type: 'Real', multiplicity: '[L]' },
        { name: 'electricRange', type: 'Real', multiplicity: '[km]' }
      ]
    }
  },
  {
    kind: 'part-definition',
    spec: {
      id: 'sedan',
      name: 'ElectricSedan',
      description: 'Electric sedan variant',
      attributes: [
        { name: 'seatingCapacity', type: 'Integer' }
      ]
    }
  },
  {
    kind: 'part-definition',
    spec: {
      id: 'suv',
      name: 'ElectricSUV',
      description: 'Electric SUV variant',
      attributes: [
        { name: 'cargoVolume', type: 'Real', multiplicity: '[L]' }
      ]
    }
  }
];

const specializationRelationships: SysMLRelationshipSpec[] = [
  { id: 'e1', type: 'specialization', source: 'electric-vehicle', target: 'vehicle-base', label: 'specializes' },
  { id: 'e2', type: 'specialization', source: 'hybrid-vehicle', target: 'vehicle-base', label: 'specializes' },
  { id: 'e3', type: 'specialization', source: 'sedan', target: 'electric-vehicle', label: 'specializes' },
  { id: 'e4', type: 'specialization', source: 'suv', target: 'electric-vehicle', label: 'specializes' }
];

export const SpecializationHierarchy_Light: Story = {
  render: () => <AutoLayoutStory specs={specializationSpecs} relationships={specializationRelationships} diagramType="bdd" background="light" />,
  parameters: {
    docs: {
      description: {
        story: 'Specialization hierarchy showing inheritance with hollow triangle markers (white triangles pointing to parent). Demonstrates proper UML/SysML generalization notation. Light mode.'
      }
    }
  }
};

export const SpecializationHierarchy_Dark: Story = {
  render: () => <AutoLayoutStory specs={specializationSpecs} relationships={specializationRelationships} diagramType="bdd" background="dark" />,
  parameters: {
    docs: {
      description: {
        story: 'Specialization hierarchy showing inheritance with hollow triangle markers (white triangles pointing to parent). Demonstrates proper UML/SysML generalization notation. Dark mode.'
      }
    }
  }
};

// ============================================================================
// Composition vs Aggregation - Diamond Markers
// ============================================================================

const compositionAggregationSpecs: SysMLNodeSpec[] = [
  {
    kind: 'part-definition',
    spec: {
      id: 'car',
      name: 'Car',
      description: 'Complete vehicle'
    }
  },
  {
    kind: 'part-definition',
    spec: {
      id: 'engine',
      name: 'Engine',
      description: 'Cannot exist without car (composition)'
    }
  },
  {
    kind: 'part-definition',
    spec: {
      id: 'chassis',
      name: 'Chassis',
      description: 'Cannot exist without car (composition)'
    }
  },
  {
    kind: 'part-definition',
    spec: {
      id: 'wheel',
      name: 'Wheel',
      description: 'Can exist independently (aggregation)',
      attributes: [
        { name: 'diameter', type: 'Real', multiplicity: '[inch]' }
      ]
    }
  },
  {
    kind: 'part-definition',
    spec: {
      id: 'battery',
      name: 'Battery',
      description: 'Can be removed/replaced (aggregation)',
      attributes: [
        { name: 'capacity', type: 'Real', multiplicity: '[kWh]' }
      ]
    }
  }
];

const compositionAggregationRelationships: SysMLRelationshipSpec[] = [
  { id: 'e1', type: 'composition', source: 'car', target: 'engine', label: '◆ composition' },
  { id: 'e2', type: 'composition', source: 'car', target: 'chassis', label: '◆ composition' },
  { id: 'e3', type: 'aggregation', source: 'car', target: 'wheel', label: '◇ aggregation [4]' },
  { id: 'e4', type: 'aggregation', source: 'car', target: 'battery', label: '◇ aggregation' }
];

export const CompositionVsAggregation_Light: Story = {
  render: () => <AutoLayoutStory specs={compositionAggregationSpecs} relationships={compositionAggregationRelationships} diagramType="bdd" background="light" />,
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates the difference between composition (filled black diamond) and aggregation (hollow white diamond). Composition indicates strong ownership where parts cannot exist without the whole. Light mode.'
      }
    }
  }
};

export const CompositionVsAggregation_Dark: Story = {
  render: () => <AutoLayoutStory specs={compositionAggregationSpecs} relationships={compositionAggregationRelationships} diagramType="bdd" background="dark" />,
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates the difference between composition (filled black diamond) and aggregation (hollow white diamond). Composition indicates strong ownership where parts cannot exist without the whole. Dark mode.'
      }
    }
  }
};

// ============================================================================
// System Decomposition - Three-Level Breakdown
// ============================================================================

const decompositionSpecs: SysMLNodeSpec[] = [
  {
    kind: 'part-definition',
    spec: {
      id: 'sys-orbital-comm',
      name: 'OrbitalCommsSystem',
      description: 'Provides continuous communications between ground and orbital assets.',
      attributes: [
        { name: 'coverage', type: 'Percentage', multiplicity: '[>95%]' },
        { name: 'latency', type: 'Duration', multiplicity: '[<200ms]' }
      ]
    }
  },
  {
    kind: 'part-definition',
    spec: {
      id: 'sub-communications',
      name: 'CommunicationsSubsystem',
      description: 'Handles RF front-end and digital signal processing.',
      ports: [
        { name: 'payloadLink', type: 'KaBand', direction: 'in' },
        { name: 'downlink', type: 'KuBand', direction: 'out' }
      ]
    }
  },
  {
    kind: 'part-definition',
    spec: {
      id: 'sub-platform',
      name: 'PlatformSubsystem',
      description: 'Provides power, thermal and attitude resources for the payload.',
      ports: [
        { name: 'powerBus', type: '28V', direction: 'out' },
        { name: 'telemetryBus', type: 'SpaceWire', direction: 'in' }
      ]
    }
  },
  {
    kind: 'part-definition',
    spec: {
      id: 'comp-rf-front-end',
      name: 'RFFrontEnd',
      description: 'Performs RF switching, amplification and filtering.'
    }
  },
  {
    kind: 'part-definition',
    spec: {
      id: 'comp-signal-processor',
      name: 'SignalProcessor',
      description: 'Executes modulation, demodulation and coding algorithms.'
    }
  },
  {
    kind: 'part-definition',
    spec: {
      id: 'comp-thermal-control',
      name: 'ThermalControlUnit',
      description: 'Maintains payload temperature limits.'
    }
  },
  {
    kind: 'part-definition',
    spec: {
      id: 'comp-power-regulator',
      name: 'PowerRegulator',
      description: 'Regulates spacecraft power distribution.'
    }
  }
];

const decompositionRelationships: SysMLRelationshipSpec[] = [
  { id: 'rel-system-comm', type: 'composition', source: 'sys-orbital-comm', target: 'sub-communications', label: 'composes' },
  { id: 'rel-system-platform', type: 'composition', source: 'sys-orbital-comm', target: 'sub-platform', label: 'composes' },
  { id: 'rel-comm-rf', type: 'composition', source: 'sub-communications', target: 'comp-rf-front-end', label: 'contains' },
  { id: 'rel-comm-processor', type: 'composition', source: 'sub-communications', target: 'comp-signal-processor', label: 'contains' },
  { id: 'rel-platform-thermal', type: 'composition', source: 'sub-platform', target: 'comp-thermal-control', label: 'contains' },
  { id: 'rel-platform-power', type: 'composition', source: 'sub-platform', target: 'comp-power-regulator', label: 'contains' }
];

export const SystemDecomposition: Story = {
  render: () => <AutoLayoutStory specs={decompositionSpecs} relationships={decompositionRelationships} diagramType="bdd" background="light" />,
  parameters: {
    docs: {
      description: {
        story: 'Three-level system decomposition showing system, subsystem, and component parts with composition relationships.'
      }
    }
  }
};

// ============================================================================
// Component Interface View
// ============================================================================

const interfaceSpecs: SysMLNodeSpec[] = [
  {
    kind: 'part-definition',
    spec: {
      id: 'part-guidance-computer',
      name: 'GuidanceComputer',
      description: 'Central flight computer providing guidance, navigation, and control.',
      ports: [
        { name: 'commandOut', type: 'CommandBus', direction: 'out' },
        { name: 'telemetryIn', type: 'TelemetryBus', direction: 'in' }
      ]
    }
  },
  {
    kind: 'part-definition',
    spec: {
      id: 'part-throttle-ctrl',
      name: 'ThrottleController',
      description: 'Executes throttle commands against propulsion actuators.',
      ports: [
        { name: 'commandIn', type: 'CommandBus', direction: 'in' },
        { name: 'statusOut', type: 'StatusBus', direction: 'out' }
      ]
    }
  },
  {
    kind: 'part-definition',
    spec: {
      id: 'part-nav-sensor',
      name: 'NavigationSensor',
      description: 'Provides inertial measurement updates and state estimates.',
      ports: [
        { name: 'stateOut', type: 'StateFeedback', direction: 'out' },
        { name: 'healthOut', type: 'StatusBus', direction: 'out' }
      ]
    }
  },
  {
    kind: 'part-definition',
    spec: {
      id: 'part-actuator-cluster',
      name: 'ActuatorCluster',
      description: 'Group of propulsion actuators implementing thrust commands.',
      ports: [
        { name: 'throttleIn', type: 'CommandBus', direction: 'in' },
        { name: 'statusTelemetry', type: 'StatusBus', direction: 'out' }
      ]
    }
  },
  {
    kind: 'interface-definition',
    spec: {
      id: 'if-command-bus',
      name: 'CommandBus',
      description: 'Logical interface carrying guidance commands.',
      ports: [{ name: 'command', type: 'CommandFrame', direction: 'out' }]
    }
  },
  {
    kind: 'interface-definition',
    spec: {
      id: 'if-status-bus',
      name: 'StatusBus',
      description: 'Publishes health and limit monitoring status across components.',
      ports: [{ name: 'status', type: 'StatusFrame', direction: 'out' }]
    }
  },
  {
    kind: 'interface-definition',
    spec: {
      id: 'if-state-feedback',
      name: 'StateFeedback',
      description: 'Streaming telemetry interface for attitude and rate estimates.',
      ports: [{ name: 'stateVector', type: 'StateVector', direction: 'out' }]
    }
  }
];

const interfaceRelationships: SysMLRelationshipSpec[] = [
  { id: 'rel-guidance-command', type: 'flow-connection', source: 'part-guidance-computer', target: 'part-throttle-ctrl', label: 'commandOut → commandIn' },
  { id: 'rel-guidance-actuators', type: 'flow-connection', source: 'part-guidance-computer', target: 'part-actuator-cluster', label: 'commandOut → throttleIn' },
  { id: 'rel-sensor-guidance', type: 'flow-connection', source: 'part-nav-sensor', target: 'part-guidance-computer', label: 'stateOut → telemetryIn' },
  { id: 'rel-sensor-status', type: 'flow-connection', source: 'part-nav-sensor', target: 'part-throttle-ctrl', label: 'healthOut → statusOut' },
  { id: 'rel-actuator-status', type: 'flow-connection', source: 'part-actuator-cluster', target: 'part-guidance-computer', label: 'statusTelemetry → telemetryIn' },
  { id: 'rel-command-interface', type: 'feature-typing', source: 'part-guidance-computer', target: 'if-command-bus', label: 'uses CommandBus' },
  { id: 'rel-status-interface', type: 'feature-typing', source: 'part-throttle-ctrl', target: 'if-status-bus', label: 'publishes StatusBus' },
  { id: 'rel-state-interface', type: 'feature-typing', source: 'part-nav-sensor', target: 'if-state-feedback', label: 'provides StateFeedback' }
];

export const ComponentInterfaceView: Story = {
  render: () => <AutoLayoutStory specs={interfaceSpecs} relationships={interfaceRelationships} diagramType="bdd" background="light" />,
  parameters: {
    docs: {
      description: {
        story: 'Interface diagram illustrating shared buses and flow connections between collaborating components.'
      }
    }
  }
};

// ============================================================================
// Requirements Schema - Traceability Pattern
// ============================================================================

const requirementSchemaSpecs: SysMLNodeSpec[] = [
  {
    kind: 'requirement-definition',
    spec: {
      id: 'reqdef-mission',
      name: 'MissionRequirement',
      text: 'Describes the overall mission capability the system must deliver.'
    }
  },
  {
    kind: 'requirement-definition',
    spec: {
      id: 'reqdef-performance',
      name: 'PerformanceRequirement',
      text: 'Quantifies performance thresholds the system shall achieve.'
    }
  },
  {
    kind: 'requirement-definition',
    spec: {
      id: 'reqdef-thermal',
      name: 'ThermalRequirement',
      text: 'System shall maintain component temperatures within allowable limits.'
    }
  },
  {
    kind: 'requirement-usage',
    spec: {
      id: 'requse-thermal-stable',
      name: 'MaintainThermalStability',
      definition: 'reqdef-thermal',
      text: 'Payload electronics shall operate between -10°C and 50°C.',
      status: 'reviewed' as const
    }
  },
  {
    kind: 'constraint-definition',
    spec: {
      id: 'constraint-thermal',
      name: 'ThermalConstraint',
      description: 'temperature <= 50°C && temperature >= -10°C'
    }
  },
  {
    kind: 'analysis-case-definition',
    spec: {
      id: 'analysis-thermal',
      name: 'ThermalAnalysisCase',
      description: 'Analytical demonstration of worst-case thermal behaviour.'
    }
  },
  {
    kind: 'verification-case-definition',
    spec: {
      id: 'verification-thermal',
      name: 'ThermalVerificationCase',
      description: 'Environmental chamber test verifying thermal compliance.'
    }
  }
];

const requirementSchemaRelationships: SysMLRelationshipSpec[] = [
  { id: 'rel-performance-mission', type: 'specialization', source: 'reqdef-performance', target: 'reqdef-mission', label: 'specialises' },
  { id: 'rel-thermal-mission', type: 'specialization', source: 'reqdef-thermal', target: 'reqdef-mission', label: 'specialises' },
  { id: 'rel-thermal-usage-definition', type: 'type-featuring', source: 'requse-thermal-stable', target: 'reqdef-thermal', label: 'usage of' },
  { id: 'rel-thermal-refine', type: 'refine', source: 'constraint-thermal', target: 'requse-thermal-stable', label: 'refines' },
  { id: 'rel-analysis-refines', type: 'refine', source: 'analysis-thermal', target: 'constraint-thermal', label: 'refines' },
  { id: 'rel-verification-verifies', type: 'verify', source: 'verification-thermal', target: 'requse-thermal-stable', label: 'verifies' }
];

export const RequirementsSchema: Story = {
  render: () => <AutoLayoutStory specs={requirementSchemaSpecs} relationships={requirementSchemaRelationships} diagramType="requirements" background="light" />,
  parameters: {
    docs: {
      description: {
        story: 'Requirements schema linking mission, derived requirements, constraints, analysis, and verification cases.'
      }
    }
  }
};

// ============================================================================
// Functional Flow - Activity Sequencing
// ============================================================================

const functionalSpecs: SysMLNodeSpec[] = [
  {
    kind: 'action-definition',
    spec: {
      id: 'actdef-guidance-loop',
      name: 'ExecuteGuidanceLoop',
      description: 'Core closed-loop guidance, navigation, and control behaviour.'
    }
  },
  {
    kind: 'action-usage',
    spec: {
      id: 'act-sense-state',
      name: 'SenseState',
      definition: 'actdef-guidance-loop',
      description: 'Acquire inertial sensor measurements and vehicle state.',
      outputs: [{ name: 'stateEstimate', type: 'StateVector' }]
    }
  },
  {
    kind: 'action-usage',
    spec: {
      id: 'act-estimate-trajectory',
      name: 'EstimateTrajectory',
      definition: 'actdef-guidance-loop',
      inputs: [{ name: 'stateEstimate', type: 'StateVector' }],
      outputs: [{ name: 'trajectoryState', type: 'Trajectory' }]
    }
  },
  {
    kind: 'action-usage',
    spec: {
      id: 'act-compute-control',
      name: 'ComputeControlLaw',
      definition: 'actdef-guidance-loop',
      inputs: [{ name: 'trajectoryState', type: 'Trajectory' }],
      outputs: [{ name: 'controlCommand', type: 'CommandFrame' }]
    }
  },
  {
    kind: 'perform-action',
    spec: {
      id: 'act-command-actuators',
      name: 'CommandActuators',
      performedAction: 'ActuatorCluster',
      inputs: [{ name: 'controlCommand', type: 'CommandFrame' }],
      outputs: [{ name: 'appliedThrust', type: 'ThrustVector' }]
    }
  },
  {
    kind: 'activity-control',
    spec: {
      id: 'ctrl-decision',
      name: 'FlightModeDecision',
      controlType: 'decision'
    }
  },
  {
    kind: 'action-usage',
    spec: {
      id: 'act-publish-telemetry',
      name: 'PublishTelemetry',
      definition: 'actdef-guidance-loop',
      inputs: [
        { name: 'stateEstimate', type: 'StateVector' },
        { name: 'appliedThrust', type: 'ThrustVector' }
      ]
    }
  }
];

const functionalRelationships: SysMLRelationshipSpec[] = [
  { id: 'rel-sense-estimate', type: 'succession', source: 'act-sense-state', target: 'act-estimate-trajectory', label: 'then' },
  { id: 'rel-estimate-control', type: 'succession', source: 'act-estimate-trajectory', target: 'act-compute-control', label: 'then' },
  { id: 'rel-control-command', type: 'succession', source: 'act-compute-control', target: 'act-command-actuators', label: 'then' },
  { id: 'rel-command-telemetry', type: 'succession', source: 'act-command-actuators', target: 'act-publish-telemetry', label: 'feeds' },
  { id: 'rel-sense-decision', type: 'control-flow', source: 'act-sense-state', target: 'ctrl-decision', label: 'monitor limits' },
  { id: 'rel-decision-telemetry', type: 'control-flow', source: 'ctrl-decision', target: 'act-publish-telemetry', label: 'route mode' }
];

export const FunctionalFlow: Story = {
  render: () => <AutoLayoutStory specs={functionalSpecs} relationships={functionalRelationships} diagramType="activity" background="light" />,
  parameters: {
    docs: {
      description: {
        story: 'Functional activity flow showing sensing, estimation, control computation, actuator command, and telemetry publication.'
      }
    }
  }
};

// ============================================================================
// Multi-Directional Connections - Showcasing 4-Way Handles
// ============================================================================

const multiDirectionalSpecs: SysMLNodeSpec[] = [
  {
    kind: 'part-definition',
    spec: {
      id: 'center',
      name: 'CentralHub',
      description: 'Connects to all directions'
    }
  },
  {
    kind: 'part-definition',
    spec: {
      id: 'north',
      name: 'NorthComponent',
      description: 'Connected from top'
    }
  },
  {
    kind: 'part-definition',
    spec: {
      id: 'east',
      name: 'EastComponent',
      description: 'Connected from right'
    }
  },
  {
    kind: 'part-definition',
    spec: {
      id: 'south',
      name: 'SouthComponent',
      description: 'Connected from bottom'
    }
  },
  {
    kind: 'part-definition',
    spec: {
      id: 'west',
      name: 'WestComponent',
      description: 'Connected from left'
    }
  }
];

const multiDirectionalRelationships: SysMLRelationshipSpec[] = [
  { id: 'e1', type: 'composition', source: 'center', target: 'north', label: 'top' },
  { id: 'e2', type: 'composition', source: 'center', target: 'east', label: 'right' },
  { id: 'e3', type: 'composition', source: 'center', target: 'south', label: 'bottom' },
  { id: 'e4', type: 'composition', source: 'center', target: 'west', label: 'left' }
];

export const MultiDirectionalConnections_Light: Story = {
  render: () => <AutoLayoutStory specs={multiDirectionalSpecs} relationships={multiDirectionalRelationships} diagramType="bdd" background="light" />,
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates 4-way connection handles with orthogonal routing. Each node can connect from top, right, bottom, or left. React Flow automatically selects optimal connection points. Light mode.'
      }
    }
  }
};

export const MultiDirectionalConnections_Dark: Story = {
  render: () => <AutoLayoutStory specs={multiDirectionalSpecs} relationships={multiDirectionalRelationships} diagramType="bdd" background="dark" />,
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates 4-way connection handles with orthogonal routing. Each node can connect from top, right, bottom, or left. React Flow automatically selects optimal connection points. Dark mode.'
      }
    }
  }
};

// ============================================================================
// Complex Relationship Graph - All Edge Types
// ============================================================================

const complexSpecs: SysMLNodeSpec[] = [
  {
    kind: 'requirement-usage',
    spec: {
      id: 'req-perf',
      name: 'Performance Requirement',
      text: 'System shall achieve target performance',
      status: 'approved'
    }
  },
  {
    kind: 'part-definition',
    spec: {
      id: 'system',
      name: 'VehicleSystem',
      description: 'Main system definition',
      attributes: [
        { name: 'systemId', type: 'String' }
      ]
    }
  },
  {
    kind: 'part-definition',
    spec: {
      id: 'subsystem',
      name: 'PowertrainSubsystem',
      description: 'Subsystem specialization'
    }
  },
  {
    kind: 'action-definition',
    spec: {
      id: 'action-ctrl',
      name: 'ControlPower',
      description: 'Control action',
      inputs: [{ name: 'demand', type: 'Real' }],
      outputs: [{ name: 'power', type: 'Real' }]
    }
  },
  {
    kind: 'constraint-definition',
    spec: {
      id: 'constraint',
      name: 'PowerConstraint',
      description: 'power <= maxPower'
    }
  }
];

const complexRelationships: SysMLRelationshipSpec[] = [
  { id: 'e1', type: 'satisfy', source: 'system', target: 'req-perf', label: 'satisfies' },
  { id: 'e2', type: 'specialization', source: 'subsystem', target: 'system', label: 'specializes' },
  { id: 'e3', type: 'allocate', source: 'subsystem', target: 'action-ctrl', label: 'allocates' },
  { id: 'e4', type: 'refine', source: 'action-ctrl', target: 'constraint', label: 'refines' },
  { id: 'e5', type: 'verify', source: 'action-ctrl', target: 'req-perf', label: 'verifies' }
];

export const ComplexRelationshipGraph_Light: Story = {
  render: () => <AutoLayoutStory specs={complexSpecs} relationships={complexRelationships} diagramType="requirements" background="light" />,
  parameters: {
    docs: {
      description: {
        story: 'Complex graph showing multiple SysML relationship types: satisfy (open arrow, dashed), specialization (hollow triangle), allocate (open arrow, dashed), refine (open arrow, dashed), verify (open arrow, dashed). Demonstrates comprehensive edge marker support. Light mode.'
      }
    }
  }
};

export const ComplexRelationshipGraph_Dark: Story = {
  render: () => <AutoLayoutStory specs={complexSpecs} relationships={complexRelationships} diagramType="requirements" background="dark" />,
  parameters: {
    docs: {
      description: {
        story: 'Complex graph showing multiple SysML relationship types: satisfy (open arrow, dashed), specialization (hollow triangle), allocate (open arrow, dashed), refine (open arrow, dashed), verify (open arrow, dashed). Demonstrates comprehensive edge marker support. Dark mode.'
      }
    }
  }
};

// ============================================================================
// Derive — Remote Weapon Station (RWS) Context Diagram
// ============================================================================

const rwsContextSpecs: SysMLNodeSpec[] = [
  {
    kind: 'part-definition',
    spec: {
      id: 'rws-system',
      name: 'Remote Weapon Station (RWS)',
      stereotype: 'system',
      description: 'Remotely operated weapon station mounted on a host vehicle platform.',
      ports: [
        { name: 'commandIn', type: 'OperatorCommand', direction: 'in' },
        { name: 'sensorVideo', type: 'VideoStream', direction: 'out' },
        { name: 'powerIn', type: '28VDC', direction: 'in' },
        { name: 'tdlIn', type: 'TargetHandoff', direction: 'in' },
        { name: 'tdlOut', type: 'EngagementData', direction: 'out' }
      ]
    }
  },
  { kind: 'part-usage', spec: { id: 'actor-commander', name: 'Vehicle Commander', stereotype: 'actor', description: 'Primary operator issuing commands and receiving sensor video.' } },
  { kind: 'part-usage', spec: { id: 'actor-infantry', name: 'Dismounted Infantry', stereotype: 'actor', description: 'Receives fire support and hazard zone alerts.' } },
  { kind: 'part-usage', spec: { id: 'actor-maintainer', name: 'Weapons Maintainer', stereotype: 'actor', description: 'Performs maintenance and diagnostics.' } },
  { kind: 'part-definition', spec: { id: 'ext-vehicle', name: 'Host Vehicle Platform', stereotype: 'external', description: '28VDC power, CAN-bus, mounting.' } },
  { kind: 'part-definition', spec: { id: 'ext-tdl', name: 'Tactical Data Link', stereotype: 'external', description: 'Target handoff, BFT, ROE.' } },
  { kind: 'part-definition', spec: { id: 'ext-ammo', name: 'Ammunition Supply', stereotype: 'external', description: 'Belted ammunition feed.' } },
  { kind: 'part-definition', spec: { id: 'ext-gps', name: 'GPS / Navigation', stereotype: 'external', description: 'Position and heading.' } }
];

const rwsContextRelationships: SysMLRelationshipSpec[] = [
  { id: 'ctx-e1', type: 'flow-connection', source: 'actor-commander', target: 'rws-system', label: 'Commands, target designation' },
  { id: 'ctx-e2', type: 'flow-connection', source: 'rws-system', target: 'actor-commander', label: 'Sensor video, weapon status, BIT' },
  { id: 'ctx-e3', type: 'flow-connection', source: 'ext-vehicle', target: 'rws-system', label: '28VDC power, CAN-bus, mounting' },
  { id: 'ctx-e4', type: 'flow-connection', source: 'rws-system', target: 'ext-tdl', label: 'Sensor imagery, engagement data' },
  { id: 'ctx-e5', type: 'flow-connection', source: 'ext-tdl', target: 'rws-system', label: 'Target handoff, BFT, ROE' },
  { id: 'ctx-e6', type: 'flow-connection', source: 'ext-ammo', target: 'rws-system', label: 'Belted ammunition feed' },
  { id: 'ctx-e7', type: 'flow-connection', source: 'ext-gps', target: 'rws-system', label: 'Position, heading' },
  { id: 'ctx-e8', type: 'flow-connection', source: 'actor-maintainer', target: 'rws-system', label: 'Maintenance, diagnostics' },
  { id: 'ctx-e9', type: 'flow-connection', source: 'rws-system', target: 'actor-infantry', label: 'Fire support, hazard zone' }
];

// Custom layout component for Derive diagrams — uses layoutAndRoute directly
// with per-diagram layout tuning instead of the generic AutoLayoutStory.
const DeriveLayoutStory = ({
  specs,
  relationships,
  layoutOptions,
  background = 'light'
}: {
  specs: SysMLNodeSpec[];
  relationships: SysMLRelationshipSpec[];
  layoutOptions: LayoutPipelineOptions;
  background?: 'light' | 'dark';
}) => {
  const [nodes, setNodes] = useState<SysMLReactFlowNode[]>([]);
  const [edges, setEdges] = useState<SysMLReactFlowEdge[]>([]);

  useEffect(() => {
    async function layout() {
      const createdNodes = createNodesFromSpecs(specs);
      const createdEdges = createEdgesFromRelationships(relationships);
      const { nodes: layoutedNodes, edges: layoutedEdges } = await layoutAndRoute(
        createdNodes,
        createdEdges,
        layoutOptions
      );
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
    }
    layout();
  }, [specs, relationships, layoutOptions]);

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

// Context diagram: force-directed keeps the system node central with
// actors and externals orbiting around it.
const contextLayout: LayoutPipelineOptions = {
  measure: true,
  algorithm: 'force',
  nodeSpacing: 120,
  layerSpacing: 120
};

export const Derive_RWS_Context: Story = {
  render: () => <DeriveLayoutStory specs={rwsContextSpecs} relationships={rwsContextRelationships} layoutOptions={contextLayout} />,
  parameters: {
    docs: {
      description: {
        story: 'Remote Weapon Station context diagram sourced from the Derive SE platform (derive.airgen.studio). Shows system boundary with actors (Vehicle Commander, Dismounted Infantry, Weapons Maintainer) and external systems (Host Vehicle, Tactical Data Link, Ammunition Supply, GPS).'
      }
    }
  }
};

// ============================================================================
// Derive — RWS Subsystem Decomposition
// ============================================================================

const rwsDecompositionSpecs: SysMLNodeSpec[] = [
  { kind: 'part-definition', spec: { id: 'rws-top', name: 'Remote Weapon Station (RWS)', stereotype: 'system', description: 'Top-level system comprising eight subsystems.' } },
  { kind: 'part-usage', spec: { id: 'sub-eosa', name: 'Electro-Optical Sensor Assembly (EOSA)', stereotype: 'subsystem', description: 'Sensor video and target tracking.' } },
  { kind: 'part-usage', spec: { id: 'sub-fcs', name: 'Fire Control System (FCS)', stereotype: 'subsystem', description: 'Ballistic computation, tracking, engagement logic.' } },
  { kind: 'part-usage', spec: { id: 'sub-tda', name: 'Turret Drive Assembly (TDA)', stereotype: 'subsystem', description: 'Servo-driven azimuth/elevation positioning.' } },
  { kind: 'part-usage', spec: { id: 'sub-ocu', name: 'Operator Control Unit (OCU)', stereotype: 'subsystem', description: 'Displays, hand grips, control panel.' } },
  { kind: 'part-usage', spec: { id: 'sub-sis', name: 'Safety Interlock System (SIS)', stereotype: 'subsystem', description: 'Hardware/software safety interlocks.' } },
  { kind: 'part-usage', spec: { id: 'sub-wah', name: 'Weapon and Ammo Handling (WAH)', stereotype: 'subsystem', description: 'Weapon mount, feed mechanism, ammo management.' } },
  { kind: 'part-usage', spec: { id: 'sub-pdu', name: 'Power Distribution Unit (PDU)', stereotype: 'subsystem', description: '28V/12V/5V power distribution.' } },
  { kind: 'part-usage', spec: { id: 'sub-ciu', name: 'Communications Interface Unit (CIU)', stereotype: 'subsystem', description: 'GPS, BMS, video export interface.' } }
];

const rwsDecompositionRelationships: SysMLRelationshipSpec[] = [
  { id: 'dec-comp1', type: 'composition', source: 'rws-top', target: 'sub-eosa' },
  { id: 'dec-comp2', type: 'composition', source: 'rws-top', target: 'sub-fcs' },
  { id: 'dec-comp3', type: 'composition', source: 'rws-top', target: 'sub-tda' },
  { id: 'dec-comp4', type: 'composition', source: 'rws-top', target: 'sub-ocu' },
  { id: 'dec-comp5', type: 'composition', source: 'rws-top', target: 'sub-sis' },
  { id: 'dec-comp6', type: 'composition', source: 'rws-top', target: 'sub-wah' },
  { id: 'dec-comp7', type: 'composition', source: 'rws-top', target: 'sub-pdu' },
  { id: 'dec-comp8', type: 'composition', source: 'rws-top', target: 'sub-ciu' },
  { id: 'dec-e1', type: 'flow-connection', source: 'sub-eosa', target: 'sub-fcs', label: 'Sensor video, target data' },
  { id: 'dec-e2', type: 'flow-connection', source: 'sub-fcs', target: 'sub-tda', label: 'Servo commands, pointing' },
  { id: 'dec-e3', type: 'flow-connection', source: 'sub-fcs', target: 'sub-sis', label: 'Fire request, arm status' },
  { id: 'dec-e4', type: 'flow-connection', source: 'sub-sis', target: 'sub-wah', label: 'Fire enable/inhibit' },
  { id: 'dec-e5', type: 'flow-connection', source: 'sub-sis', target: 'sub-tda', label: 'Drive enable, brake cmd' },
  { id: 'dec-e6', type: 'flow-connection', source: 'sub-ocu', target: 'sub-fcs', label: 'Operator commands' },
  { id: 'dec-e7', type: 'flow-connection', source: 'sub-fcs', target: 'sub-ocu', label: 'Display data, video' },
  { id: 'dec-e8', type: 'flow-connection', source: 'sub-ocu', target: 'sub-sis', label: 'E-STOP, arm/safe' },
  { id: 'dec-e9', type: 'flow-connection', source: 'sub-ciu', target: 'sub-fcs', label: 'GPS, BMS target data' },
  { id: 'dec-e10', type: 'flow-connection', source: 'sub-fcs', target: 'sub-ciu', label: 'Video export, status' },
  { id: 'dec-p1', type: 'dependency', source: 'sub-eosa', target: 'sub-pdu', label: '28V/12V/5V power' },
  { id: 'dec-p2', type: 'dependency', source: 'sub-fcs', target: 'sub-pdu', label: '12V/5V power' },
  { id: 'dec-p3', type: 'dependency', source: 'sub-tda', target: 'sub-pdu', label: '28V drive power' }
];

// Decomposition: layered LEFT-to-RIGHT places the top-level system on the
// left with subsystems fanning out to the right.  Wide node/layer spacing
// prevents overlapping edge labels on the 21 relationships.
const decompositionLayout: LayoutPipelineOptions = {
  measure: true,
  algorithm: 'layered',
  direction: 'RIGHT',
  nodeSpacing: 100,
  layerSpacing: 160
};

export const Derive_RWS_Decomposition: Story = {
  render: () => <DeriveLayoutStory specs={rwsDecompositionSpecs} relationships={rwsDecompositionRelationships} layoutOptions={decompositionLayout} />,
  parameters: {
    docs: {
      description: {
        story: 'RWS subsystem decomposition from Derive. Eight subsystems (EOSA, FCS, TDA, OCU, SIS, WAH, PDU, CIU) with composition edges to the top-level system, internal data flows, and power dependencies.'
      }
    }
  }
};

// ============================================================================
// Derive — Safety Interlock System Internal Block Diagram
// ============================================================================

const rwsSafetySpecs: SysMLNodeSpec[] = [
  {
    kind: 'part-usage',
    spec: {
      id: 'comp-safety-ctrl',
      name: 'Dual-Channel Safety Controller',
      stereotype: 'component',
      description: 'Redundant dual-channel processor evaluating all interlock conditions.',
      attributes: [
        { name: 'channelA', type: 'SafetyChannel' },
        { name: 'channelB', type: 'SafetyChannel' },
        { name: 'diagnosticCoverage', type: 'Real', value: '≥ 99%' }
      ],
      ports: [
        { name: 'armKeyIn', type: '28VDC', direction: 'in' },
        { name: 'eStopIn', type: 'DiscreteSignal', direction: 'in' },
        { name: 'fireEnableOut', type: 'DualChannel', direction: 'out' },
        { name: 'brakeInhibitOut', type: 'Command', direction: 'out' }
      ],
    }
  },
  {
    kind: 'part-usage',
    spec: {
      id: 'comp-firing-relay',
      name: 'Hardware Firing Interlock Relay',
      stereotype: 'component',
      description: 'Electromechanical relay requiring dual-channel fire-enable.',
      attributes: [
        { name: 'relayType', type: 'ForcedGuided' },
        { name: 'contactRating', type: 'String', value: '28VDC/10A' }
      ]
    }
  },
  {
    kind: 'part-usage',
    spec: {
      id: 'comp-arming-key',
      name: 'Arming Key Switch Assembly',
      stereotype: 'component',
      description: 'Physical key switch: SAFE / ARM.',
      attributes: [{ name: 'positions', type: 'String', value: 'SAFE / ARM' }]
    }
  },
  {
    kind: 'part-usage',
    spec: {
      id: 'comp-estop-watchdog',
      name: 'E-stop and Link Watchdog Module',
      stereotype: 'component',
      description: 'Monitors E-STOP and communication link watchdog.',
      attributes: [{ name: 'watchdogTimeout', type: 'Duration', value: '500 ms' }]
    }
  },
  {
    kind: 'part-usage',
    spec: {
      id: 'comp-safe-state-driver',
      name: 'Safe State Output Driver',
      stereotype: 'component',
      description: 'Drives brake/inhibit outputs on safety trip.'
    }
  }
];

const rwsSafetyRelationships: SysMLRelationshipSpec[] = [
  { id: 'saf-e1', type: 'flow-connection', source: 'comp-arming-key', target: 'comp-safety-ctrl', label: 'arm-key-status (28VDC)' },
  { id: 'saf-e2', type: 'flow-connection', source: 'comp-estop-watchdog', target: 'comp-safety-ctrl', label: 'E-STOP + watchdog signal' },
  { id: 'saf-e3', type: 'flow-connection', source: 'comp-safety-ctrl', target: 'comp-firing-relay', label: 'fire-enable (dual-channel)' },
  { id: 'saf-e4', type: 'flow-connection', source: 'comp-safety-ctrl', target: 'comp-safe-state-driver', label: 'brake + inhibit command' }
];

// Safety interlock: layered LEFT→RIGHT reflects the signal flow from
// input devices (arming key, E-stop) through the controller to output
// devices (firing relay, safe state driver).
const safetyLayout: LayoutPipelineOptions = {
  measure: true,
  algorithm: 'layered',
  direction: 'RIGHT',
  nodeSpacing: 80,
  layerSpacing: 180
};

export const Derive_RWS_SafetyInterlock: Story = {
  render: () => <DeriveLayoutStory specs={rwsSafetySpecs} relationships={rwsSafetyRelationships} layoutOptions={safetyLayout} />,
  parameters: {
    docs: {
      description: {
        story: 'Safety Interlock System internal block diagram from Derive. Shows Dual-Channel Safety Controller with arming key, E-stop watchdog, hardware firing relay, and safe state output driver.'
      }
    }
  }
};
