import { ReactFlowProvider } from 'reactflow';

import { SysMLDiagram, createEdgesFromRelationships, createNodesFromSpecs } from '../src';

const requirementNodes = createNodesFromSpecs([
  {
    kind: 'requirement-definition',
    spec: {
      id: 'reqdef-mission',
      name: 'MissionRequirement',
      text: 'Top level mission requirement describing overall capability.',
      status: 'approved'
    }
  },
  {
    kind: 'requirement-definition',
    spec: {
      id: 'reqdef-performance',
      name: 'PerformanceRequirement',
      text: 'Defines quantitative performance thresholds the system shall meet.',
      status: 'approved'
    }
  },
  {
    kind: 'requirement-definition',
    spec: {
      id: 'reqdef-thermal',
      name: 'ThermalRequirement',
      text: 'System shall maintain component temperatures within allowable limits.',
      status: 'reviewed'
    }
  },
  {
    kind: 'requirement-usage',
    spec: {
      id: 'requse-thermal-stable',
      name: 'MaintainThermalStability',
      definition: 'reqdef-thermal',
      text: 'Payload electronics shall operate between -10°C and 50°C.',
      status: 'reviewed'
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
]);

const requirementEdges = createEdgesFromRelationships([
  {
    id: 'rel-performance-mission',
    type: 'specialization',
    source: 'reqdef-performance',
    target: 'reqdef-mission',
    label: 'specialises'
  },
  {
    id: 'rel-thermal-mission',
    type: 'specialization',
    source: 'reqdef-thermal',
    target: 'reqdef-mission',
    label: 'specialises'
  },
  {
    id: 'rel-thermal-usage-definition',
    type: 'type-featuring',
    source: 'requse-thermal-stable',
    target: 'reqdef-thermal',
    label: 'usage of'
  },
  {
    id: 'rel-thermal-refine',
    type: 'refine',
    source: 'constraint-thermal',
    target: 'requse-thermal-stable',
    label: 'refines'
  },
  {
    id: 'rel-analysis-refines',
    type: 'refine',
    source: 'analysis-thermal',
    target: 'constraint-thermal',
    label: 'refines'
  },
  {
    id: 'rel-verification-verifies',
    type: 'verify',
    source: 'verification-thermal',
    target: 'requse-thermal-stable',
    label: 'verifies'
  }
]);

export const RequirementsSchemaDiagram = () => (
  <ReactFlowProvider>
    <div style={{ width: '100%', height: 600 }}>
      <SysMLDiagram nodes={requirementNodes} edges={requirementEdges} fitView />
    </div>
  </ReactFlowProvider>
);
