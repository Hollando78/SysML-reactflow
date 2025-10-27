import { ReactFlowProvider } from 'reactflow';

import { SysMLDiagram, createEdgesFromRelationships, createNodesFromSpecs } from '../src';

const functionalNodes = createNodesFromSpecs([
  {
    kind: 'action-definition',
    spec: {
      id: 'actdef-guidance-loop',
      name: 'ExecuteGuidanceLoop',
      description: 'Core closed-loop guidance, navigation and control behaviour.'
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
      performer: 'ActuatorCluster',
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
]);

const functionalEdges = createEdgesFromRelationships([
  {
    id: 'rel-sense-estimate',
    type: 'succession',
    source: 'act-sense-state',
    target: 'act-estimate-trajectory',
    label: 'then'
  },
  {
    id: 'rel-estimate-control',
    type: 'succession',
    source: 'act-estimate-trajectory',
    target: 'act-compute-control',
    label: 'then'
  },
  {
    id: 'rel-control-command',
    type: 'succession',
    source: 'act-compute-control',
    target: 'act-command-actuators',
    label: 'then'
  },
  {
    id: 'rel-command-telemetry',
    type: 'succession',
    source: 'act-command-actuators',
    target: 'act-publish-telemetry',
    label: 'feeds'
  },
  {
    id: 'rel-sense-decision',
    type: 'control-flow',
    source: 'act-sense-state',
    target: 'ctrl-decision',
    label: 'monitor limits'
  },
  {
    id: 'rel-decision-telemetry',
    type: 'control-flow',
    source: 'ctrl-decision',
    target: 'act-publish-telemetry',
    label: 'route mode'
  }
]);

export const FunctionalFlowDiagram = () => (
  <ReactFlowProvider>
    <div style={{ width: '100%', height: 600 }}>
      <SysMLDiagram nodes={functionalNodes} edges={functionalEdges} fitView />
    </div>
  </ReactFlowProvider>
);
