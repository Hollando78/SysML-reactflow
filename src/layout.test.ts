import { describe, it, expect } from 'vitest';
import { applyLayout, applyRecommendedLayout, recommendedLayouts } from './layout';
import { createNodesFromSpecs } from './factories';
import { createEdgesFromRelationships } from './factories';
import type { SysMLReactFlowNode, SysMLReactFlowEdge } from './types';

describe('Layout Module', () => {
  // Sample test data
  const sampleSpecs = [
    {
      kind: 'requirement-usage' as const,
      spec: { id: 'REQ-1', name: 'Requirement 1', text: 'Test requirement' }
    },
    {
      kind: 'requirement-usage' as const,
      spec: { id: 'REQ-2', name: 'Requirement 2', text: 'Test requirement' }
    },
    {
      kind: 'requirement-usage' as const,
      spec: { id: 'REQ-3', name: 'Requirement 3', text: 'Test requirement' }
    }
  ];

  const sampleRelationships = [
    { id: 'e1', type: 'specialize' as const, source: 'REQ-2', target: 'REQ-1' },
    { id: 'e2', type: 'specialize' as const, source: 'REQ-3', target: 'REQ-1' }
  ];

  describe('applyLayout', () => {
    it('should apply layered layout by default', async () => {
      const nodes = createNodesFromSpecs(sampleSpecs);
      const edges = createEdgesFromRelationships(sampleRelationships);

      const layoutedNodes = await applyLayout(nodes, edges);

      expect(layoutedNodes).toHaveLength(3);
      expect(layoutedNodes[0].position).toBeDefined();
      expect(layoutedNodes[0].position.x).toBeGreaterThanOrEqual(0);
      expect(layoutedNodes[0].position.y).toBeGreaterThanOrEqual(0);
    });

    it('should apply layered layout with custom options', async () => {
      const nodes = createNodesFromSpecs(sampleSpecs);
      const edges = createEdgesFromRelationships(sampleRelationships);

      const layoutedNodes = await applyLayout(nodes, edges, {
        algorithm: 'layered',
        direction: 'RIGHT',
        nodeSpacing: 150,
        layerSpacing: 200
      });

      expect(layoutedNodes).toHaveLength(3);
      // All nodes should have valid positions
      layoutedNodes.forEach(node => {
        expect(node.position.x).toBeDefined();
        expect(node.position.y).toBeDefined();
        expect(typeof node.position.x).toBe('number');
        expect(typeof node.position.y).toBe('number');
      });
    });

    it('should apply force layout', async () => {
      const nodes = createNodesFromSpecs(sampleSpecs);
      const edges = createEdgesFromRelationships(sampleRelationships);

      const layoutedNodes = await applyLayout(nodes, edges, {
        algorithm: 'force'
      });

      expect(layoutedNodes).toHaveLength(3);
      expect(layoutedNodes[0].position).toBeDefined();
    });

    it('should apply mrtree layout', async () => {
      const nodes = createNodesFromSpecs(sampleSpecs);
      const edges = createEdgesFromRelationships(sampleRelationships);

      const layoutedNodes = await applyLayout(nodes, edges, {
        algorithm: 'mrtree',
        direction: 'DOWN'
      });

      expect(layoutedNodes).toHaveLength(3);
      expect(layoutedNodes[0].position).toBeDefined();
    });

    it('should apply box layout', async () => {
      const nodes = createNodesFromSpecs(sampleSpecs);
      const edges = createEdgesFromRelationships(sampleRelationships);

      const layoutedNodes = await applyLayout(nodes, edges, {
        algorithm: 'box'
      });

      expect(layoutedNodes).toHaveLength(3);
      expect(layoutedNodes[0].position).toBeDefined();
    });

    it('should preserve node IDs and data', async () => {
      const nodes = createNodesFromSpecs(sampleSpecs);
      const edges = createEdgesFromRelationships(sampleRelationships);

      const layoutedNodes = await applyLayout(nodes, edges);

      expect(layoutedNodes[0].id).toBe('REQ-1');
      expect(layoutedNodes[0].data.name).toBe('Requirement 1');
      expect(layoutedNodes[1].id).toBe('REQ-2');
      expect(layoutedNodes[2].id).toBe('REQ-3');
    });

    it('should handle empty node array', async () => {
      const nodes: SysMLReactFlowNode[] = [];
      const edges: SysMLReactFlowEdge[] = [];

      const layoutedNodes = await applyLayout(nodes, edges);

      expect(layoutedNodes).toHaveLength(0);
    });

    it('should handle nodes with no edges', async () => {
      const nodes = createNodesFromSpecs(sampleSpecs);
      const edges: SysMLReactFlowEdge[] = [];

      const layoutedNodes = await applyLayout(nodes, edges);

      expect(layoutedNodes).toHaveLength(3);
      layoutedNodes.forEach(node => {
        expect(node.position).toBeDefined();
      });
    });
  });

  describe('applySequenceLayout', () => {
    it('should apply sequence layout to lifelines', async () => {
      const lifelineSpecs = [
        { kind: 'sequence-lifeline' as const, spec: { id: 'L1', name: 'User', classifier: 'Actor::User' } },
        { kind: 'sequence-lifeline' as const, spec: { id: 'L2', name: 'System', classifier: 'Part::System' } },
        { kind: 'sequence-lifeline' as const, spec: { id: 'L3', name: 'Database', classifier: 'Part::DB' } }
      ];

      const nodes = createNodesFromSpecs(lifelineSpecs);
      const edges: SysMLReactFlowEdge[] = [];

      const layoutedNodes = await applyLayout(nodes, edges, {
        algorithm: 'sequence',
        nodeSpacing: 280,
        nodeWidth: 200
      });

      expect(layoutedNodes).toHaveLength(3);

      // All lifelines should be at y=0
      layoutedNodes.forEach(node => {
        expect(node.position.y).toBe(0);
      });

      // Lifelines should be spaced horizontally
      expect(layoutedNodes[0].position.x).toBe(0);
      expect(layoutedNodes[1].position.x).toBe(480); // 280 spacing + 200 width
      expect(layoutedNodes[2].position.x).toBe(960);
    });

    it('should place interaction nodes above lifelines', async () => {
      const specs = [
        { kind: 'interaction' as const, spec: { id: 'INT', name: 'Interaction', participants: ['L1', 'L2'] } },
        { kind: 'sequence-lifeline' as const, spec: { id: 'L1', name: 'User', classifier: 'Actor::User' } },
        { kind: 'sequence-lifeline' as const, spec: { id: 'L2', name: 'System', classifier: 'Part::System' } }
      ];

      const nodes = createNodesFromSpecs(specs);
      const edges: SysMLReactFlowEdge[] = [];

      const layoutedNodes = await applyLayout(nodes, edges, {
        algorithm: 'sequence',
        nodeSpacing: 280,
        nodeWidth: 200,
        nodeHeight: 100,
        layerSpacing: 80
      });

      expect(layoutedNodes).toHaveLength(3);

      const interactionNode = layoutedNodes.find(n => n.id === 'INT');
      const lifelineNodes = layoutedNodes.filter(n => n.id.startsWith('L'));

      // Interaction should be above lifelines
      expect(interactionNode?.position.y).toBe(-180); // -(nodeHeight + layerSpacing)

      // Lifelines should be at y=0
      lifelineNodes.forEach(node => {
        expect(node.position.y).toBe(0);
      });
    });
  });

  describe('applyRecommendedLayout', () => {
    it('should apply recommended layout for requirements', async () => {
      const nodes = createNodesFromSpecs(sampleSpecs);
      const edges = createEdgesFromRelationships(sampleRelationships);

      const layoutedNodes = await applyRecommendedLayout(nodes, edges, 'requirements');

      expect(layoutedNodes).toHaveLength(3);
      expect(layoutedNodes[0].position).toBeDefined();
    });

    it('should apply recommended layout for bdd', async () => {
      const specs = [
        { kind: 'part-definition' as const, spec: { id: 'P1', name: 'Part 1' } },
        { kind: 'part-usage' as const, spec: { id: 'P2', name: 'Part 2', definition: 'P1' } }
      ];

      const nodes = createNodesFromSpecs(specs);
      const edges: SysMLReactFlowEdge[] = [];

      const layoutedNodes = await applyRecommendedLayout(nodes, edges, 'bdd');

      expect(layoutedNodes).toHaveLength(2);
      expect(layoutedNodes[0].position).toBeDefined();
    });

    it('should apply recommended layout for state machines', async () => {
      const specs = [
        { kind: 'state-usage' as const, spec: { id: 'S1', name: 'State 1' } },
        { kind: 'state-usage' as const, spec: { id: 'S2', name: 'State 2' } }
      ];

      const nodes = createNodesFromSpecs(specs);
      const edges: SysMLReactFlowEdge[] = [];

      const layoutedNodes = await applyRecommendedLayout(nodes, edges, 'stateMachine');

      expect(layoutedNodes).toHaveLength(2);
      expect(layoutedNodes[0].position).toBeDefined();
    });

    it('should allow overriding recommended settings', async () => {
      const nodes = createNodesFromSpecs(sampleSpecs);
      const edges = createEdgesFromRelationships(sampleRelationships);

      const layoutedNodes = await applyRecommendedLayout(
        nodes,
        edges,
        'requirements',
        {
          nodeSpacing: 200,
          direction: 'RIGHT'
        }
      );

      expect(layoutedNodes).toHaveLength(3);
      expect(layoutedNodes[0].position).toBeDefined();
    });
  });

  describe('recommendedLayouts', () => {
    it('should export recommended layouts object', () => {
      expect(recommendedLayouts).toBeDefined();
      expect(typeof recommendedLayouts).toBe('object');
    });

    it('should have settings for all diagram types', () => {
      const expectedTypes = [
        'bdd',
        'ibd',
        'requirements',
        'stateMachine',
        'activity',
        'sequence',
        'useCase',
        'package'
      ];

      expectedTypes.forEach(type => {
        expect(recommendedLayouts[type]).toBeDefined();
        expect(recommendedLayouts[type].algorithm).toBeDefined();
      });
    });

    it('should use layered layout for requirements', () => {
      expect(recommendedLayouts.requirements.algorithm).toBe('layered');
      expect(recommendedLayouts.requirements.direction).toBe('DOWN');
    });

    it('should use force layout for state machines', () => {
      expect(recommendedLayouts.stateMachine.algorithm).toBe('force');
    });

    it('should use sequence layout for sequence diagrams', () => {
      expect(recommendedLayouts.sequence.algorithm).toBe('sequence');
    });

    it('should use box layout for IBD', () => {
      expect(recommendedLayouts.ibd.algorithm).toBe('box');
    });
  });

  describe('Layout algorithm validation', () => {
    it('should handle DOWN direction', async () => {
      const nodes = createNodesFromSpecs(sampleSpecs);
      const edges = createEdgesFromRelationships(sampleRelationships);

      const layoutedNodes = await applyLayout(nodes, edges, {
        algorithm: 'layered',
        direction: 'DOWN'
      });

      expect(layoutedNodes).toHaveLength(3);
    });

    it('should handle UP direction', async () => {
      const nodes = createNodesFromSpecs(sampleSpecs);
      const edges = createEdgesFromRelationships(sampleRelationships);

      const layoutedNodes = await applyLayout(nodes, edges, {
        algorithm: 'layered',
        direction: 'UP'
      });

      expect(layoutedNodes).toHaveLength(3);
    });

    it('should handle LEFT direction', async () => {
      const nodes = createNodesFromSpecs(sampleSpecs);
      const edges = createEdgesFromRelationships(sampleRelationships);

      const layoutedNodes = await applyLayout(nodes, edges, {
        algorithm: 'layered',
        direction: 'LEFT'
      });

      expect(layoutedNodes).toHaveLength(3);
    });

    it('should handle RIGHT direction', async () => {
      const nodes = createNodesFromSpecs(sampleSpecs);
      const edges = createEdgesFromRelationships(sampleRelationships);

      const layoutedNodes = await applyLayout(nodes, edges, {
        algorithm: 'layered',
        direction: 'RIGHT'
      });

      expect(layoutedNodes).toHaveLength(3);
    });
  });
});
