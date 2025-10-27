import { memo, useCallback } from 'react';
import type { EdgeProps, EdgeTypes, Node } from 'reactflow';
import { BaseEdge, EdgeLabelRenderer, Position, getSmoothStepPath, getStraightPath, useStore } from 'reactflow';

import type { SysMLEdgeData } from './types';

// SysML v2.0 edge colors
const edgeColors: Record<string, string> = {
  // Dependency relationships
  dependency: '#8d8d8d',
  // Requirement relationships
  satisfy: '#0f62fe',
  verify: '#24a148',
  refine: '#ff832b',
  // Allocation
  allocate: '#ee5396',
  // Use case relationships
  include: '#be95ff',
  extend: '#ff7eb6',
  // State machine
  transition: '#33b1ff',
  // Interaction
  message: '#f1c21b',
  // Flow relationships
  'control-flow': '#6fdc8c',
  'flow-connection': '#82cfff',
  'item-flow': '#d4bbff',
  'action-flow': '#a7f0ba',
  succession: '#42be65',
  // Type relationships
  specialization: '#78a9ff',
  conjugation: '#d02670',
  'feature-typing': '#fa4d56',
  subsetting: '#ff832b',
  redefinition: '#f1c21b',
  'type-featuring': '#42be65',
  // Structural relationships
  composition: '#525252',
  aggregation: '#8d8d8d',
  association: '#a8a8a8',
  // Feature relationships
  featuring: '#6fdc8c',
  'feature-membership': '#08bdba',
  'owned-featuring': '#4589ff'
};

// Edge styles for different SysML relationship types
const getEdgeStyle = (kind?: string) => {
  const color = kind ? edgeColors[kind] ?? '#8d8d8d' : '#8d8d8d';

  // Dashed lines for certain relationship types
  const dashedRelationships = ['dependency', 'satisfy', 'verify', 'refine', 'allocate', 'include', 'extend'];
  const strokeDasharray = kind && dashedRelationships.includes(kind) ? '5,5' : undefined;

  return {
    stroke: color,
    strokeWidth: 2,
    strokeDasharray
  };
};

// Custom marker definitions for SysML relationships
// Create color-specific markers for each edge color
const SysMLEdgeMarkers = () => {
  const colors = Object.values(edgeColors);
  const uniqueColors = Array.from(new Set([...colors, '#f4f4f4']));

  return (
    <svg style={{ position: 'absolute', width: 0, height: 0 }}>
      <defs>
        {uniqueColors.map((color) => {
          const colorId = color.replace('#', '');
          return (
            <g key={color}>
              {/* Filled arrow */}
              <marker
                id={`arrow-filled-${colorId}`}
                viewBox="0 0 10 10"
                refX="10"
                refY="5"
                markerWidth="8"
                markerHeight="8"
                orient="auto"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill={color} />
              </marker>

              {/* Open arrow */}
              <marker
                id={`arrow-open-${colorId}`}
                viewBox="0 0 10 10"
                refX="10"
                refY="5"
                markerWidth="8"
                markerHeight="8"
                orient="auto"
              >
                <path d="M 0 0 L 10 5 L 0 10" fill="none" stroke={color} strokeWidth="2" />
              </marker>

              {/* Hollow triangle for specialization/generalization */}
              <marker
                id={`arrow-triangle-hollow-${colorId}`}
                viewBox="0 0 12 12"
                refX="12"
                refY="6"
                markerWidth="10"
                markerHeight="10"
                orient="auto"
              >
                <path d="M 2 2 L 11 6 L 2 10 z" fill="white" stroke={color} strokeWidth="2" />
              </marker>

              {/* Filled diamond for composition (at source) */}
              <marker
                id={`diamond-filled-${colorId}`}
                viewBox="0 0 16 16"
                refX="2"
                refY="8"
                markerWidth="10"
                markerHeight="10"
                orient="auto"
              >
                <path d="M 2 8 L 8 2 L 14 8 L 8 14 z" fill={color} stroke={color} strokeWidth="2" />
              </marker>

              {/* Hollow diamond for aggregation (at source) */}
              <marker
                id={`diamond-hollow-${colorId}`}
                viewBox="0 0 16 16"
                refX="2"
                refY="8"
                markerWidth="10"
                markerHeight="10"
                orient="auto"
              >
                <path d="M 2 8 L 8 2 L 14 8 L 8 14 z" fill="white" stroke={color} strokeWidth="2" />
              </marker>

              {/* Circle for port connections */}
              <marker
                id={`circle-${colorId}`}
                viewBox="0 0 10 10"
                refX="5"
                refY="5"
                markerWidth="8"
                markerHeight="8"
                orient="auto"
              >
                <circle cx="5" cy="5" r="3" fill="white" stroke={color} strokeWidth="2" />
              </marker>
            </g>
          );
        })}
      </defs>
    </svg>
  );
};

// Get appropriate marker for START (source) of relationship
const getMarkerStart = (kind?: string): string | undefined => {
  const color = kind ? edgeColors[kind] ?? '#8d8d8d' : '#8d8d8d';
  const colorId = color.replace('#', '');

  switch (kind) {
    case 'composition':
      return `url(#diamond-filled-${colorId})`;
    case 'aggregation':
      return `url(#diamond-hollow-${colorId})`;
    default:
      return undefined;
  }
};

