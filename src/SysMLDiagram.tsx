import { memo, type ComponentProps } from 'react';
import ReactFlow, { Background, Controls, MiniMap } from 'reactflow';

import { sysmlEdgeTypes } from './edges';
import { sysmlNodeTypes } from './nodes';
import type { SysMLReactFlowEdge, SysMLReactFlowNode } from './types';

type BaseReactFlowProps = ComponentProps<typeof ReactFlow>;

export interface SysMLDiagramProps
  extends Omit<BaseReactFlowProps, 'nodeTypes' | 'edgeTypes' | 'nodes' | 'edges'> {
  nodes: SysMLReactFlowNode[];
  edges: SysMLReactFlowEdge[];
  nodeTypes?: BaseReactFlowProps['nodeTypes'];
  edgeTypes?: BaseReactFlowProps['edgeTypes'];
  showControls?: boolean;
  showMiniMap?: boolean;
  showBackground?: boolean;
}

export const SysMLDiagram = memo(
  ({
    nodes,
    edges,
    showControls = true,
    showMiniMap = true,
    showBackground = true,
    nodeTypes,
    edgeTypes,
    children,
    fitView = true,
    ...rest
  }: SysMLDiagramProps) => (
    <ReactFlow
      {...rest}
      fitView={fitView}
      nodes={nodes}
      edges={edges}
      nodeTypes={{ ...sysmlNodeTypes, ...(nodeTypes ?? {}) }}
      edgeTypes={{ ...sysmlEdgeTypes, ...(edgeTypes ?? {}) }}
    >
      {showBackground && <Background gap={16} size={1} color="#393939" />}
      {showMiniMap && <MiniMap pannable zoomable />}
      {showControls && <Controls position="bottom-right" />}
      {children}
    </ReactFlow>
  )
);
