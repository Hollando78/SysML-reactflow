import { ReactFlowProvider } from 'reactflow';
import {
  SysMLDiagram,
  createSequenceLifelineNode,
  createSequenceMessageEdge,
  createInteractionNode,
  type SysMLReactFlowNode,
  type SysMLReactFlowEdge
} from '../src';

/**
 * Example: Sequence Diagram for Vehicle Power Management
 *
 * This example demonstrates SysML v2 sequence/interaction modeling with:
 * - Lifelines representing participants
 * - Synchronous messages (method calls)
 * - Asynchronous messages (signals/events)
 * - Return messages
 * - Message guards
 */

// Define lifelines (participants in the interaction)
const driver = createSequenceLifelineNode(
  {
    id: 'lifeline-driver',
    name: 'Driver',
    classifier: 'Actor::Driver',
    description: 'Vehicle operator'
  },
  { x: 0, y: 0 }
);

const controller = createSequenceLifelineNode(
  {
    id: 'lifeline-controller',
    name: 'controller: PowerController',
    classifier: 'PartDefinition::PowerController',
    description: 'Main power control unit'
  },
  { x: 280, y: 0 }
);

const battery = createSequenceLifelineNode(
  {
    id: 'lifeline-battery',
    name: 'battery: BatteryManager',
    classifier: 'PartDefinition::BatteryManager',
    description: 'Battery management system'
  },
  { x: 560, y: 0 }
);

const motors = createSequenceLifelineNode(
  {
    id: 'lifeline-motors',
    name: 'motors: MotorController',
    classifier: 'PartDefinition::MotorController',
    description: 'Motor control subsystem'
  },
  { x: 840, y: 0 }
);

// Define interaction messages with different types
const messages: SysMLReactFlowEdge[] = [
  // Synchronous message: Driver to Controller
  createSequenceMessageEdge({
    id: 'msg-1',
    type: 'sync',
    source: 'lifeline-driver',
    target: 'lifeline-controller',
    label: 'pressStartButton()',
    description: 'Driver initiates power-on sequence'
  }),

  // Synchronous message with guard: Controller to Battery
  createSequenceMessageEdge({
    id: 'msg-2',
    type: 'sync',
    source: 'lifeline-controller',
    target: 'lifeline-battery',
    label: 'checkStatus()',
    guard: 'safetyChecksPass',
    description: 'Verify battery is ready'
  }),

  // Return message: Battery to Controller
  createSequenceMessageEdge({
    id: 'msg-3',
    type: 'return',
    source: 'lifeline-battery',
    target: 'lifeline-controller',
    label: 'BatteryStatus(charged, temp: 25C)',
    description: 'Battery status response'
  }),

  // Asynchronous message: Controller to Motors
  createSequenceMessageEdge({
    id: 'msg-4',
    type: 'async',
    source: 'lifeline-controller',
    target: 'lifeline-motors',
    label: 'enablePower(voltage: 400V)',
    description: 'Enable motor power supply'
  }),

  // Asynchronous message: Battery to Motors (parallel)
  createSequenceMessageEdge({
    id: 'msg-5',
    type: 'async',
    source: 'lifeline-battery',
    target: 'lifeline-motors',
    label: 'supplyPower()',
    description: 'Begin power delivery'
  }),

  // Return message: Motors to Controller
  createSequenceMessageEdge({
    id: 'msg-6',
    type: 'return',
    source: 'lifeline-motors',
    target: 'lifeline-controller',
    label: 'PowerEnabled(true)',
    description: 'Confirm motors are powered'
  }),

  // Synchronous message: Controller to Driver
  createSequenceMessageEdge({
    id: 'msg-7',
    type: 'sync',
    source: 'lifeline-controller',
    target: 'lifeline-driver',
    label: 'displayReadyStatus()',
    description: 'Show ready indicator'
  }),

  // Async event from Motors back to Controller
  createSequenceMessageEdge({
    id: 'msg-8',
    type: 'async',
    source: 'lifeline-motors',
    target: 'lifeline-controller',
    label: 'motorSpeedChanged(rpm: 1500)',
    description: 'Telemetry update'
  })
];

