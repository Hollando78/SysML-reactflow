import { describe, it, expect } from 'vitest';
import {
  createPartDefinitionNode,
  createPartUsageNode,
  createActionDefinitionNode,
  createActionUsageNode,
  createRequirementDefinitionNode,
  createRequirementUsageNode,
  createAttributeDefinitionNode,
  createAttributeUsageNode,
  createConstraintDefinitionNode,
  createConstraintUsageNode,
  createStateNode,
  createStateMachineNode,
  createActivityControlNode,
  createSequenceLifelineNode,
  createNodesFromSpecs,
  createEdgesFromRelationships
} from './factories';

describe('Factory Functions', () => {
  describe('Part Definition/Usage', () => {
    it('should create a part definition node', () => {
      const node = createPartDefinitionNode({
        id: 'part-1',
        name: 'Vehicle',
        description: 'A vehicle part',
        attributes: [{ name: 'mass', type: 'Real' }],
        ports: [{ name: 'powerPort', direction: 'in', type: 'Power' }]
      });

      expect(node.id).toBe('part-1');
      expect(node.type).toBe('sysml.part-definition');
      expect(node.data.name).toBe('Vehicle');
      expect(node.data.documentation).toBe('A vehicle part');
      expect(node.data.elementKind).toBe('definition');
      expect(node.data.kind).toBe('part-definition');
      expect(node.data.compartments).toBeDefined();
      expect(node.data.compartments?.length).toBeGreaterThan(0);
    });

    it('should create a part usage node', () => {
      const node = createPartUsageNode({
        id: 'usage-1',
        name: 'myCar',
        definition: 'Vehicle',
        redefines: ['oldCar']
      });

      expect(node.id).toBe('usage-1');
      expect(node.type).toBe('sysml.part-usage');
      expect(node.data.elementKind).toBe('usage');
      expect(node.data.baseDefinition).toBe('Vehicle');
      expect(node.data.redefines).toEqual(['oldCar']);
    });

    it('should handle custom position', () => {
      const node = createPartDefinitionNode(
        { id: 'part-1', name: 'Test' },
        { x: 100, y: 200 }
      );

      expect(node.position.x).toBe(100);
      expect(node.position.y).toBe(200);
    });

    it('should default position to (0, 0)', () => {
      const node = createPartDefinitionNode({ id: 'part-1', name: 'Test' });

      expect(node.position.x).toBe(0);
      expect(node.position.y).toBe(0);
    });
  });

  describe('Action Definition/Usage', () => {
    it('should create an action definition node', () => {
      const node = createActionDefinitionNode({
        id: 'action-1',
        name: 'ProvidePower',
        inputs: [{ name: 'voltage', type: 'Real' }],
        outputs: [{ name: 'current', type: 'Real' }]
      });

      expect(node.id).toBe('action-1');
      expect(node.type).toBe('sysml.action-definition');
      expect(node.data.elementKind).toBe('definition');
      expect(node.data.compartments).toBeDefined();
    });

    it('should create an action usage node', () => {
      const node = createActionUsageNode({
        id: 'usage-1',
        name: 'providePower()',
        definition: 'ProvidePower'
      });

      expect(node.id).toBe('usage-1');
      expect(node.type).toBe('sysml.action-usage');
      expect(node.data.elementKind).toBe('usage');
      expect(node.data.baseDefinition).toBe('ProvidePower');
    });
  });

  describe('Requirement Definition/Usage', () => {
    it('should create a requirement definition node', () => {
      const node = createRequirementDefinitionNode({
        id: 'req-1',
        name: 'ThermalRequirement',
        text: 'The system shall maintain temperature within range',
        reqId: 'REQ-001'
      });

      expect(node.id).toBe('req-1');
      expect(node.type).toBe('sysml.requirement-definition');
      expect(node.data.elementKind).toBe('definition');
    });

    it('should create a requirement usage node', () => {
      const node = createRequirementUsageNode({
        id: 'req-usage-1',
        name: 'thermalReq',
        text: 'Temperature requirement instance',
        status: 'reviewed'
      });

      expect(node.id).toBe('req-usage-1');
      expect(node.type).toBe('sysml.requirement-usage');
      expect(node.data.elementKind).toBe('usage');
      expect(node.data.status).toBe('reviewed');
    });
  });

  describe('Attribute Definition/Usage', () => {
    it('should create an attribute definition node', () => {
      const node = createAttributeDefinitionNode({
        id: 'attr-1',
        name: 'Mass',
        type: 'ISQ::Mass',
        defaultValue: '1200.0'
      });

      expect(node.id).toBe('attr-1');
      expect(node.type).toBe('sysml.attribute-definition');
      expect(node.data.elementKind).toBe('definition');
    });

    it('should create an attribute usage node', () => {
      const node = createAttributeUsageNode({
        id: 'attr-usage-1',
        name: 'vehicleMass',
        definition: 'Mass',
        value: '1500.0'
      });

      expect(node.id).toBe('attr-usage-1');
      expect(node.type).toBe('sysml.attribute-usage');
      expect(node.data.elementKind).toBe('usage');
    });
  });

  describe('Constraint Definition/Usage', () => {
    it('should create a constraint definition node', () => {
      const node = createConstraintDefinitionNode({
        id: 'const-1',
        name: 'LoadConstraint',
        description: 'Load must not exceed capacity'
      });

      expect(node.id).toBe('const-1');
      expect(node.type).toBe('sysml.constraint-definition');
      expect(node.data.elementKind).toBe('definition');
    });

    it('should create a constraint usage node', () => {
      const node = createConstraintUsageNode({
        id: 'const-usage-1',
        name: 'loadCheck',
        definition: 'LoadConstraint'
      });

      expect(node.id).toBe('const-usage-1');
      expect(node.type).toBe('sysml.constraint-usage');
      expect(node.data.elementKind).toBe('usage');
    });
  });

  describe('State Machines', () => {
    it('should create a state node', () => {
      const node = createStateNode({
        id: 'state-1',
        name: 'Idle',
        entryAction: 'reset()',
        doActivity: 'monitor()',
        exitAction: 'cleanup()'
      });

      expect(node.id).toBe('state-1');
      expect(node.type).toBe('sysml.state');
    });

    it('should create a state machine node', () => {
      const node = createStateMachineNode({
        id: 'sm-1',
        name: 'PowerStateMachine',
        states: [
          { id: 'idle', name: 'Idle' },
          { id: 'active', name: 'Active' }
        ]
      });

      expect(node.id).toBe('sm-1');
      expect(node.type).toBe('sysml.state-machine');
    });
  });

  describe('Activity Control', () => {
    it('should create activity control nodes', () => {
      const fork = createActivityControlNode({
        id: 'fork-1',
        name: 'Fork',
        controlType: 'fork'
      });

      expect(fork.id).toBe('fork-1');
      expect(fork.type).toBe('sysml.activity-control');

      const decision = createActivityControlNode({
        id: 'decision-1',
        name: 'Decision',
        controlType: 'decision'
      });

      expect(decision.id).toBe('decision-1');
      expect(decision.type).toBe('sysml.activity-control');
    });
  });

  describe('Sequence Diagrams', () => {
    it('should create a sequence lifeline node', () => {
      const node = createSequenceLifelineNode({
        id: 'lifeline-1',
        name: 'Controller',
        classifier: 'PartDefinition::Controller'
      });

      expect(node.id).toBe('lifeline-1');
      expect(node.type).toBe('sysml.sequence-lifeline');
    });
  });

  describe('Batch Creation', () => {
    it('should create multiple nodes from specs', () => {
      const specs = [
        {
          kind: 'part-definition' as const,
          spec: { id: 'part-1', name: 'Part1' }
        },
        {
          kind: 'action-definition' as const,
          spec: { id: 'action-1', name: 'Action1' }
        },
        {
          kind: 'requirement-definition' as const,
          spec: { id: 'req-1', name: 'Req1', text: 'Requirement text' }
        }
      ];

      const nodes = createNodesFromSpecs(specs);

      expect(nodes).toHaveLength(3);
      expect(nodes[0].id).toBe('part-1');
      expect(nodes[1].id).toBe('action-1');
      expect(nodes[2].id).toBe('req-1');
    });

    it('should apply custom positions to nodes', () => {
      const specs = [
        {
          kind: 'part-definition' as const,
          spec: { id: 'part-1', name: 'Part1' }
        }
      ];

      const positions = {
        'part-1': { x: 100, y: 200 }
      };

      const nodes = createNodesFromSpecs(specs, positions);

      expect(nodes[0].position.x).toBe(100);
      expect(nodes[0].position.y).toBe(200);
    });

    it('should create edges from relationships', () => {
      const relationships = [
        {
          id: 'edge-1',
          type: 'satisfy' as const,
          source: 'part-1',
          target: 'req-1',
          label: 'satisfies'
        },
        {
          id: 'edge-2',
          type: 'allocate' as const,
          source: 'part-1',
          target: 'action-1'
        }
      ];

      const edges = createEdgesFromRelationships(relationships);

      expect(edges).toHaveLength(2);
      expect(edges[0].id).toBe('edge-1');
      expect(edges[0].source).toBe('part-1');
      expect(edges[0].target).toBe('req-1');
      expect(edges[0].type).toBe('sysml.relationship');
      expect(edges[0].data?.label).toBe('satisfies');
    });
  });

  describe('Compartments', () => {
    it('should filter out undefined compartments', () => {
      const node = createPartDefinitionNode({
        id: 'part-1',
        name: 'EmptyPart'
        // No attributes, ports, actions, or states
      });

      // Should have no compartments or only defined ones
      expect(node.data.compartments).toBeDefined();
      if (node.data.compartments) {
        expect(node.data.compartments.every(c => c !== undefined)).toBe(true);
      }
    });

    it('should include compartments when data is provided', () => {
      const node = createPartDefinitionNode({
        id: 'part-1',
        name: 'FullPart',
        attributes: [{ name: 'mass', type: 'Real' }],
        ports: [{ name: 'port1', direction: 'in', type: 'Signal' }],
        actions: ['action1', 'action2'],
        states: ['state1']
      });

      expect(node.data.compartments).toBeDefined();
      expect(node.data.compartments!.length).toBeGreaterThan(0);
    });
  });
});
