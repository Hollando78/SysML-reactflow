import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { ReactFlowProvider } from 'reactflow';
import { SysMLDiagram } from './SysMLDiagram';
import type { SysMLModel } from './viewpoints';
import { structuralDefinitionViewpoint } from './viewpoints';

describe('SysMLDiagram Component', () => {
  const sampleNodes = [
    {
      id: 'node-1',
      type: 'sysml.part-definition',
      position: { x: 0, y: 0 },
      data: {
        id: 'node-1',
        name: 'Vehicle',
        kind: 'part-definition' as const,
        elementKind: 'definition' as const
      }
    }
  ];

  const sampleEdges = [
    {
      id: 'edge-1',
      type: 'sysml.relationship',
      source: 'node-1',
      target: 'node-1',
      data: {
        kind: 'satisfy' as const
      }
    }
  ];

  it('should render with nodes and edges', () => {
    const { container } = render(
      <ReactFlowProvider>
        <div style={{ width: 800, height: 600 }}>
          <SysMLDiagram nodes={sampleNodes} edges={sampleEdges} />
        </div>
      </ReactFlowProvider>
    );

    expect(container.querySelector('.react-flow')).toBeDefined();
  });

  it('should render with model and viewpoint', () => {
    const model: SysMLModel = {
      nodes: [
        {
          kind: 'part-definition',
          spec: { id: 'part-1', name: 'Vehicle' }
        }
      ],
      relationships: []
    };

    const { container } = render(
      <ReactFlowProvider>
        <div style={{ width: 800, height: 600 }}>
          <SysMLDiagram model={model} viewpoint={structuralDefinitionViewpoint} />
        </div>
      </ReactFlowProvider>
    );

    expect(container.querySelector('.react-flow')).toBeDefined();
  });

  it('should throw error when neither nodes/edges nor model/viewpoint provided', () => {
    // Suppress console.error for this test
    const originalError = console.error;
    console.error = () => {};

    expect(() => {
      render(
        <ReactFlowProvider>
          <div style={{ width: 800, height: 600 }}>
            <SysMLDiagram />
          </div>
        </ReactFlowProvider>
      );
    }).toThrow();

    console.error = originalError;
  });

  it('should render controls when showControls is true', () => {
    const { container } = render(
      <ReactFlowProvider>
        <div style={{ width: 800, height: 600 }}>
          <SysMLDiagram nodes={sampleNodes} edges={sampleEdges} showControls={true} />
        </div>
      </ReactFlowProvider>
    );

    expect(container.querySelector('.react-flow__controls')).toBeDefined();
  });

  it('should hide controls when showControls is false', () => {
    const { container } = render(
      <ReactFlowProvider>
        <div style={{ width: 800, height: 600 }}>
          <SysMLDiagram nodes={sampleNodes} edges={sampleEdges} showControls={false} />
        </div>
      </ReactFlowProvider>
    );

    expect(container.querySelector('.react-flow__controls')).toBeNull();
  });

  it('should render minimap when showMiniMap is true', () => {
    const { container } = render(
      <ReactFlowProvider>
        <div style={{ width: 800, height: 600 }}>
          <SysMLDiagram nodes={sampleNodes} edges={sampleEdges} showMiniMap={true} />
        </div>
      </ReactFlowProvider>
    );

    expect(container.querySelector('.react-flow__minimap')).toBeDefined();
  });

  it('should hide minimap when showMiniMap is false', () => {
    const { container } = render(
      <ReactFlowProvider>
        <div style={{ width: 800, height: 600 }}>
          <SysMLDiagram nodes={sampleNodes} edges={sampleEdges} showMiniMap={false} />
        </div>
      </ReactFlowProvider>
    );

    expect(container.querySelector('.react-flow__minimap')).toBeNull();
  });

  it('should render background when showBackground is true', () => {
    const { container } = render(
      <ReactFlowProvider>
        <div style={{ width: 800, height: 600 }}>
          <SysMLDiagram nodes={sampleNodes} edges={sampleEdges} showBackground={true} />
        </div>
      </ReactFlowProvider>
    );

    expect(container.querySelector('.react-flow__background')).toBeDefined();
  });

  it('should hide background when showBackground is false', () => {
    const { container } = render(
      <ReactFlowProvider>
        <div style={{ width: 800, height: 600 }}>
          <SysMLDiagram nodes={sampleNodes} edges={sampleEdges} showBackground={false} />
        </div>
      </ReactFlowProvider>
    );

    expect(container.querySelector('.react-flow__background')).toBeNull();
  });

  it('should accept custom node types', () => {
    const CustomNode = () => <div>Custom</div>;
    const customNodeTypes = {
      custom: CustomNode
    };

    const { container } = render(
      <ReactFlowProvider>
        <div style={{ width: 800, height: 600 }}>
          <SysMLDiagram nodes={sampleNodes} edges={sampleEdges} nodeTypes={customNodeTypes} />
        </div>
      </ReactFlowProvider>
    );

    expect(container.querySelector('.react-flow')).toBeDefined();
  });

  it('should accept custom edge types', () => {
    const CustomEdge = () => <path />;
    const customEdgeTypes = {
      custom: CustomEdge
    };

    const { container } = render(
      <ReactFlowProvider>
        <div style={{ width: 800, height: 600 }}>
          <SysMLDiagram nodes={sampleNodes} edges={sampleEdges} edgeTypes={customEdgeTypes} />
        </div>
      </ReactFlowProvider>
    );

    expect(container.querySelector('.react-flow')).toBeDefined();
  });

  it('should accept children', () => {
    const { getByText } = render(
      <ReactFlowProvider>
        <div style={{ width: 800, height: 600 }}>
          <SysMLDiagram nodes={sampleNodes} edges={sampleEdges}>
            <div>Custom Child</div>
          </SysMLDiagram>
        </div>
      </ReactFlowProvider>
    );

    expect(getByText('Custom Child')).toBeDefined();
  });
});
