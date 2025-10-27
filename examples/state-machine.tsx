import { ReactFlowProvider } from 'reactflow';
import {
  SysMLDiagram,
  createStateNode,
  createStateMachineNode,
  createStateTransitionEdge,
  createStateDefinitionNode,
  createStateUsageNode,
  createTransitionUsageNode,
  type SysMLReactFlowNode,
  type SysMLReactFlowEdge
} from '../src';

/**
 * Example: State Machine Diagram for a Vehicle Power System
 *
 * This example demonstrates SysML v2 state machine modeling with:
 * - State definitions and usages
 * - Transition usages with triggers, guards, and effects
 * - State machine container
 * - Entry/do/exit actions
 */

// State Machine Container
const stateMachine = createStateMachineNode(
  {
    id: 'sm-power',
    name: 'Vehicle Power State Machine',
    description: 'Controls the power state transitions of the vehicle',
    states: [
      { id: 'off', name: 'Off' },
      { id: 'standby', name: 'Standby' },
      { id: 'ready', name: 'Ready' },
      { id: 'active', name: 'Active' },
      { id: 'fault', name: 'Fault' }
    ]
  },
  { x: -100, y: 20 }
);

// State Definitions
const offState = createStateDefinitionNode(
  {
    id: 'state-def-off',
    name: 'Off',
    description: 'Vehicle is completely powered down'
  },
  { x: 200, y: -100 }
);

const standbyState = createStateUsageNode(
  {
    id: 'state-standby',
    name: 'Standby',
    definition: 'StandbyState',
    entryAction: 'enableWatchdog()',
    doAction: 'monitorBattery()',
    exitAction: 'disableWatchdog()'
  },
  { x: 500, y: -100 }
);

const readyState = createStateUsageNode(
  {
    id: 'state-ready',
    name: 'Ready',
    definition: 'ReadyState',
    entryAction: 'initializeSystems()',
    doAction: 'waitForCommand()',
    exitAction: 'prepareActivation()'
  },
  { x: 800, y: 20 }
);

const activeState = createStateUsageNode(
  {
    id: 'state-active',
    name: 'Active',
    definition: 'ActiveState',
    entryAction: 'powerUpSubsystems()',
    doAction: 'executeCommands()',
    exitAction: 'shutdownSubsystems()'
  },
  { x: 800, y: 280 }
);

const faultState = createStateUsageNode(
  {
    id: 'state-fault',
    name: 'Fault',
    definition: 'FaultState',
    entryAction: 'isolateFault()',
    doAction: 'diagnose()',
    exitAction: 'clearFault()'
  },
  { x: 500, y: 400 }
);

// Transitions with Triggers, Guards, and Effects
const transitions: SysMLReactFlowEdge[] = [
  createStateTransitionEdge({
    id: 'trans-1',
    source: 'state-def-off',
    target: 'state-standby',
    trigger: 'powerOn',
    guard: 'batteryCharged'
  }),
  createStateTransitionEdge({
    id: 'trans-2',
    source: 'state-standby',
    target: 'state-ready',
    trigger: 'initComplete',
    effect: 'notifyReady()'
  }),
  createStateTransitionEdge({
    id: 'trans-3',
    source: 'state-ready',
    target: 'state-active',
    trigger: 'startCommand',
    guard: 'systemsHealthy',
    effect: 'logActivation()'
  }),
  createStateTransitionEdge({
    id: 'trans-4',
    source: 'state-active',
    target: 'state-ready',
    trigger: 'stopCommand',
    effect: 'logDeactivation()'
  }),
  createStateTransitionEdge({
    id: 'trans-5',
    source: 'state-active',
    target: 'state-fault',
    trigger: 'faultDetected',
    effect: 'notifyOperator()'
  }),
  createStateTransitionEdge({
    id: 'trans-6',
    source: 'state-ready',
    target: 'state-fault',
    trigger: 'criticalError',
    effect: 'emergencyShutdown()'
  }),
  createStateTransitionEdge({
    id: 'trans-7',
    source: 'state-fault',
    target: 'state-standby',
    trigger: 'resetCommand',
    guard: 'faultCleared',
    effect: 'restartWatchdog()'
  }),
  createStateTransitionEdge({
    id: 'trans-8',
    source: 'state-standby',
    target: 'state-def-off',
    trigger: 'powerOff',
    effect: 'logShutdown()'
  })
];

const nodes: SysMLReactFlowNode[] = [
  stateMachine,
  offState,
  standbyState,
  readyState,
  activeState,
  faultState
];

export const StateMachineExample = () => (
  <ReactFlowProvider>
    <div style={{ width: '100%', height: 800 }}>
      <SysMLDiagram
        nodes={nodes}
        edges={transitions}
        fitView
      />
    </div>
  </ReactFlowProvider>
);

/**
 * Alternative: Using SysML v2 State Definition/Usage Pattern
 *
 * This shows the proper SysML v2 separation of definition vs usage
 */

// Using proper Definition/Usage separation
const powerStateDefinition = createStateDefinitionNode(
  {
    id: 'power-state-def',
    name: 'PowerState',
    description: 'Abstract power state definition',
    substates: ['Off', 'Standby', 'Ready', 'Active', 'Fault']
  },
  { x: 100, y: 100 }
);

const vehiclePowerStateUsage = createStateUsageNode(
  {
    id: 'vehicle-power-state',
    name: 'vehiclePowerState',
    definition: 'PowerState',
    entryAction: 'logStateEntry()',
    doAction: 'maintainState()',
    exitAction: 'logStateExit()'
  },
  { x: 100, y: 300 }
);

export const StateMachineDefinitionUsageExample = () => {
  const nodes = [powerStateDefinition, vehiclePowerStateUsage];
  const edges = [
    {
      id: 'def-edge',
      type: 'sysml.relationship',
      source: 'vehicle-power-state',
      target: 'power-state-def',
      data: { kind: 'definition' as const, label: 'defined by' }
    }
  ];

  return (
    <ReactFlowProvider>
      <div style={{ width: '100%', height: 600 }}>
        <SysMLDiagram nodes={nodes} edges={edges} fitView />
      </div>
    </ReactFlowProvider>
  );
};
