# Automatic Layout in sysml-reactflow

This library provides automatic graph layout capabilities powered by [elkjs](https://github.com/kieler/elkjs), the Eclipse Layout Kernel. This eliminates the need to manually specify positions for every node.

## Quick Start

```typescript
import {
  createNodesFromSpecs,
  createEdgesFromRelationships,
  applyLayout
} from 'sysml-reactflow';

// Create nodes without specifying positions
const nodes = createNodesFromSpecs([
  {
    kind: 'requirement-usage',
    spec: { id: 'REQ-1', name: 'System Requirement', text: '...' }
  },
  {
    kind: 'part-definition',
    spec: { id: 'PART-1', name: 'SystemController' }
  }
]);

const edges = createEdgesFromRelationships([
  { id: 'e1', type: 'satisfy', source: 'PART-1', target: 'REQ-1' }
]);

// Apply automatic layout
const { nodes: layoutedNodes } = await applyLayout(nodes, edges);

// Render with positioned nodes
<SysMLDiagram nodes={layoutedNodes} edges={layoutedEdges} fitView />
```

## Layout Algorithms

The library supports multiple layout algorithms optimized for different diagram types:

### Layout & Routing Pipeline

Use `layoutAndRouteFromSpecs()` (or `layoutAndRoute()` for pre-created nodes) to measure, layout, and auto-route in a single call:

```typescript
import { layoutAndRouteFromSpecs } from 'sysml-reactflow';

const { nodes, edges } = await layoutAndRouteFromSpecs(specs, relationships, 'bdd', {
  measure: true
});

<SysMLDiagram nodes={nodes} edges={edges} fitView />
```

When `measure: true`, nodes are rendered offscreen to capture their actual width/height before invoking ELK. This keeps spacing and connector attachments aligned with the real components. For server-side or non-DOM environments, the helper falls back to nominal sizes.

### 1. Layered (Hierarchical)

**Best for:** BDD, Requirements, Packages, Activity diagrams

Arranges nodes in horizontal layers based on their connections. Minimizes edge crossings and provides a clear flow direction.

```typescript
const { nodes: layoutedNodes, edges: layoutedEdges } = await applyLayout(nodes, edges, {
  algorithm: 'layered',
  direction: 'DOWN',      // DOWN, UP, LEFT, RIGHT
  nodeSpacing: 100,       // Horizontal spacing between nodes
  layerSpacing: 120       // Vertical spacing between layers
});
```

**Use cases:**
- Requirement hierarchies (parent-child relationships)
- Block definition hierarchies (specializations)
- Package containment
- Action flows in activities

### 2. Force-Directed

**Best for:** State machines, Use cases, Complex interconnected graphs

Uses physics-based simulation to position nodes. Connected nodes attract each other, while all nodes repel each other for even spacing.

```typescript
const { nodes: layoutedNodes, edges: layoutedEdges } = await applyLayout(nodes, edges, {
  algorithm: 'force',
  nodeSpacing: 120
});
```

**Use cases:**
- State machine diagrams (states with transitions)
- Use case diagrams (actors and use cases)
- Graphs with cycles
- Networks without clear hierarchy

### 3. Multi-Root Tree

**Best for:** Package hierarchies, Taxonomies, Multiple hierarchies

Optimized for tree structures that may have multiple roots. Provides clean hierarchical visualization.

```typescript
const { nodes: layoutedNodes, edges: layoutedEdges } = await applyLayout(nodes, edges, {
  algorithm: 'mrtree',
  direction: 'DOWN',
  nodeSpacing: 100,
  layerSpacing: 120
});
```

**Use cases:**
- Package and library organization
- Multiple requirement trees
- Taxonomy visualizations

### 4. Box (Orthogonal)

**Best for:** Internal Block Diagrams (IBD), Component compositions

Packs nodes into compact rectangular regions with orthogonal routing.

```typescript
const { nodes: layoutedNodes, edges: layoutedEdges } = await applyLayout(nodes, edges, {
  algorithm: 'box',
  nodeSpacing: 80,
  layerSpacing: 80
});
```

**Use cases:**
- Internal block diagrams showing part compositions
- Tightly-packed component diagrams
- Bounded contexts

### 5. Sequence

**Best for:** Sequence diagrams

Custom layout specifically for sequence diagrams. Arranges lifelines horizontally with equal spacing.

```typescript
const { nodes: layoutedNodes, edges: layoutedEdges } = await applyLayout(nodes, edges, {
  algorithm: 'sequence',
  nodeSpacing: 280,       // Spacing between lifelines
  nodeWidth: 200,         // Lifeline width
  nodeHeight: 100         // Lifeline height
});
```

**Use cases:**
- Sequence diagrams with lifelines and messages
- Interaction diagrams

## Layout Options

All layout functions accept an options object:

```typescript
interface LayoutOptions {
  /**
   * Layout algorithm to use
   * @default 'layered'
   */
  algorithm?: 'layered' | 'force' | 'mrtree' | 'box' | 'sequence';

  /**
   * Direction for hierarchical layouts
   * @default 'DOWN'
   */
  direction?: 'DOWN' | 'UP' | 'RIGHT' | 'LEFT';

  /**
   * Spacing between nodes (px)
   * @default 80
   */
  nodeSpacing?: number;

  /**
   * Spacing between layers/ranks (px)
   * @default 100
   */
  layerSpacing?: number;

  /**
   * Whether to fit the diagram to viewport after layout
   * @default true
   */
  fitView?: boolean;

  /**
   * Node width for layout calculation (px)
   * @default 250
   */
  nodeWidth?: number;

  /**
   * Node height for layout calculation (px)
   * @default 150
   */
  nodeHeight?: number;
}
```

## Recommended Layouts

Use `applyRecommendedLayout()` to automatically select the best algorithm for a diagram type:

```typescript
import { applyRecommendedLayout } from 'sysml-reactflow';

// Automatically uses optimized settings for requirement diagrams
const layoutedNodes = await applyRecommendedLayout(
  nodes,
  edges,
  'requirements'
);
```

### Available Diagram Types

| Diagram Type | Algorithm | Direction | Node Spacing | Layer Spacing |
|--------------|-----------|-----------|--------------|---------------|
| `bdd` | layered | DOWN | 100 | 120 |
| `ibd` | box | - | 80 | 80 |
| `requirements` | layered | DOWN | 90 | 110 |
| `stateMachine` | force | - | 120 | 120 |
| `activity` | layered | DOWN | 70 | 90 |
| `sequence` | sequence | - | 280 | 100 |
| `useCase` | force | - | 150 | 150 |
| `package` | mrtree | DOWN | 100 | 120 |

### Override Recommended Settings

```typescript
const layoutedNodes = await applyRecommendedLayout(
  nodes,
  edges,
  'requirements',
  {
    // Override specific options
    nodeSpacing: 150,
    direction: 'RIGHT'
  }
);
```

## Examples

### Example 1: Requirement Hierarchy

```typescript
import { applyRecommendedLayout } from 'sysml-reactflow';

const specs = [
  {
    kind: 'requirement-definition',
    spec: { id: 'SYS', name: 'System Requirements', text: '...' }
  },
  {
    kind: 'requirement-usage',
    spec: { id: 'PERF', name: 'Performance', definition: 'SYS', text: '...' }
  },
  {
    kind: 'requirement-usage',
    spec: { id: 'SAFE', name: 'Safety', definition: 'SYS', text: '...' }
  }
];

const relationships = [
  { id: 'e1', type: 'specialize', source: 'PERF', target: 'SYS' },
  { id: 'e2', type: 'specialize', source: 'SAFE', target: 'SYS' }
];

const nodes = createNodesFromSpecs(specs);
const edges = createEdgesFromRelationships(relationships);

// Apply recommended layout for requirements
const { nodes: layoutedNodes, edges: layoutedEdges } = await applyRecommendedLayout(nodes, edges, 'requirements');

<SysMLDiagram nodes={layoutedNodes} edges={layoutedEdges} />
```

### Example 2: State Machine

```typescript
import { applyRecommendedLayout } from 'sysml-reactflow';

const states = [
  { kind: 'state-usage', spec: { id: 'OFF', name: 'Off' } },
  { kind: 'state-usage', spec: { id: 'STANDBY', name: 'Standby' } },
  { kind: 'state-usage', spec: { id: 'ACTIVE', name: 'Active' } }
];

const transitions = [
  createStateTransitionEdge({ id: 't1', source: 'OFF', target: 'STANDBY', trigger: 'powerOn' }),
  createStateTransitionEdge({ id: 't2', source: 'STANDBY', target: 'ACTIVE', trigger: 'start' }),
  createStateTransitionEdge({ id: 't3', source: 'ACTIVE', target: 'STANDBY', trigger: 'stop' })
];

const nodes = createNodesFromSpecs(states);

// Force-directed layout works well for state machines
const { nodes: layoutedNodes, edges: layoutedEdges } = await applyRecommendedLayout(nodes, transitions, 'stateMachine');

<SysMLDiagram nodes={layoutedNodes} edges={layoutedEdges} />
```

### Example 3: Block Definition Diagram

```typescript
import { applyRecommendedLayout } from 'sysml-reactflow';

const blocks = [
  { kind: 'part-definition', spec: { id: 'VEHICLE', name: 'Vehicle' } },
  { kind: 'part-usage', spec: { id: 'ENGINE', name: 'engine', definition: 'Engine' } },
  { kind: 'part-usage', spec: { id: 'TRANS', name: 'transmission', definition: 'Transmission' } }
];

const relationships = [
  { id: 'e1', type: 'composition', source: 'VEHICLE', target: 'ENGINE' },
  { id: 'e2', type: 'composition', source: 'VEHICLE', target: 'TRANS' }
];

const nodes = createNodesFromSpecs(blocks);
const edges = createEdgesFromRelationships(relationships);

// Hierarchical layout for BDD
const { nodes: layoutedNodes, edges: layoutedEdges } = await applyRecommendedLayout(nodes, edges, 'bdd');

<SysMLDiagram nodes={layoutedNodes} edges={layoutedEdges} />
```

### Example 4: Sequence Diagram

```typescript
import { applyRecommendedLayout } from 'sysml-reactflow';

const lifelines = [
  createSequenceLifelineNode({ id: 'L1', name: 'User', classifier: 'Actor::User' }, { x: 0, y: 0 }),
  createSequenceLifelineNode({ id: 'L2', name: 'System', classifier: 'Part::System' }, { x: 0, y: 0 }),
  createSequenceLifelineNode({ id: 'L3', name: 'Database', classifier: 'Part::DB' }, { x: 0, y: 0 })
];

const messages = [
  createSequenceMessageEdge({ id: 'm1', type: 'sync', source: 'L1', target: 'L2', label: 'login()' }),
  createSequenceMessageEdge({ id: 'm2', type: 'sync', source: 'L2', target: 'L3', label: 'query()' })
];

// Custom sequence layout arranges lifelines horizontally
const { nodes: layoutedNodes, edges: layoutedEdges } = await applyRecommendedLayout(
  lifelines,
  messages,
  'sequence'
);

<SysMLDiagram nodes={layoutedNodes} edges={layoutedEdges} />
```

## React Component Integration

For React applications, you can use `useEffect` to layout nodes on mount:

```typescript
import { useState, useEffect } from 'react';
import { applyLayout } from 'sysml-reactflow';

function MyDiagram() {
  const [nodes, setNodes] = useState<SysMLReactFlowNode[]>([]);
  const [edges, setEdges] = useState<SysMLReactFlowEdge[]>(...);

  useEffect(() => {
    async function layoutDiagram() {
      const initialNodes = createNodesFromSpecs(...);
      const initialEdges = createEdgesFromRelationships(...);
      const { nodes: layoutedNodes, edges: layoutedEdges } = await applyLayout(initialNodes, initialEdges, {
        algorithm: 'layered',
        direction: 'DOWN'
      });
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
    }

    layoutDiagram();
  }, []);

  return <SysMLDiagram nodes={nodes} edges={edges} />;
}
```

## Performance Considerations

- **Layout is asynchronous** - Use `await` or `.then()` to wait for completion
- **Run once on initialization** - Don't re-layout on every render
- **Large graphs (>100 nodes)** - May take 1-2 seconds
- **Very large graphs (>500 nodes)** - Consider manual layout or simplified views

## Manual Position Override

You can mix automatic layout with manual positioning:

```typescript
const { nodes: layoutedNodes, edges: layoutedEdges } = await applyLayout(nodes, edges);

// Override specific node positions after layout
const finalNodes = layoutedNodes.map(node => {
  if (node.id === 'SPECIAL-NODE') {
    return { ...node, position: { x: 500, y: 500 } };
  }
  return node;
});
```

## Combining with Viewpoints

Automatic layout works seamlessly with SysML v2 viewpoints:

```typescript
import { realizeViewpoint, structuralDefinitionViewpoint, applyLayout } from 'sysml-reactflow';

const model = { nodes: specs, relationships };

// Materialize viewpoint
const view = realizeViewpoint(model, structuralDefinitionViewpoint);

// Apply layout to materialized view
const { nodes: layoutedNodes, edges: layoutedEdges } = await applyLayout(view.nodes, view.relationships);

<SysMLDiagram nodes={layoutedNodes} edges={layoutedEdges} />
```

## Troubleshooting

### Nodes Overlap
- Increase `nodeSpacing` and `layerSpacing`
- Try a different algorithm
- Adjust `nodeWidth` and `nodeHeight` to match actual node sizes

### Poor Layout Quality
- Layered layout works best for DAGs (directed acyclic graphs)
- Use force layout for graphs with cycles
- Ensure edges have correct source/target IDs

### Layout Takes Too Long
- Reduce node count using viewpoints
- Simplify the graph structure
- Use a simpler algorithm (box is faster than layered)

## API Reference

### `applyLayout(nodes, edges, options?)`

Apply automatic layout to a graph.

**Parameters:**
- `nodes: Node<SysMLNodeData>[]` - The nodes to layout
- `edges: Edge<SysMLEdgeData>[]` - The edges connecting the nodes
- `options?: LayoutOptions` - Layout configuration

**Returns:** `Promise<Node<SysMLNodeData>[]>` - Nodes with updated positions

### `applyRecommendedLayout(nodes, edges, diagramType, overrides?)`

Apply recommended layout for a specific diagram type.

**Parameters:**
- `nodes: Node<SysMLNodeData>[]` - The nodes to layout
- `edges: Edge<SysMLEdgeData>[]` - The edges connecting the nodes
- `diagramType: string` - Diagram type (bdd, ibd, requirements, stateMachine, activity, sequence, useCase, package)
- `overrides?: LayoutOptions` - Optional overrides for recommended settings

**Returns:** `Promise<Node<SysMLNodeData>[]>` - Nodes with updated positions

### `recommendedLayouts`

Object containing recommended layout settings for each diagram type.

```typescript
const recommendedLayouts: Record<string, LayoutOptions>
```

## See Also

- **Example:** `examples/automatic-layout.tsx` - Complete working examples
- **ELK Documentation:** https://www.eclipse.org/elk/reference.html
- **React Flow Layout Guide:** https://reactflow.dev/learn/layouting/layouting

---

**Last Updated:** 2025-10-27
**Library Version:** 0.1.0
**ELK Version:** 0.9.x
