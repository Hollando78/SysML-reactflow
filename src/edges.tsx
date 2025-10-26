import { memo } from 'react';
import type { EdgeProps, EdgeTypes } from 'reactflow';
import { BaseEdge, EdgeLabelRenderer, getBezierPath } from 'reactflow';

import type { SysMLEdgeData } from './types';

const edgeColors: Record<string, string> = {
  dependency: '#8d8d8d',
  satisfy: '#0f62fe',
  verify: '#24a148',
  allocate: '#ee5396',
  refine: '#ff832b',
  include: '#be95ff',
  extend: '#ff7eb6',
  transition: '#33b1ff',
  message: '#f1c21b',
  'control-flow': '#6fdc8c'
};

const SysMLEdgeComponent = memo((props: EdgeProps<SysMLEdgeData>) => {
  const { id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, markerEnd, data } = props;
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition
  });
  const color = data?.kind ? edgeColors[data.kind] ?? '#f4f4f4' : '#f4f4f4';

  return (
    <>
      <BaseEdge id={id} path={edgePath} style={{ stroke: color, strokeWidth: 2 }} markerEnd={markerEnd} />
      {data?.label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              background: '#161616',
              color: '#f4f4f4',
              padding: '4px 8px',
              borderRadius: 4,
              fontSize: 11,
              border: `1px solid ${color}`
            }}
          >
            <div style={{ fontWeight: 600 }}>{data.label}</div>
            {data.trigger && <div style={{ fontSize: 10 }}>{data.trigger}</div>}
            {data.guard && (
              <div style={{ fontSize: 10, fontStyle: 'italic' }}>[{data.guard}]</div>
            )}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
});

export const sysmlEdgeTypes: EdgeTypes = {
  'sysml.relationship': SysMLEdgeComponent
};
