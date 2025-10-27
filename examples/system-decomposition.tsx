import { ReactFlowProvider } from 'reactflow';

import { SysMLDiagram, createEdgesFromRelationships, createNodesFromSpecs } from '../src';

const decompositionNodes = createNodesFromSpecs([
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
]);

const decompositionEdges = createEdgesFromRelationships([
  {
    id: 'rel-system-comm',
    type: 'composition',
    source: 'sys-orbital-comm',
    target: 'sub-communications',
    label: 'composes'
  },
  {
    id: 'rel-system-platform',
    type: 'composition',
    source: 'sys-orbital-comm',
    target: 'sub-platform',
    label: 'composes'
  },
  {
    id: 'rel-comm-rf',
    type: 'composition',
    source: 'sub-communications',
    target: 'comp-rf-front-end',
    label: 'contains'
  },
  {
    id: 'rel-comm-processor',
    type: 'composition',
    source: 'sub-communications',
    target: 'comp-signal-processor',
    label: 'contains'
  },
  {
    id: 'rel-platform-thermal',
    type: 'composition',
    source: 'sub-platform',
    target: 'comp-thermal-control',
    label: 'contains'
  },
  {
    id: 'rel-platform-power',
    type: 'composition',
    source: 'sub-platform',
    target: 'comp-power-regulator',
    label: 'contains'
  }
]);

export const ThreeLevelSystemDecomposition = () => (
  <ReactFlowProvider>
    <div style={{ width: '100%', height: 600 }}>
      <SysMLDiagram nodes={decompositionNodes} edges={decompositionEdges} fitView />
    </div>
  </ReactFlowProvider>
);
