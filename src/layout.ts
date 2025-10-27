import ELK, { type ElkNode, type ElkExtendedEdge } from 'elkjs/lib/elk.bundled.js';
import type { Node, Edge } from 'reactflow';
import type {
  SysMLNodeData,
  SysMLEdgeData,
  SysMLEdgeRoute,
  SysMLEdgeRouting,
  SysMLRoutePoint,
  SysMLNodeSpec,
  SysMLRelationshipSpec
} from './types';
import { measureNodeDimensions } from './measurement';
import { createNodesFromSpecs, createEdgesFromRelationships } from './factories';

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
  nodeSpacing: 90,
  layerSpacing: 130,
  fitView: true,
  nodeWidth: 220,
  nodeHeight: 150
};

const elk = new ELK();

type NodeShape = 'rect' | 'ellipse' | 'diamond';

const EDGE_CLEARANCE = 16;

interface NodeGeometry {
  x: number;
  y: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  kind?: string;
  shape: NodeShape;
}

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

export interface NodeDimensionMap {
  [id: string]: { width: number; height: number };
}

export async function applyLayout(
  nodes: Node<SysMLNodeData>[],
  edges: Edge<SysMLEdgeData>[],
  options: LayoutOptions = {},
  nodeDimensions?: NodeDimensionMap
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
      width: nodeDimensions?.[node.id]?.width ?? opts.nodeWidth,
      height: nodeDimensions?.[node.id]?.height ?? opts.nodeHeight
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

  const kindMap = new Map<string, string>();
  nodes.forEach((node) => {
    kindMap.set(node.id, node.data.kind);
  });

  const geometryMap = new Map<string, NodeGeometry>();
  collectNodeGeometry(layoutedGraph, geometryMap, nodeDimensions, kindMap, opts);

  const routedEdges = extractEdgeRoutes(layoutedGraph, edgeRoutingModes, geometryMap);

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
    if (route && edge.data && route.routing === 'spline') {
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
        'elk.force.attraction': '0.1',
        'elk.force.randomSeed': '42'
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
  routingModes: Map<string, SysMLEdgeRouting>,
  geometry: Map<string, NodeGeometry>
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
      const sourceId = edge.sources?.[0];
      const targetId = edge.targets?.[0];
      const sourceGeom = sourceId ? geometry.get(sourceId) : undefined;
      const targetGeom = targetId ? geometry.get(targetId) : undefined;
      const adjustedPoints = adjustRoutePoints(points, sourceGeom, targetGeom, routing);
      routes.set(edge.id, { points: adjustedPoints, routing });
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

function adjustRoutePoints(
  points: SysMLRoutePoint[],
  source: NodeGeometry | undefined,
  target: NodeGeometry | undefined,
  routing: SysMLEdgeRouting
): SysMLRoutePoint[] {
  const adjusted = points.map((pt) => ({ ...pt }));

  if (source && adjusted.length >= 2 && !shouldSkipProjection(source.kind)) {
    adjusted[0] = applyClearance(
      projectToBoundary(adjusted[0], adjusted[1], source),
      adjusted[1],
      routing,
      true
    );
  }

  if (target && adjusted.length >= 2 && !shouldSkipProjection(target.kind)) {
    const lastIndex = adjusted.length - 1;
    adjusted[lastIndex] = applyClearance(
      projectToBoundary(adjusted[lastIndex], adjusted[lastIndex - 1], target),
      adjusted[lastIndex - 1],
      routing,
      false
    );
  }

  return adjusted;
}

function shouldSkipProjection(kind?: string): boolean {
  return false;
}

function projectToBoundary(
  boundaryPoint: SysMLRoutePoint,
  referencePoint: SysMLRoutePoint,
  geom: NodeGeometry
): SysMLRoutePoint {
  switch (geom.shape) {
    case 'ellipse':
      return projectToEllipse(boundaryPoint, referencePoint, geom);
    case 'diamond':
      return projectToDiamond(boundaryPoint, referencePoint, geom);
    default:
      return projectToRectangle(boundaryPoint, referencePoint, geom);
  }
}

function getNodeShape(kind?: string): NodeShape {
  if (!kind) {
    return 'rect';
  }
  if (kind === 'use-case-definition' || kind === 'use-case-usage') {
    return 'ellipse';
  }
  if (kind === 'activity-control') {
    return 'diamond';
  }
  return 'rect';
}

function projectToRectangle(
  boundaryPoint: SysMLRoutePoint,
  referencePoint: SysMLRoutePoint,
  geom: NodeGeometry
): SysMLRoutePoint {
  const { centerX, centerY, x, y, width, height } = geom;
  let dx = boundaryPoint.x - centerX;
  let dy = boundaryPoint.y - centerY;

  if (dx === 0 && dy === 0) {
    dx = referencePoint.x - centerX;
    dy = referencePoint.y - centerY;
  }

  if (dx === 0 && dy === 0) {
    return { x: centerX, y: centerY };
  }

  const left = x;
  const right = x + width;
  const top = y;
  const bottom = y + height;

  const candidates: number[] = [];

  if (dx > 0) {
    candidates.push((right - centerX) / dx);
  } else if (dx < 0) {
    candidates.push((left - centerX) / dx);
  }

  if (dy > 0) {
    candidates.push((bottom - centerY) / dy);
  } else if (dy < 0) {
    candidates.push((top - centerY) / dy);
  }

  const positiveCandidates = candidates.filter((t) => t > 0);
  const t = positiveCandidates.length > 0 ? Math.min(...positiveCandidates) : 1;

  return {
    x: centerX + dx * t,
    y: centerY + dy * t
  };
}

function projectToEllipse(
  boundaryPoint: SysMLRoutePoint,
  referencePoint: SysMLRoutePoint,
  geom: NodeGeometry
): SysMLRoutePoint {
  const { centerX, centerY, width, height } = geom;
  const rx = width / 2;
  const ry = height / 2;

  let dx = boundaryPoint.x - centerX;
  let dy = boundaryPoint.y - centerY;

  if (dx === 0 && dy === 0) {
    dx = referencePoint.x - centerX;
    dy = referencePoint.y - centerY;
  }

  if (dx === 0 && dy === 0) {
    return { x: centerX, y: centerY };
  }

  const length = Math.hypot(dx / rx, dy / ry);
  if (length === 0) {
    return { x: centerX, y: centerY };
  }

  return {
    x: centerX + (dx / length),
    y: centerY + (dy / length)
  };
}

function projectToDiamond(
  boundaryPoint: SysMLRoutePoint,
  referencePoint: SysMLRoutePoint,
  geom: NodeGeometry
): SysMLRoutePoint {
  const { centerX, centerY, width, height } = geom;
  const dx = boundaryPoint.x - centerX;
  const dy = boundaryPoint.y - centerY;

  if (dx === 0 && dy === 0) {
    return referencePoint;
  }

  const halfWidth = width / 2;
  const halfHeight = height / 2;

  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);

  const scale = (absDx / halfWidth) + (absDy / halfHeight);
  if (scale === 0) {
    return { x: centerX, y: centerY };
  }

  return {
    x: centerX + (dx / scale),
    y: centerY + (dy / scale)
  };
}

function applyClearance(
  projected: SysMLRoutePoint,
  neighbor: SysMLRoutePoint,
  routing: SysMLEdgeRouting,
  fromSource: boolean
): SysMLRoutePoint {
  const clearance = routing === 'spline' ? EDGE_CLEARANCE : 0;
  if (clearance === 0) {
    return projected;
  }

  const vectorX = neighbor.x - projected.x;
  const vectorY = neighbor.y - projected.y;
  const length = Math.hypot(vectorX, vectorY);

  if (length === 0) {
    return projected;
  }

  const factor = clearance / length;
  const adjustmentX = vectorX * factor;
  const adjustmentY = vectorY * factor;

  if (fromSource) {
    return { x: projected.x + adjustmentX, y: projected.y + adjustmentY };
  }
  return { x: projected.x - adjustmentX, y: projected.y - adjustmentY };
}

function collectNodeGeometry(
  graph: ElkNode,
  geometry: Map<string, NodeGeometry>,
  dimensions: NodeDimensionMap | undefined,
  kinds: Map<string, string>,
  opts: Required<LayoutOptions>
): void {
  graph.children?.forEach((child) => {
    const width = dimensions?.[child.id]?.width ?? child.width ?? opts.nodeWidth;
    const height = dimensions?.[child.id]?.height ?? child.height ?? opts.nodeHeight;
    const x = child.x ?? 0;
    const y = child.y ?? 0;
    const kind = kinds.get(child.id);

    geometry.set(child.id, {
      x,
      y,
      width,
      height,
      centerX: x + width / 2,
      centerY: y + height / 2,
      kind,
      shape: getNodeShape(kind)
    });

    collectNodeGeometry(child, geometry, dimensions, kinds, opts);
  });
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
    nodeSpacing: 120,
    layerSpacing: 160
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
    nodeSpacing: 110,
    layerSpacing: 150
  },

  /**
   * State Machine Diagram
   * Force-directed layout for state transitions
   */
  stateMachine: {
    algorithm: 'force',
    nodeSpacing: 110,
    layerSpacing: 110
  },

  /**
   * Activity Diagram
   * Hierarchical flow layout
   */
  activity: {
    algorithm: 'layered',
    direction: 'DOWN',
    nodeSpacing: 100,
    layerSpacing: 130
  },

  /**
   * Sequence Diagram
   * Custom vertical lifeline layout
   */
  sequence: {
    algorithm: 'sequence',
    nodeSpacing: 300,
    layerSpacing: 110,
    nodeWidth: 200,
    nodeHeight: 100
  },

  /**
   * Use Case Diagram
   * Force-directed layout for actor-use case relationships
   */
  useCase: {
    algorithm: 'force',
    nodeSpacing: 140,
    layerSpacing: 140
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

export interface LayoutPipelineOptions extends LayoutOptions {
  measure?: boolean;
}

export async function layoutAndRoute(
  nodes: Node<SysMLNodeData>[],
  edges: Edge<SysMLEdgeData>[],
  options: LayoutPipelineOptions = {}
): Promise<LayoutResult> {
  const { measure = true, ...layoutOptions } = options;
  let nodeDimensions: NodeDimensionMap | undefined;

  if (measure) {
    nodeDimensions = await measureNodeDimensions(nodes);
  }

  return applyLayout(nodes, edges, layoutOptions, nodeDimensions);
}

export async function layoutAndRouteFromSpecs(
  specs: SysMLNodeSpec[],
  relationships: SysMLRelationshipSpec[],
  diagramType: keyof typeof recommendedLayouts,
  options: LayoutPipelineOptions = {}
): Promise<LayoutResult> {
  const nodes = createNodesFromSpecs(specs);
  const edges = createEdgesFromRelationships(relationships);
  const base = recommendedLayouts[diagramType];
  const { measure = true, ...overrides } = options;
  return layoutAndRoute(nodes, edges, { ...base, ...overrides, measure });
}
