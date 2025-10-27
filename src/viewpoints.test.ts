import { describe, it, expect } from 'vitest';
import {
  realizeViewpoint,
  structuralDefinitionViewpoint,
  usageStructureViewpoint,
  behaviorControlViewpoint,
  interactionViewpoint,
  stateViewpoint,
  requirementViewpoint
} from './viewpoints';
import type { SysMLModel } from './viewpoints';

describe('Viewpoints', () => {
  const sampleModel: SysMLModel = {
    nodes: [
      {
        kind: 'part-definition',
        spec: { id: 'part-def-1', name: 'Vehicle' }
      },
      {
        kind: 'part-usage',
        spec: { id: 'part-usage-1', name: 'myCar', definition: 'Vehicle' }
      },
      {
        kind: 'action-definition',
        spec: { id: 'action-def-1', name: 'Drive' }
      },
      {
        kind: 'action-usage',
        spec: { id: 'action-usage-1', name: 'drive()', definition: 'Drive' }
      },
      {
        kind: 'requirement-definition',
        spec: { id: 'req-def-1', name: 'SpeedReq', text: 'Max speed 120 km/h' }
      },
      {
        kind: 'requirement-usage',
        spec: { id: 'req-usage-1', name: 'speedReq', text: 'Speed requirement instance' }
      },
      {
        kind: 'state',
        spec: { id: 'state-1', name: 'Idle' }
      },
      {
        kind: 'state-machine',
        spec: { id: 'sm-1', name: 'VehicleStateMachine', states: [] }
      },
      {
        kind: 'sequence-lifeline',
        spec: { id: 'lifeline-1', name: 'Controller', classifier: 'Controller' }
      },
      {
        kind: 'activity-control',
        spec: { id: 'fork-1', name: 'Fork', controlType: 'fork' }
      }
    ],
    relationships: [
      {
        id: 'rel-1',
        type: 'definition',
        source: 'part-usage-1',
        target: 'part-def-1'
      },
      {
        id: 'rel-2',
        type: 'satisfy',
        source: 'part-def-1',
        target: 'req-def-1'
      },
      {
        id: 'rel-3',
        type: 'allocate',
        source: 'part-usage-1',
        target: 'action-usage-1'
      },
      {
        id: 'rel-4',
        type: 'control-flow',
        source: 'action-usage-1',
        target: 'fork-1'
      },
      {
        id: 'rel-5',
        type: 'transition',
        source: 'state-1',
        target: 'state-1'
      },
      {
        id: 'rel-6',
        type: 'message',
        source: 'lifeline-1',
        target: 'lifeline-1'
      }
    ]
  };

  describe('Structural Definition Viewpoint', () => {
    it('should filter nodes to include only structural definitions', () => {
      const view = realizeViewpoint(sampleModel, structuralDefinitionViewpoint);

      const nodeKinds = view.nodes.map(n => n.data.kind);
      expect(nodeKinds).toContain('part-definition');
      expect(nodeKinds).toContain('action-definition');
      expect(nodeKinds).not.toContain('part-usage');
      expect(nodeKinds).not.toContain('requirement-definition');
      expect(nodeKinds).not.toContain('state');
    });

    it('should filter edges to include only definition relationships', () => {
      const view = realizeViewpoint(sampleModel, structuralDefinitionViewpoint);

      const edgeTypes = view.edges.map(e => e.data?.kind);
      expect(edgeTypes).toContain('definition');
      expect(edgeTypes).not.toContain('control-flow');
      expect(edgeTypes).not.toContain('message');
    });
  });

  describe('Usage Structure Viewpoint', () => {
    it('should filter nodes to include only usage elements', () => {
      const view = realizeViewpoint(sampleModel, usageStructureViewpoint);

      const nodeKinds = view.nodes.map(n => n.data.kind);
      expect(nodeKinds).toContain('part-usage');
      expect(nodeKinds).toContain('action-usage');
      expect(nodeKinds).not.toContain('part-definition');
      expect(nodeKinds).not.toContain('requirement-definition');
    });

    it('should filter edges for usage relationships', () => {
      const view = realizeViewpoint(sampleModel, usageStructureViewpoint);

      const edgeTypes = view.edges.map(e => e.data?.kind);
      expect(edgeTypes).toContain('definition');
      expect(edgeTypes).toContain('allocate');
    });
  });

  describe('Behavior Control Viewpoint', () => {
    it('should filter nodes to include actions and control nodes', () => {
      const view = realizeViewpoint(sampleModel, behaviorControlViewpoint);

      const nodeKinds = view.nodes.map(n => n.data.kind);
      expect(nodeKinds).toContain('action-definition');
      expect(nodeKinds).toContain('action-usage');
      expect(nodeKinds).toContain('activity-control');
      expect(nodeKinds).not.toContain('part-definition');
    });

    it('should filter edges for control flow relationships', () => {
      const view = realizeViewpoint(sampleModel, behaviorControlViewpoint);

      const edgeTypes = view.edges.map(e => e.data?.kind);
      expect(edgeTypes).toContain('control-flow');
    });
  });

  describe('Interaction Viewpoint', () => {
    it('should filter nodes to include only lifelines', () => {
      const view = realizeViewpoint(sampleModel, interactionViewpoint);

      const nodeKinds = view.nodes.map(n => n.data.kind);
      expect(nodeKinds).toContain('sequence-lifeline');
      expect(nodeKinds).not.toContain('part-definition');
      expect(nodeKinds).not.toContain('action-definition');
    });

    it('should filter edges for message relationships', () => {
      const view = realizeViewpoint(sampleModel, interactionViewpoint);

      const edgeTypes = view.edges.map(e => e.data?.kind);
      expect(edgeTypes).toContain('message');
      expect(edgeTypes).not.toContain('control-flow');
    });
  });

  describe('State Viewpoint', () => {
    it('should filter nodes to include states and state machines', () => {
      const view = realizeViewpoint(sampleModel, stateViewpoint);

      const nodeKinds = view.nodes.map(n => n.data.kind);
      expect(nodeKinds).toContain('state');
      expect(nodeKinds).toContain('state-machine');
      expect(nodeKinds).not.toContain('action-definition');
    });

    it('should filter edges for transition relationships', () => {
      const view = realizeViewpoint(sampleModel, stateViewpoint);

      const edgeTypes = view.edges.map(e => e.data?.kind);
      expect(edgeTypes).toContain('transition');
      expect(edgeTypes).not.toContain('satisfy');
    });
  });

  describe('Requirement Viewpoint', () => {
    it('should filter nodes to include requirements', () => {
      const view = realizeViewpoint(sampleModel, requirementViewpoint);

      const nodeKinds = view.nodes.map(n => n.data.kind);
      expect(nodeKinds).toContain('requirement-definition');
      expect(nodeKinds).toContain('requirement-usage');
      expect(nodeKinds).not.toContain('part-definition');
    });

    it('should filter edges for requirement relationships', () => {
      const view = realizeViewpoint(sampleModel, requirementViewpoint);

      const edgeTypes = view.edges.map(e => e.data?.kind);
      expect(edgeTypes).toContain('satisfy');
      expect(edgeTypes).not.toContain('control-flow');
    });
  });

  describe('Custom Positions', () => {
    it('should apply custom positions to materialized nodes', () => {
      const positions = {
        'part-def-1': { x: 100, y: 200 }
      };

      const view = realizeViewpoint(sampleModel, structuralDefinitionViewpoint, { positions });

      const partNode = view.nodes.find(n => n.id === 'part-def-1');
      expect(partNode?.position.x).toBe(100);
      expect(partNode?.position.y).toBe(200);
    });

    it('should use default positions when not specified', () => {
      const view = realizeViewpoint(sampleModel, structuralDefinitionViewpoint);

      const partNode = view.nodes.find(n => n.id === 'part-def-1');
      expect(partNode?.position).toBeDefined();
    });
  });

  describe('Custom Filters', () => {
    it('should apply custom node filter', () => {
      const customViewpoint = {
        ...structuralDefinitionViewpoint,
        nodeFilter: (spec: any) => spec.spec.name.startsWith('V')
      };

      const view = realizeViewpoint(sampleModel, customViewpoint);

      expect(view.nodes.every(n => n.data.name.startsWith('V'))).toBe(true);
    });

    it('should apply custom relationship filter', () => {
      const customViewpoint = {
        ...requirementViewpoint,
        relationshipFilter: (rel: any) => rel.type === 'satisfy'
      };

      const view = realizeViewpoint(sampleModel, customViewpoint);

      expect(view.edges.every(e => e.data?.kind === 'satisfy')).toBe(true);
    });
  });

  describe('Viewpoint Metadata', () => {
    it('should have correct viewpoint IDs', () => {
      expect(structuralDefinitionViewpoint.id).toBe('sysml.structuralDefinition');
      expect(usageStructureViewpoint.id).toBe('sysml.usageStructure');
      expect(behaviorControlViewpoint.id).toBe('sysml.behaviorControl');
      expect(interactionViewpoint.id).toBe('sysml.interaction');
      expect(stateViewpoint.id).toBe('sysml.state');
      expect(requirementViewpoint.id).toBe('sysml.requirement');
    });

    it('should have descriptive names', () => {
      expect(structuralDefinitionViewpoint.name).toBeTruthy();
      expect(usageStructureViewpoint.name).toBeTruthy();
      expect(behaviorControlViewpoint.name).toBeTruthy();
      expect(interactionViewpoint.name).toBeTruthy();
      expect(stateViewpoint.name).toBeTruthy();
      expect(requirementViewpoint.name).toBeTruthy();
    });

    it('should have descriptions', () => {
      expect(structuralDefinitionViewpoint.description).toBeTruthy();
      expect(usageStructureViewpoint.description).toBeTruthy();
      expect(behaviorControlViewpoint.description).toBeTruthy();
      expect(interactionViewpoint.description).toBeTruthy();
      expect(stateViewpoint.description).toBeTruthy();
      expect(requirementViewpoint.description).toBeTruthy();
    });
  });
});
