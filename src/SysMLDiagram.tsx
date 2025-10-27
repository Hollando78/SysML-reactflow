import { memo, type ComponentProps } from 'react';
import ReactFlow, { Background, ConnectionMode, Controls, MiniMap } from 'reactflow';

import { sysmlEdgeTypes, SysMLEdgeMarkersComponent } from './edges';
import { sysmlNodeTypes } from './nodes';
import { realizeViewpoint } from './viewpoints';
import type { SysMLReactFlowEdge, SysMLReactFlowNode } from './types';
import type { SysMLModel, SysMLViewpoint, ViewMaterializationOptions } from './viewpoints';

type BaseReactFlowProps = ComponentProps<typeof ReactFlow>;

export interface SysMLDiagramProps
  extends Omit<BaseReactFlowProps, 'nodeTypes' | 'edgeTypes' | 'nodes' | 'edges'> {
  nodes?: SysMLReactFlowNode[];
  edges?: SysMLReactFlowEdge[];
  model?: SysMLModel;
  viewpoint?: SysMLViewpoint;
  viewOptions?: ViewMaterializationOptions;
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
    model,
    viewpoint,
    viewOptions,
    showControls = true,
    showMiniMap = true,
    showBackground = true,
    nodeTypes,
    edgeTypes,
    children,
    fitView = true,
    ...rest
  }: SysMLDiagramProps) => {
    let resolvedNodes = nodes;
    let resolvedEdges = edges;
    const { connectionMode, ...reactFlowProps } = rest;

    if (model && viewpoint) {
      const view = realizeViewpoint(model, viewpoint, viewOptions);
      resolvedNodes = view.nodes;
      resolvedEdges = view.edges;
    }

    if (!resolvedNodes || !resolvedEdges) {
      throw new Error('SysMLDiagram requires nodes/edges or a model+viewpoint combination.');
    }

    return (
      <ReactFlow
        {...reactFlowProps}
        connectionMode={connectionMode ?? ConnectionMode.Loose}
        fitView={fitView}
        nodes={resolvedNodes}
        edges={resolvedEdges}
        nodeTypes={{ ...sysmlNodeTypes, ...(nodeTypes ?? {}) }}
        edgeTypes={{ ...sysmlEdgeTypes, ...(edgeTypes ?? {}) }}
      >
        <SysMLEdgeMarkersComponent />
        {showBackground && <Background gap={16} size={1} color="#393939" />}
        {showMiniMap && <MiniMap pannable zoomable />}
        {showControls && <Controls position="bottom-right" />}
        {children}
      </ReactFlow>
    );
  }
);
