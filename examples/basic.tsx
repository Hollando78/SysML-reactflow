import { ReactFlowProvider } from 'reactflow';

import { SysMLDiagram, createEdgesFromRelationships, createNodesFromSpecs } from '../src';

const nodes = createNodesFromSpecs([
  {
    kind: 'requirement-usage',
    spec: {
      id: 'REQ-1',
      name: 'Mission Reliability',
      text: 'The system shall maintain 99.95% availability.',
      status: 'reviewed' as const
    }
  },
  {
    kind: 'part-definition',
    spec: {
      id: 'PART-1',
      name: 'PowerController',
      description: 'Supervises power switching fabrics.',
      attributes: [
        { name: 'batteryMgr', type: 'BatteryManager' },
        { name: 'psu', type: 'PowerSupply', multiplicity: '[2..3]' }
      ],
      ports: [
        { name: 'powerIn', type: '28V', direction: 'in' },
        { name: 'powerOut', type: '28V', direction: 'out' }
      ]
    }
  },
  {
    kind: 'action-definition',
    spec: {
      id: 'ACT-1',
      name: 'DistributePower',
      description: 'Distributes power across system loads'
    }
  },
  {
    kind: 'constraint-definition',
    spec: {
      id: 'CONST-1',
      name: 'LoadBalanceConstraint',
      description: 'Ensures total load does not exceed supply capacity'
    }
  }
]);

const edges = createEdgesFromRelationships([
  { id: 'rel-1', type: 'satisfy', source: 'PART-1', target: 'REQ-1', label: 'satisfy' },
  { id: 'rel-2', type: 'allocate', source: 'PART-1', target: 'ACT-1', label: 'allocate' },
  { id: 'rel-3', type: 'refine', source: 'ACT-1', target: 'CONST-1', label: 'refine' }
]);

export const BasicSysMLDiagram = () => (
  <ReactFlowProvider>
    <div style={{ width: '100%', height: 600 }}>
      <SysMLDiagram nodes={nodes} edges={edges} />
    </div>
  </ReactFlowProvider>
);
