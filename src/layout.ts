import ELK, { type ElkNode, type ElkExtendedEdge } from 'elkjs/lib/elk.bundled.js';
import type { Node, Edge } from 'reactflow';
import type {
  SysMLNodeData,
  SysMLEdgeData,
  SysMLEdgeRoute,
  SysMLEdgeRouting,
  SysMLRoutePoint
} from './types';

/**
 * Layout algorithm types supported for SysML diagrams
 */
export type LayoutAlgorithm =
  | 'layered'      // Hierarchical/layered layout (best for BDD, requirements, packages)
  | 'force'        // Force-directed layout (best for activity, state machines)
  | 'mrtree'       // Multi-root tree layout (best for hierarchies)
  | 'box'          // Orthogonal box layout (best for IBD)
  | 'sequence';    // Custom sequence diagram layout (vertical lifelines)

/**
 * Layout direction for hierarchical layouts
 */
export type LayoutDirection = 'DOWN' | 'UP' | 'RIGHT' | 'LEFT';

/**
 * Layout options for automatic graph layout
 */
export interface LayoutOptions {
  /**
   * Layout algorithm to use
   * @default 'layered'
   */
  algorithm?: LayoutAlgorithm;

  /**
   * Direction for hierarchical layouts
   * @default 'DOWN'
   */
  direction?: LayoutDirection;

  /**
   * Spacing between nodes
   * @default 80
   */
  nodeSpacing?: number;

  /**
   * Spacing between layers/ranks
   * @default 100
   */
  layerSpacing?: number;

  /**
   * Whether to fit the diagram to the viewport after layout
   * @default true
   */
  fitView?: boolean;

  /**
   * Node width (used for layout calculation)
   * @default 250
   */
  nodeWidth?: number;

  /**
   * Node height (used for layout calculation)
   * @default 150
   */
  nodeHeight?: number;
}

const defaultOptions: Required<LayoutOptions> = {
  algorithm: 'layered',
  direction: 'DOWN',
  nodeSpacing: 80,
  layerSpacing: 100,
  fitView: true,
  nodeWidth: 220,
  nodeHeight: 150
};

const elk = new ELK();

/**
 * Apply automatic layout to a set of React Flow nodes and edges
 *
 * @param nodes - The nodes to layout
 * @param edges - The edges connecting the nodes
 * @param options - Layout options
 * @returns Promise resolving to nodes with updated positions
 *
 * @example
 * ```typescript
 * const nodes = createNodesFromSpecs([...]);
 * const edges = createEdgesFromRelationships([...]);
 *
 * // Apply layered layout (good for requirements, BDD)
 * const { nodes: layoutedNodes, edges: layoutedEdges } = await applyLayout(nodes, edges, {
 *   algorithm: 'layered',
 *   direction: 'DOWN'
 * });
 *
 * <SysMLDiagram nodes={layoutedNodes} edges={layoutedEdges} />
 * ```
 */
export interface LayoutResult {
  nodes: Node<SysMLNodeData>[];
  edges: Edge<SysMLEdgeData>[];
}

export async function applyLayout(
  nodes: Node<SysMLNodeData>[],
  edges: Edge<SysMLEdgeData>[],
  options: LayoutOptions = {}
): Promise<LayoutResult> {
  const opts = { ...defaultOptions, ...options };

  // Special case: sequence diagram layout
  if (opts.algorithm === 'sequence') {
    return applySequenceLayout(nodes, edges, opts);
  }

  const edgeRoutingModes = new Map<string, SysMLEdgeRouting>();

  // Convert React Flow graph to ELK format
  const elkGraph: ElkNode = {
    id: 'root',
    layoutOptions: getElkOptions(opts),
    children: nodes.map((node) => ({
      id: node.id,
      width: opts.nodeWidth,
      height: opts.nodeHeight
    })),
    edges: edges.map((edge) => {
      const routing = getRoutingModeForEdge(edge);
      edgeRoutingModes.set(edge.id, routing);
      return {
        id: edge.id,
        sources: [edge.source],
        targets: [edge.target],
        layoutOptions: {
          'elk.edgeRouting': routing === 'spline' ? 'SPLINE' : 'ORTHOGONAL',
          'elk.layered.edgeRouting': routing === 'spline' ? 'SPLINE' : 'ORTHOGONAL'
        }
      } satisfies ElkExtendedEdge;
    })
  };

  // Run ELK layout
  const layoutedGraph = await elk.layout(elkGraph);

  const routedEdges = extractEdgeRoutes(layoutedGraph, edgeRoutingModes);

  // Apply positions back to React Flow nodes
  const layoutedNodes = nodes.map((node) => {
    const elkNode = layoutedGraph.children?.find((n) => n.id === node.id);
    if (elkNode?.x !== undefined && elkNode?.y !== undefined) {
      return {
        ...node,
        position: { x: elkNode.x, y: elkNode.y }
      };
    }
    return node;
  });

  const layoutedEdges = edges.map((edge) => {
    const route = routedEdges.get(edge.id);
    if (route && edge.data) {
      return {
        ...edge,
        data: {
          ...edge.data,
          route
        }
      };
    }
    return edge;
  });

  return { nodes: layoutedNodes, edges: layoutedEdges };
}

