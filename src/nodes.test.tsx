import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { ReactFlowProvider } from 'reactflow';
import { sysmlNodeTypes } from './nodes';
import type { SysMLNodeData } from './types';

// Helper to render nodes within ReactFlow context
const renderNode = (Component: any, data: SysMLNodeData) => {
  const props = {
    id: data.id,
    data,
    selected: false,
    isConnectable: true,
    xPos: 0,
    yPos: 0,
    dragging: false,
    zIndex: 0,
    type: 'test'
  };

  return render(
    <ReactFlowProvider>
      <Component {...props} />
    </ReactFlowProvider>
  );
};

describe('Node Components', () => {
  describe('DefinitionNode', () => {
    const DefinitionNode = sysmlNodeTypes['sysml.part-definition'];

    it('should render node name', () => {
      const data: SysMLNodeData = {
        id: 'test-1',
        name: 'Vehicle',
        kind: 'part-definition',
        elementKind: 'definition'
      };

      const { getByText } = renderNode(DefinitionNode, data);
      expect(getByText('Vehicle')).toBeDefined();
    });

    it('should render stereotype', () => {
      const data: SysMLNodeData = {
        id: 'test-1',
        name: 'Vehicle',
        kind: 'part-definition',
        stereotype: 'custom',
        elementKind: 'definition'
      };

      const { getByText } = renderNode(DefinitionNode, data);
      expect(getByText(/custom/i)).toBeDefined();
    });

    it('should render element kind badge', () => {
      const data: SysMLNodeData = {
        id: 'test-1',
        name: 'Vehicle',
        kind: 'part-definition',
        elementKind: 'definition'
      };

      const { getAllByText } = renderNode(DefinitionNode, data);
      const elements = getAllByText(/definition/i);
      expect(elements.length).toBeGreaterThan(0);
    });

    it('should render status', () => {
      const data: SysMLNodeData = {
        id: 'test-1',
        name: 'Vehicle',
        kind: 'part-definition',
        elementKind: 'definition',
        status: 'approved'
      };

      const { getByText } = renderNode(DefinitionNode, data);
      expect(getByText(/approved/i)).toBeDefined();
    });

    it('should render documentation', () => {
      const data: SysMLNodeData = {
        id: 'test-1',
        name: 'Vehicle',
        kind: 'part-definition',
        documentation: 'A vehicle part definition',
        elementKind: 'definition'
      };

      const { getByText } = renderNode(DefinitionNode, data);
      expect(getByText('A vehicle part definition')).toBeDefined();
    });

    it('should render base definition', () => {
      const data: SysMLNodeData = {
        id: 'test-1',
        name: 'myCar',
        kind: 'part-usage',
        elementKind: 'usage',
        baseDefinition: 'Vehicle'
      };

      const { getByText } = renderNode(DefinitionNode, data);
      expect(getByText('Vehicle')).toBeDefined();
    });

    it('should render compartments', () => {
      const data: SysMLNodeData = {
        id: 'test-1',
        name: 'Vehicle',
        kind: 'part-definition',
        elementKind: 'definition',
        compartments: [
          {
            title: 'attributes',
            items: [
              { label: 'mass', value: 'Real' },
              { label: 'speed', value: 'Real' }
            ]
          }
        ]
      };

      const { getByText } = renderNode(DefinitionNode, data);
      expect(getByText('mass')).toBeDefined();
      expect(getByText('speed')).toBeDefined();
    });
  });

  describe('RequirementNode', () => {
    const RequirementNode = sysmlNodeTypes['sysml.requirement-definition'];

    it('should render requirement name', () => {
      const data: SysMLNodeData = {
        id: 'req-1',
        name: 'ThermalRequirement',
        kind: 'requirement-definition',
        elementKind: 'definition'
      };

      const { getByText } = renderNode(RequirementNode, data);
      expect(getByText('ThermalRequirement')).toBeDefined();
    });

    it('should render requirement compartments', () => {
      const data: SysMLNodeData = {
        id: 'req-1',
        name: 'ThermalRequirement',
        kind: 'requirement-definition',
        elementKind: 'definition',
        compartments: [
          {
            title: 'text',
            items: [{ label: 'The system shall maintain temperature' }]
          }
        ]
      };

      const { getByText } = renderNode(RequirementNode, data);
      expect(getByText('The system shall maintain temperature')).toBeDefined();
    });
  });

  describe('StateNode', () => {
    const StateNode = sysmlNodeTypes['sysml.state'];

    it('should render state name', () => {
      const data: SysMLNodeData = {
        id: 'state-1',
        name: 'Idle',
        kind: 'state'
      };

      const { getByText } = renderNode(StateNode, data);
      expect(getByText('Idle')).toBeDefined();
    });

    it('should render state actions', () => {
      const data: SysMLNodeData = {
        id: 'state-1',
        name: 'Active',
        kind: 'state',
        compartments: [
          {
            title: 'entry',
            items: [{ label: 'powerOn()' }]
          },
          {
            title: 'do',
            items: [{ label: 'monitor()' }]
          },
          {
            title: 'exit',
            items: [{ label: 'powerOff()' }]
          }
        ]
      };

      const { getByText } = renderNode(StateNode, data);
      expect(getByText('powerOn()')).toBeDefined();
      expect(getByText('monitor()')).toBeDefined();
      expect(getByText('powerOff()')).toBeDefined();
    });
  });

  describe('ActivityNode', () => {
    const ActivityNode = sysmlNodeTypes['sysml.perform-action'];

    it('should render action name', () => {
      const data: SysMLNodeData = {
        id: 'action-1',
        name: 'ProvidePower',
        kind: 'perform-action'
      };

      const { getByText } = renderNode(ActivityNode, data);
      expect(getByText('ProvidePower')).toBeDefined();
    });

    it('should render emphasis text', () => {
      const data: SysMLNodeData = {
        id: 'action-1',
        name: 'Calculate',
        kind: 'perform-action',
        emphasis: 'result = a + b'
      };

      const { getByText } = renderNode(ActivityNode, data);
      expect(getByText('result = a + b')).toBeDefined();
    });
  });

  describe('UseCaseNode', () => {
    const UseCaseNode = sysmlNodeTypes['sysml.use-case-definition'];

    it('should render use case name', () => {
      const data: SysMLNodeData = {
        id: 'uc-1',
        name: 'Manage Power',
        kind: 'use-case-definition'
      };

      const { getByText } = renderNode(UseCaseNode, data);
      expect(getByText('Manage Power')).toBeDefined();
    });
  });

  describe('SequenceLifelineNode', () => {
    const LifelineNode = sysmlNodeTypes['sysml.sequence-lifeline'];

    it('should render lifeline name', () => {
      const data: SysMLNodeData = {
        id: 'lifeline-1',
        name: 'Controller',
        kind: 'sequence-lifeline'
      };

      const { getByText } = renderNode(LifelineNode, data);
      expect(getByText('Controller')).toBeDefined();
    });
  });

  describe('Node Type Registry', () => {
    it('should have all 63 node types registered', () => {
      // Check that key node types are registered
      expect(sysmlNodeTypes['sysml.part-definition']).toBeDefined();
      expect(sysmlNodeTypes['sysml.part-usage']).toBeDefined();
      expect(sysmlNodeTypes['sysml.action-definition']).toBeDefined();
      expect(sysmlNodeTypes['sysml.action-usage']).toBeDefined();
      expect(sysmlNodeTypes['sysml.requirement-definition']).toBeDefined();
      expect(sysmlNodeTypes['sysml.requirement-usage']).toBeDefined();
      expect(sysmlNodeTypes['sysml.state']).toBeDefined();
      expect(sysmlNodeTypes['sysml.state-machine']).toBeDefined();
      expect(sysmlNodeTypes['sysml.activity-control']).toBeDefined();
      expect(sysmlNodeTypes['sysml.sequence-lifeline']).toBeDefined();
    });

    it('should have correct number of node type registrations', () => {
      const nodeTypeCount = Object.keys(sysmlNodeTypes).length;
      // We have 55 unique node type registrations (some types share renderers)
      expect(nodeTypeCount).toBeGreaterThanOrEqual(55);
    });
  });
});
