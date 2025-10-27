import { useState, useEffect } from 'react';
import { ReactFlowProvider } from 'reactflow';
import {
  SysMLDiagram,
  createNodesFromSpecs,
  createEdgesFromRelationships,
  layoutAndRoute,
  layoutAndRouteFromSpecs,
  type SysMLReactFlowNode,
  type SysMLReactFlowEdge,
  type LayoutAlgorithm
} from '../src';

/**
 * Example: Automatic Layout for SysML Diagrams
 *
 * This example demonstrates the automatic layout capabilities using elkjs.
 * The library supports multiple layout algorithms optimized for different diagram types.
 */

// Sample requirement hierarchy for layout demonstration
const requirementSpecs = [
  {
    kind: 'requirement-definition' as const,
    spec: {
      id: 'REQ-SYS',
      name: 'System Requirements',
      text: 'The system shall meet all operational requirements'
    }
  },
  {
    kind: 'requirement-usage' as const,
    spec: {
      id: 'REQ-PERF',
      name: 'Performance Requirements',
      definition: 'REQ-SYS',
      text: 'The system shall achieve target performance metrics'
    }
  },
  {
    kind: 'requirement-usage' as const,
    spec: {
      id: 'REQ-SAFE',
      name: 'Safety Requirements',
      definition: 'REQ-SYS',
      text: 'The system shall operate safely in all conditions'
    }
  },
  {
    kind: 'requirement-usage' as const,
    spec: {
      id: 'REQ-SPEED',
      name: 'Speed Requirement',
      definition: 'REQ-PERF',
      text: 'Response time shall be < 100ms'
    }
  },
  {
    kind: 'requirement-usage' as const,
    spec: {
      id: 'REQ-LOAD',
      name: 'Load Requirement',
      definition: 'REQ-PERF',
      text: 'System shall handle 1000 concurrent users'
    }
  }
];

const requirementRelationships = [
  { id: 'e1', type: 'specialize', source: 'REQ-PERF', target: 'REQ-SYS', label: 'specialize' },
  { id: 'e2', type: 'specialize', source: 'REQ-SAFE', target: 'REQ-SYS', label: 'specialize' },
  { id: 'e3', type: 'specialize', source: 'REQ-SPEED', target: 'REQ-PERF', label: 'specialize' },
  { id: 'e4', type: 'specialize', source: 'REQ-LOAD', target: 'REQ-PERF', label: 'specialize' }
];

// Sample block hierarchy
const blockSpecs = [
  {
    kind: 'part-definition' as const,
    spec: {
      id: 'VEHICLE',
      name: 'Vehicle',
      description: 'Complete vehicle system'
    }
  },
  {
    kind: 'part-usage' as const,
    spec: {
      id: 'POWERTRAIN',
      name: 'powertrain',
      definition: 'Powertrain',
      attributes: [{ name: 'power', type: 'Real', multiplicity: '[1]' }]
    }
  },
  {
    kind: 'part-usage' as const,
    spec: {
      id: 'BATTERY',
      name: 'battery',
      definition: 'BatteryPack',
      attributes: [{ name: 'capacity', type: 'Real', multiplicity: '[1]' }]
    }
  },
  {
    kind: 'part-usage' as const,
    spec: {
      id: 'MOTOR',
      name: 'motor',
      definition: 'ElectricMotor',
      attributes: [{ name: 'rpm', type: 'Integer', multiplicity: '[1]' }]
    }
  }
];

const blockRelationships = [
  { id: 'e1', type: 'composition', source: 'VEHICLE', target: 'POWERTRAIN', label: 'contains' },
  { id: 'e2', type: 'composition', source: 'POWERTRAIN', target: 'BATTERY', label: 'contains' },
  { id: 'e3', type: 'composition', source: 'POWERTRAIN', target: 'MOTOR', label: 'contains' }
];

/**
 * Example 1: Basic Automatic Layout
 * Uses the default layered algorithm
 */
export const BasicLayoutExample = () => {
  const [nodes, setNodes] = useState<SysMLReactFlowNode[]>([]);
  const [edges, setEdges] = useState<SysMLReactFlowEdge[]>([]);

  useEffect(() => {
    async function layoutDiagram() {
      // Create nodes without specifying positions
      const initialNodes = createNodesFromSpecs(requirementSpecs);
      const initialEdges = createEdgesFromRelationships(requirementRelationships);

      // Apply automatic layout with measurement
      const { nodes: layoutedNodes, edges: layoutedEdges } = await layoutAndRoute(initialNodes, initialEdges, {
        measure: true,
        algorithm: 'layered',
        direction: 'DOWN',
        nodeSpacing: 100,
        layerSpacing: 120
      });

      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
    }

    layoutDiagram();
  }, []);

  return (
    <ReactFlowProvider>
      <div style={{ width: '100%', height: 600 }}>
        <SysMLDiagram nodes={nodes} edges={edges} fitView />
      </div>
    </ReactFlowProvider>
  );
};

/**
 * Example 2: Recommended Layout for Diagram Type
 * Uses optimized settings for requirement diagrams
 */
