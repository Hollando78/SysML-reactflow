import { memo } from 'react';
import type { EdgeProps, EdgeTypes } from 'reactflow';
import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath, getStraightPath } from 'reactflow';

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
  // Type relationships
  specialization: '#78a9ff',
  conjugation: '#d02670',
  'feature-typing': '#fa4d56',
  subsetting: '#ff832b',
  redefinition: '#f1c21b',
  'type-featuring': '#42be65',
  // Structural relationships
  composition: '#161616',
  aggregation: '#525252',
  association: '#8d8d8d',
  // Feature relationships
  featuring: '#6fdc8c',
  'feature-membership': '#08bdba',
  'owned-featuring': '#4589ff'
};

// Edge styles for different SysML relationship types
const getEdgeStyle = (kind?: string) => {
  const color = kind ? edgeColors[kind] ?? '#f4f4f4' : '#f4f4f4';

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
const SysMLEdgeMarkers = () => (
  <svg style={{ position: 'absolute', width: 0, height: 0 }}>
    <defs>
      {/* Filled arrow for directed associations */}
      <marker
        id="arrow-filled"
        viewBox="0 0 10 10"
        refX="9"
        refY="5"
        markerWidth="6"
        markerHeight="6"
        orient="auto"
      >
        <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
      </marker>

      {/* Open arrow for general relationships */}
      <marker
        id="arrow-open"
        viewBox="0 0 10 10"
        refX="9"
        refY="5"
        markerWidth="6"
        markerHeight="6"
        orient="auto"
      >
        <path d="M 0 0 L 10 5 L 0 10" fill="none" stroke="currentColor" strokeWidth="1.5" />
      </marker>

      {/* Hollow triangle for specialization/generalization */}
      <marker
        id="arrow-triangle-hollow"
        viewBox="0 0 12 12"
        refX="11"
        refY="6"
        markerWidth="8"
        markerHeight="8"
        orient="auto"
      >
        <path d="M 2 2 L 11 6 L 2 10 z" fill="white" stroke="currentColor" strokeWidth="1.5" />
      </marker>

      {/* Filled diamond for composition */}
      <marker
        id="diamond-filled"
        viewBox="0 0 12 12"
        refX="11"
        refY="6"
        markerWidth="8"
        markerHeight="8"
        orient="auto"
      >
        <path d="M 2 6 L 6 2 L 10 6 L 6 10 z" fill="currentColor" stroke="currentColor" strokeWidth="1.5" />
      </marker>

      {/* Hollow diamond for aggregation */}
      <marker
        id="diamond-hollow"
        viewBox="0 0 12 12"
        refX="11"
        refY="6"
        markerWidth="8"
        markerHeight="8"
        orient="auto"
      >
        <path d="M 2 6 L 6 2 L 10 6 L 6 10 z" fill="white" stroke="currentColor" strokeWidth="1.5" />
      </marker>

      {/* Circle for port connections */}
      <marker
        id="circle"
        viewBox="0 0 10 10"
        refX="5"
        refY="5"
        markerWidth="6"
        markerHeight="6"
        orient="auto"
      >
        <circle cx="5" cy="5" r="3" fill="white" stroke="currentColor" strokeWidth="1.5" />
      </marker>
    </defs>
  </svg>
);

// Get appropriate marker for relationship type
const getMarkerEnd = (kind?: string): string => {
  switch (kind) {
    case 'specialization':
    case 'conjugation':
      return 'url(#arrow-triangle-hollow)';
    case 'composition':
      return 'url(#diamond-filled)';
    case 'aggregation':
      return 'url(#diamond-hollow)';
    case 'feature-typing':
    case 'subsetting':
    case 'redefinition':
      return 'url(#arrow-open)';
    case 'satisfy':
    case 'verify':
    case 'refine':
    case 'allocate':
      return 'url(#arrow-open)';
    case 'dependency':
      return 'url(#arrow-open)';
    case 'association':
    case 'featuring':
      return 'url(#arrow-filled)';
    default:
      return 'url(#arrow-filled)';
  }
};

// Get appropriate path style for relationship type
const getPathType = (kind?: string): 'smooth' | 'straight' => {
  // Use smooth step for structured relationships
  const smoothRelationships = ['composition', 'aggregation', 'association', 'flow-connection'];
  return kind && smoothRelationships.includes(kind) ? 'smooth' : 'straight';
};

const SysMLEdgeComponent = memo((props: EdgeProps<SysMLEdgeData>) => {
  const { id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data } = props;

  const pathType = getPathType(data?.kind);
  const [edgePath, labelX, labelY] = pathType === 'smooth'
    ? getSmoothStepPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
        sourcePosition,
        targetPosition
      })
    : getStraightPath({
        sourceX,
        sourceY,
        targetX,
        targetY
      });

  const style = getEdgeStyle(data?.kind);
  const markerEnd = getMarkerEnd(data?.kind);

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={style}
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
