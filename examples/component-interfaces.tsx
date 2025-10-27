import { ReactFlowProvider } from 'reactflow';

import { SysMLDiagram, createEdgesFromRelationships, createNodesFromSpecs } from '../src';

const interfaceNodes = createNodesFromSpecs([
  {
    kind: 'part-definition',
    spec: {
      id: 'part-guidance-computer',
      name: 'GuidanceComputer',
      description: 'Central flight computer providing guidance, navigation and control commands.',
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
      description: 'Logical interface carrying trajectory following commands.',
      ports: [
        { name: 'command', type: 'CommandFrame', direction: 'out' }
      ]
    }
  },
  {
    kind: 'interface-definition',
    spec: {
      id: 'if-status-bus',
      name: 'StatusBus',
      description: 'Publishes health and limit monitoring status across components.',
      ports: [
        { name: 'status', type: 'StatusFrame', direction: 'out' }
      ]
    }
  },
  {
    kind: 'interface-definition',
    spec: {
      id: 'if-state-feedback',
      name: 'StateFeedback',
      description: 'Streaming telemetry interface for attitude and rate estimates.',
      ports: [
        { name: 'stateVector', type: 'StateVector', direction: 'out' }
      ]
    }
  }
]);

const interfaceEdges = createEdgesFromRelationships([
  {
    id: 'rel-guidance-command',
    type: 'flow-connection',
    source: 'part-guidance-computer',
    target: 'part-throttle-ctrl',
    label: 'commandOut → commandIn'
  },
  {
    id: 'rel-guidance-actuators',
    type: 'flow-connection',
    source: 'part-guidance-computer',
    target: 'part-actuator-cluster',
    label: 'commandOut → throttleIn'
  },
  {
    id: 'rel-sensor-guidance',
    type: 'flow-connection',
    source: 'part-nav-sensor',
    target: 'part-guidance-computer',
    label: 'stateOut → telemetryIn'
  },
  {
    id: 'rel-sensor-status',
    type: 'flow-connection',
    source: 'part-nav-sensor',
    target: 'part-throttle-ctrl',
    label: 'healthOut → statusOut'
  },
  {
    id: 'rel-actuator-status',
    type: 'flow-connection',
    source: 'part-actuator-cluster',
    target: 'part-guidance-computer',
    label: 'statusTelemetry → telemetryIn'
  },
  {
    id: 'rel-command-interface',
    type: 'feature-typing',
    source: 'part-guidance-computer',
    target: 'if-command-bus',
    label: 'uses CommandBus'
  },
  {
    id: 'rel-status-interface',
    type: 'feature-typing',
    source: 'part-throttle-ctrl',
    target: 'if-status-bus',
    label: 'publishes StatusBus'
  },
  {
    id: 'rel-state-interface',
    type: 'feature-typing',
    source: 'part-nav-sensor',
    target: 'if-state-feedback',
    label: 'provides StateFeedback'
  }
]);

export const ComponentInterfaceDiagram = () => (
  <ReactFlowProvider>
    <div style={{ width: '100%', height: 600 }}>
      <SysMLDiagram nodes={interfaceNodes} edges={interfaceEdges} fitView />
    </div>
  </ReactFlowProvider>
);