// Get appropriate marker for END (target) of relationship
const getMarkerEnd = (kind?: string): string | undefined => {
  const color = kind ? edgeColors[kind] ?? '#8d8d8d' : '#8d8d8d';
  const colorId = color.replace('#', '');

  switch (kind) {
    case 'specialization':
    case 'conjugation':
      return `url(#arrow-triangle-hollow-${colorId})`;
    case 'composition':
    case 'aggregation':
      // Diamonds are at the start (source), not end
      return undefined;
    case 'feature-typing':
    case 'subsetting':
    case 'redefinition':
      return `url(#arrow-open-${colorId})`;
    case 'satisfy':
    case 'verify':
    case 'refine':
    case 'allocate':
      return `url(#arrow-open-${colorId})`;
    case 'dependency':
      return `url(#arrow-open-${colorId})`;
    case 'association':
    case 'featuring':
      return `url(#arrow-filled-${colorId})`;
    default:
      return `url(#arrow-filled-${colorId})`;
  }
};

// Get appropriate path style for relationship type
const getPathType = (kind?: string): 'smooth' | 'straight' => {
  // Use smooth step for structured relationships
  const smoothRelationships = ['composition', 'aggregation', 'association', 'flow-connection', 'connection', 'featuring'];
  return kind && smoothRelationships.includes(kind) ? 'smooth' : 'straight';
};

interface NodeGeometry {
  center: { x: number; y: number };
  anchors: Record<Position, { x: number; y: number }>;
}

const buildGeometry = (
  node: Node | undefined,
  fallbackX: number,
  fallbackY: number
): NodeGeometry => {
  if (!node || node.width == null || node.height == null || !node.positionAbsolute) {
    return {
      center: { x: fallbackX, y: fallbackY },
      anchors: {
        [Position.Top]: { x: fallbackX, y: fallbackY },
        [Position.Right]: { x: fallbackX, y: fallbackY },
        [Position.Bottom]: { x: fallbackX, y: fallbackY },
        [Position.Left]: { x: fallbackX, y: fallbackY }
      }
    };
  }

  const { positionAbsolute, width, height } = node;
  const center = {
    x: positionAbsolute.x + width / 2,
    y: positionAbsolute.y + height / 2
  };

  return {
    center,
    anchors: {
      [Position.Top]: { x: center.x, y: positionAbsolute.y },
      [Position.Right]: { x: positionAbsolute.x + width, y: center.y },
      [Position.Bottom]: { x: center.x, y: positionAbsolute.y + height },
      [Position.Left]: { x: positionAbsolute.x, y: center.y }
    }
  };
};

const SysMLEdgeComponent = memo((props: EdgeProps<SysMLEdgeData>) => {
  const { id, source, target, sourceX, sourceY, targetX, targetY, data } = props;

  const sourceNode = useStore(
    useCallback((state) => state.nodeInternals.get(source), [source])
  );
  const targetNode = useStore(
    useCallback((state) => state.nodeInternals.get(target), [target])
  );

  const sourceGeometry = buildGeometry(sourceNode, sourceX, sourceY);
  const targetGeometry = buildGeometry(targetNode, targetX, targetY);

  const dx = targetGeometry.center.x - sourceGeometry.center.x;
  const dy = targetGeometry.center.y - sourceGeometry.center.y;
  const horizontalDominant = Math.abs(dx) >= Math.abs(dy);

  const sourceSide = horizontalDominant
    ? dx >= 0
      ? Position.Right
      : Position.Left
    : dy >= 0
      ? Position.Bottom
      : Position.Top;

  const targetSide = horizontalDominant
    ? dx >= 0
      ? Position.Left
      : Position.Right
    : dy >= 0
      ? Position.Top
      : Position.Bottom;

  const sourceAnchor = sourceGeometry.anchors[sourceSide] ?? { x: sourceX, y: sourceY };
  const targetAnchor = targetGeometry.anchors[targetSide] ?? { x: targetX, y: targetY };

  const pathType = getPathType(data?.kind);

  // Use appropriate path based on relationship type
  const [edgePath, labelX, labelY] = pathType === 'smooth'
    ? getSmoothStepPath({
        sourceX: sourceAnchor.x,
        sourceY: sourceAnchor.y,
        targetX: targetAnchor.x,
        targetY: targetAnchor.y,
        sourcePosition: sourceSide,
        targetPosition: targetSide,
        borderRadius: 8
      })
    : getStraightPath({
        sourceX: sourceAnchor.x,
        sourceY: sourceAnchor.y,
        targetX: targetAnchor.x,
        targetY: targetAnchor.y
      });

  const style = getEdgeStyle(data?.kind);
  const markerStart = getMarkerStart(data?.kind);
  const markerEnd = getMarkerEnd(data?.kind);

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={style}
        markerStart={markerStart}
        markerEnd={markerEnd}
      />
      {data?.label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              background: 'rgba(22, 22, 22, 0.95)',
              color: '#f4f4f4',
              padding: '4px 8px',
              borderRadius: 4,
              fontSize: 11,
              border: `1px solid ${style.stroke}`,
              pointerEvents: 'all',
              whiteSpace: 'nowrap'
            }}
            className="sysml-edge-label"
          >
            <div style={{ fontWeight: 600 }}>{data.label}</div>
            {data.trigger && (
              <div style={{ fontSize: 10, color: '#c6c6c6' }}>
                trigger: {data.trigger}
              </div>
            )}
            {data.guard && (
              <div style={{ fontSize: 10, fontStyle: 'italic', color: '#f1c21b' }}>
                [{data.guard}]
              </div>
            )}
            {data.effect && (
              <div style={{ fontSize: 10, color: '#82cfff' }}>
                / {data.effect}
              </div>
            )}
            {data.rationale && (
              <div style={{ fontSize: 10, color: '#8d8d8d', fontStyle: 'italic' }}>
                {data.rationale}
              </div>
            )}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
});

SysMLEdgeComponent.displayName = 'SysMLEdge';

export const SysMLEdgeMarkersComponent = SysMLEdgeMarkers;

export const sysmlEdgeTypes: EdgeTypes = {
  'sysml.relationship': SysMLEdgeComponent
};
