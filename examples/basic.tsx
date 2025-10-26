import { ReactFlowProvider } from 'reactflow';

import { SysMLDiagram, createEdgesFromRelationships, createNodesFromSpecs } from '../src';

const nodes = createNodesFromSpecs([
  {
    kind: 'requirement',
    spec: {
      id: 'REQ-1',
      name: 'Mission Reliability',
      text: 'The system shall maintain 99.95% availability.',
      risk: 'high',
      verification: 'analysis',
      status: 'reviewed',
      derivedFrom: ['CONOPS-1']
    }
  },
  {
    kind: 'block-definition',
    spec: {
      id: 'BLK-1',
      name: 'PowerController',
      stereotype: 'block',
      description: 'Supervises power switching fabrics.',
      parts: [
        { name: 'batteryMgr', type: 'BatteryManager' },
        { name: 'psu', type: 'PowerSupply', multiplicity: '2..3' }
      ],
      ports: [
        { name: 'powerIn', type: '28V', direction: 'in' },
        { name: 'powerOut', type: '28V', direction: 'out' }
      ]
    }
  },
  {
    kind: 'activity',
    spec: {
      id: 'ACT-1',
      name: 'DistributePower',
      actions: ['Check loads', 'Balance feeders', 'Report status'],
      inputs: [{ name: 'powerIn', type: 'PowerFlow' }],
      outputs: [{ name: 'powerOut', type: 'PowerFlow' }]
    }
  },
  {
    kind: 'parametric',
    spec: {
      id: 'PAR-1',
      name: 'LoadBalanceConstraint',
      equation: 'totalLoad <= supplyCapacity',
      parameters: [
        { name: 'totalLoad', type: 'kW' },
        { name: 'supplyCapacity', type: 'kW' }
      ]
    }
  }
]);

const edges = createEdgesFromRelationships([
  { id: 'rel-1', type: 'satisfy', source: 'BLK-1', target: 'REQ-1', label: 'satisfy' },
  { id: 'rel-2', type: 'allocate', source: 'BLK-1', target: 'ACT-1', label: 'allocate' },
  { id: 'rel-3', type: 'refine', source: 'ACT-1', target: 'PAR-1', label: 'refine' }
]);

export const BasicSysMLDiagram = () => (
  <ReactFlowProvider>
    <div style={{ width: '100%', height: 600 }}>
      <SysMLDiagram nodes={nodes} edges={edges} />
    </div>
  </ReactFlowProvider>
);