/**
 * Get ELK layout options based on algorithm and settings
 */
function getElkOptions(opts: Required<LayoutOptions>): Record<string, string> {
  const baseOptions: Record<string, string> = {
    'elk.spacing.nodeNode': String(opts.nodeSpacing),
    'elk.layered.spacing.nodeNodeBetweenLayers': String(opts.layerSpacing),
    'elk.spacing.edgeNode': String(opts.nodeSpacing / 2),
    'elk.spacing.edgeEdge': String(opts.nodeSpacing / 4)
  };

  switch (opts.algorithm) {
    case 'layered':
      return {
        ...baseOptions,
        'elk.algorithm': 'layered',
        'elk.direction': opts.direction,
        'elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX',
        'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
        'elk.layered.cycleBreaking.strategy': 'GREEDY'
      };

    case 'force':
      return {
        ...baseOptions,
        'elk.algorithm': 'force',
        'elk.force.repulsion': '200.0',
        'elk.force.attraction': '0.1'
      };

    case 'mrtree':
      return {
        ...baseOptions,
        'elk.algorithm': 'mrtree',
        'elk.direction': opts.direction
      };

    case 'box':
      return {
        ...baseOptions,
        'elk.algorithm': 'box',
        'elk.box.packingMode': 'GROUP_DEC'
      };

    default:
      return {
        ...baseOptions,
        'elk.algorithm': 'layered'
      };
  }
}

/**
 * Custom sequence diagram layout
 * Arranges lifelines horizontally with equal spacing
 */
function applySequenceLayout(
  nodes: Node<SysMLNodeData>[],
  edges: Edge<SysMLEdgeData>[],
  opts: Required<LayoutOptions>
): Promise<LayoutResult> {
  // Separate lifelines from other nodes
  const lifelines = nodes.filter((n) => n.data.kind === 'sequence-lifeline');
  const others = nodes.filter((n) => n.data.kind !== 'sequence-lifeline');

  // Layout lifelines horizontally with equal spacing
  const spacing = opts.nodeSpacing + opts.nodeWidth;
  const layoutedLifelines = lifelines.map((node, index) => ({
    ...node,
    position: { x: index * spacing, y: 0 }
  }));

  // Place interaction nodes above lifelines if present
  const layoutedOthers = others.map((node) => {
    if (node.data.kind === 'interaction') {
      // Center above lifelines
      const centerX = ((lifelines.length - 1) * spacing) / 2;
      return {
        ...node,
        position: { x: centerX - opts.nodeWidth / 2, y: -opts.nodeHeight - opts.layerSpacing }
      };
    }
    return node;
  });

  return Promise.resolve({
    nodes: [...layoutedLifelines, ...layoutedOthers],
    edges
  });
}

const structuralEdgeKinds = new Set<string>([
  'composition',
  'aggregation',
  'association',
  'specialization',
  'conjugation',
  'feature-typing',
  'feature-membership',
  'owning-membership',
  'variant-membership',
  'type-featuring',
  'feature-chaining',
  'binding-connector'
]);

function getRoutingModeForEdge(edge: Edge<SysMLEdgeData>): SysMLEdgeRouting {
  const kind = edge.data?.kind;
  if (!kind) {
    return 'spline';
  }
  return structuralEdgeKinds.has(kind) ? 'orthogonal' : 'spline';
}