export const RecommendedLayoutExample = () => {
  const [nodes, setNodes] = useState<SysMLReactFlowNode[]>([]);
  const [edges, setEdges] = useState<SysMLReactFlowEdge[]>([]);

  useEffect(() => {
    async function layoutDiagram() {
      const { nodes: layoutedNodes, edges: layoutedEdges } = await layoutAndRouteFromSpecs(
        requirementSpecs,
        requirementRelationships,
        'requirements',
        { measure: true }
      );

      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
    }

    layoutDiagram();
  }, []);

  return (
    <ReactFlowProvider>
      <div style={{ width: '100%', height: 600 }}>
        <SysMLDiagram nodes={nodes} edges={edges} fitView />
      </div>
    </ReactFlowProvider>
  );
};

/**
 * Example 3: Interactive Layout Switcher
 * Allows switching between different layout algorithms
 */
export const InteractiveLayoutExample = () => {
  const [nodes, setNodes] = useState<SysMLReactFlowNode[]>([]);
  const [edges, setEdges] = useState<SysMLReactFlowEdge[]>([]);
  const [algorithm, setAlgorithm] = useState<LayoutAlgorithm>('layered');

  useEffect(() => {
    async function layoutDiagram() {
      const initialNodes = createNodesFromSpecs(blockSpecs);
      const initialEdges = createEdgesFromRelationships(blockRelationships);

      const { nodes: layoutedNodes, edges: layoutedEdges } = await layoutAndRoute(initialNodes, initialEdges, {
        algorithm,
        measure: true,
        direction: 'DOWN',
        nodeSpacing: 140,
        layerSpacing: 160
      });

      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
    }

    layoutDiagram();
  }, [algorithm]);

  return (
    <ReactFlowProvider>
      <div style={{ width: '100%', height: 700 }}>
        <div style={{ padding: 10, background: '#f5f5f5', marginBottom: 10 }}>
          <label>
            Layout Algorithm:{' '}
            <select
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value as LayoutAlgorithm)}
            >
              <option value="layered">Layered (Hierarchical)</option>
              <option value="force">Force-Directed</option>
              <option value="mrtree">Multi-Root Tree</option>
              <option value="box">Box (Orthogonal)</option>
            </select>
          </label>
        </div>
        <div style={{ width: '100%', height: 650 }}>
          <SysMLDiagram nodes={nodes} edges={edges} fitView />
        </div>
      </div>
    </ReactFlowProvider>
  );
};

/**
 * Example 4: Custom Layout Options
 * Fine-tune spacing and direction
 */
export const CustomLayoutExample = () => {
  const [nodes, setNodes] = useState<SysMLReactFlowNode[]>([]);
  const [edges, setEdges] = useState<SysMLReactFlowEdge[]>([]);
  const [nodeSpacing, setNodeSpacing] = useState(80);
  const [layerSpacing, setLayerSpacing] = useState(100);

  useEffect(() => {
    async function layoutDiagram() {
      const initialNodes = createNodesFromSpecs(requirementSpecs);
      const initialEdges = createEdgesFromRelationships(requirementRelationships);

      const { nodes: layoutedNodes, edges: layoutedEdges } = await layoutAndRoute(initialNodes, initialEdges, {
        algorithm: 'layered',
        measure: true,
        direction: 'DOWN',
        nodeSpacing,
        layerSpacing
      });

      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
    }

    layoutDiagram();
  }, [nodeSpacing, layerSpacing]);

  return (
    <ReactFlowProvider>
      <div style={{ width: '100%', height: 700 }}>
        <div style={{ padding: 10, background: '#f5f5f5', marginBottom: 10 }}>
          <label style={{ marginRight: 20 }}>
            Node Spacing: {nodeSpacing}px
            <input
              type="range"
              min="20"
              max="200"
              value={nodeSpacing}
              onChange={(e) => setNodeSpacing(Number(e.target.value))}
              style={{ marginLeft: 10 }}
            />
          </label>
          <label>
            Layer Spacing: {layerSpacing}px
            <input
              type="range"
              min="40"
              max="250"
              value={layerSpacing}
              onChange={(e) => setLayerSpacing(Number(e.target.value))}
              style={{ marginLeft: 10 }}
            />
          </label>
        </div>
        <div style={{ width: '100%', height: 650 }}>
          <SysMLDiagram nodes={nodes} edges={edges} fitView />
        </div>
      </div>
    </ReactFlowProvider>
  );
};

/**
 * Layout Algorithm Guide
 *
 * **Layered (Hierarchical)**
 * - Best for: BDD, Requirements, Packages, Activity diagrams
 * - Arranges nodes in horizontal layers
 * - Good for showing hierarchies and flows
 * - Supports direction: DOWN, UP, LEFT, RIGHT
 *
 * **Force-Directed**
 * - Best for: State machines, Use cases
 * - Uses physics simulation to position nodes
 * - Good for cyclic graphs
 * - Natural spacing based on connections
 *
 * **Multi-Root Tree**
 * - Best for: Package hierarchies, Taxonomies
 * - Optimized for tree structures with multiple roots
 * - Clean hierarchical layout
 *
 * **Box (Orthogonal)**
 * - Best for: Internal Block Diagrams (IBD)
 * - Packs nodes into compact boxes
 * - Good for component compositions
 *
 * **Sequence**
 * - Best for: Sequence diagrams
 * - Horizontal lifeline arrangement
 * - Automatic spacing for participants
 */