const nodes: SysMLReactFlowNode[] = [driver, controller, battery, motors];

export const SequenceDiagramExample = () => (
  <ReactFlowProvider>
    <div style={{ width: '100%', height: 800 }}>
      <SysMLDiagram
        nodes={nodes}
        edges={messages}
        fitView
      />
    </div>
  </ReactFlowProvider>
);

/**
 * Alternative: Interaction with Error Handling
 *
 * Shows conditional flows and error scenarios
 */

const supervisorLifeline = createSequenceLifelineNode(
  {
    id: 'supervisor',
    name: 'supervisor: SafetySupervisor',
    classifier: 'PartDefinition::SafetySupervisor'
  },
  { x: 1120, y: 0 }
);

const errorMessages: SysMLReactFlowEdge[] = [
  // Normal flow
  createSequenceMessageEdge({
    id: 'err-msg-1',
    type: 'sync',
    source: 'lifeline-controller',
    target: 'lifeline-battery',
    label: 'requestPower(watts: 50000)'
  }),

  // Conditional return (success case)
  createSequenceMessageEdge({
    id: 'err-msg-2',
    type: 'return',
    source: 'lifeline-battery',
    target: 'lifeline-controller',
    label: 'PowerGranted(50kW)',
    guard: 'availablePower >= requestedPower'
  }),

  // Error notification (failure case)
  createSequenceMessageEdge({
    id: 'err-msg-3',
    type: 'async',
    source: 'lifeline-battery',
    target: 'supervisor',
    label: 'powerLimitExceeded()',
    guard: 'availablePower < requestedPower',
    description: 'Notify supervisor of limit violation'
  }),

  // Supervisor intervention
  createSequenceMessageEdge({
    id: 'err-msg-4',
    type: 'sync',
    source: 'supervisor',
    target: 'lifeline-controller',
    label: 'reducePowerDemand(watts: 30000)',
    description: 'Override with safe limit'
  })
];

export const SequenceDiagramWithErrorHandling = () => {
  const allNodes = [...nodes, supervisorLifeline];
  const allMessages = [...messages, ...errorMessages];

  return (
    <ReactFlowProvider>
      <div style={{ width: '100%', height: 900 }}>
        <SysMLDiagram nodes={allNodes} edges={allMessages} fitView />
      </div>
    </ReactFlowProvider>
  );
};

/**
 * Using Interaction Container (SysML v2 approach)
 */

const powerSequenceInteraction = createInteractionNode(
  {
    id: 'interaction-1',
    name: 'Power-On Sequence',
    description: 'Describes the interaction sequence for powering on the vehicle',
    participants: ['Driver', 'PowerController', 'BatteryManager', 'MotorController']
  },
  { x: 420, y: -150 }
);

export const SequenceDiagramWithInteraction = () => {
  const nodesWithInteraction = [powerSequenceInteraction, ...nodes];

  return (
    <ReactFlowProvider>
      <div style={{ width: '100%', height: 800 }}>
        <SysMLDiagram nodes={nodesWithInteraction} edges={messages} fitView />
      </div>
    </ReactFlowProvider>
  );
};

/**
 * Message Types Reference:
 *
 * 1. Synchronous (sync): Blocking call, sender waits for response
 *    - Rendered with filled arrow
 *    - Typical use: Method calls, RPCs
 *
 * 2. Asynchronous (async): Non-blocking signal or event
 *    - Rendered with open arrow
 *    - Typical use: Events, signals, fire-and-forget messages
 *
 * 3. Return (return): Response to a previous message
 *    - Rendered with dashed line
 *    - Typical use: Return values, acknowledgments
 *
 * Additional features:
 * - guard: Condition that must be true for message to be sent
 *   Example: [batteryCharged && systemsReady]
 *
 * - label: The message name/signature
 *   Example: "calculateLoad(voltage, current)"
 */