function extractEdgeRoutes(
  graph: ElkNode,
  routingModes: Map<string, SysMLEdgeRouting>
): Map<string, SysMLEdgeRoute> {
  const routes = new Map<string, SysMLEdgeRoute>();
  const elkEdges = collectEdges(graph);

  elkEdges.forEach((edge) => {
    const sections = edge.sections ?? [];
    if (sections.length === 0) {
      return;
    }

    const points: SysMLRoutePoint[] = [];

    sections.forEach((section) => {
      pushPoint(points, section.startPoint);
      section.bendPoints?.forEach((bend) => pushPoint(points, bend));
      pushPoint(points, section.endPoint);
    });

    if (points.length >= 2) {
      const routing = routingModes.get(edge.id) ?? 'spline';
      routes.set(edge.id, { points, routing });
    }
  });

  return routes;
}

function collectEdges(node: ElkNode): ElkExtendedEdge[] {
  const edges: ElkExtendedEdge[] = [...((node.edges ?? []) as ElkExtendedEdge[])];
  node.children?.forEach((child) => {
    edges.push(...collectEdges(child));
  });
  return edges;
}

function pushPoint(points: SysMLRoutePoint[], point?: { x: number; y: number } | null) {
  if (!point) {
    return;
  }
  const last = points[points.length - 1];
  if (!last || last.x !== point.x || last.y !== point.y) {
    points.push({ x: point.x, y: point.y });
  }
}

/**
 * Recommended layout algorithms for different SysML diagram types
 */
export const recommendedLayouts: Record<string, LayoutOptions> = {
  /**
   * Block Definition Diagram (BDD)
   * Hierarchical structure showing definitions and specializations
   */
  bdd: {
    algorithm: 'layered',
    direction: 'DOWN',
    nodeSpacing: 100,
    layerSpacing: 120
  },

  /**
   * Internal Block Diagram (IBD)
   * Orthogonal layout showing part compositions and connections
   */
  ibd: {
    algorithm: 'box',
    nodeSpacing: 80,
    layerSpacing: 80
  },

  /**
   * Requirement Diagram
   * Hierarchical structure showing requirement relationships
   */
  requirements: {
    algorithm: 'layered',
    direction: 'DOWN',
    nodeSpacing: 90,
    layerSpacing: 110
  },

  /**
   * State Machine Diagram
   * Force-directed layout for state transitions
   */
  stateMachine: {
    algorithm: 'force',
    nodeSpacing: 120,
    layerSpacing: 120
  },

  /**
   * Activity Diagram
   * Hierarchical flow layout
   */
  activity: {
    algorithm: 'layered',
    direction: 'DOWN',
    nodeSpacing: 70,
    layerSpacing: 90
  },

  /**
   * Sequence Diagram
   * Custom vertical lifeline layout
   */
  sequence: {
    algorithm: 'sequence',
    nodeSpacing: 280,
    layerSpacing: 100,
    nodeWidth: 200,
    nodeHeight: 100
  },

  /**
   * Use Case Diagram
   * Force-directed layout for actor-use case relationships
   */
  useCase: {
    algorithm: 'force',
    nodeSpacing: 150,
    layerSpacing: 150
  },

  /**
   * Package Diagram
   * Hierarchical tree layout for package containment
   */
  package: {
    algorithm: 'mrtree',
    direction: 'DOWN',
    nodeSpacing: 100,
    layerSpacing: 120
  }
};

/**
 * Apply layout with recommended settings for a specific diagram type
 *
 * @param nodes - The nodes to layout
 * @param edges - The edges connecting the nodes
 * @param diagramType - Type of SysML diagram
 * @param overrides - Optional overrides for recommended settings
 * @returns Promise resolving to nodes with updated positions
 *
 * @example
 * ```typescript
 * // Apply recommended layout for a requirement diagram
 * const layoutedNodes = await applyRecommendedLayout(
 *   nodes,
 *   edges,
 *   'requirements'
 * );
 * ```
 */
export async function applyRecommendedLayout(
  nodes: Node<SysMLNodeData>[],
  edges: Edge<SysMLEdgeData>[],
  diagramType: keyof typeof recommendedLayouts,
  overrides: LayoutOptions = {}
): Promise<LayoutResult> {
  const recommended = recommendedLayouts[diagramType];
  return applyLayout(nodes, edges, { ...recommended, ...overrides });
}
