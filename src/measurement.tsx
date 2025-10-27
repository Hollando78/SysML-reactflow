import { createRoot } from 'react-dom/client';
import React, { StrictMode } from 'react';
import ReactFlow, { ReactFlowProvider } from 'reactflow';

import { sysmlNodeTypes } from './nodes';
import { sysmlEdgeTypes } from './edges';
import type { SysMLReactFlowNode, SysMLReactFlowEdge } from './types';

export interface MeasuredNodeDimension {
  width: number;
  height: number;
}

export type MeasuredNodeMap = Record<string, MeasuredNodeDimension>;

const noopEdges: SysMLReactFlowEdge[] = [];

const hasDOM = typeof window !== 'undefined' && typeof document !== 'undefined';

const CSS_ESCAPE =
  typeof window !== 'undefined' && window.CSS && typeof window.CSS.escape === 'function'
    ? window.CSS.escape.bind(window.CSS)
    : (value: string) => value.replace(/([#.;?+*~':"!^$[\]()=>|/@])/g, '\\$1');

export async function measureNodeDimensions(nodes: SysMLReactFlowNode[]): Promise<MeasuredNodeMap> {
  if (!hasDOM || nodes.length === 0) {
    return {};
  }

  const fontSet = (document as unknown as { fonts?: FontFaceSet }).fonts;
  if (fontSet && fontSet.ready) {
    try {
      await fontSet.ready;
    } catch {
      // Ignore font loading errors, fall back to current metrics
    }
  }

  // Clone nodes so React Flow measurement does not mutate caller state
  const measurementNodes: SysMLReactFlowNode[] = nodes.map((node) => ({
    ...node,
    position: node.position ? { ...node.position } : { x: 0, y: 0 },
    data: node.data
  }));

  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-10000px';
  container.style.top = '-10000px';
  container.style.width = '2400px';
  container.style.height = '2400px';
  container.style.pointerEvents = 'none';
  container.style.visibility = 'hidden';
  document.body.appendChild(container);

  const root = createRoot(container);

  root.render(
    <ReactFlowProvider>
      <div style={{ width: 2200, height: 2200 }}>
        <ReactFlow
          nodes={measurementNodes}
          edges={noopEdges}
          nodeTypes={sysmlNodeTypes}
          edgeTypes={sysmlEdgeTypes}
          fitView
          proOptions={{ hideAttribution: true }}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          panOnDrag={false}
          zoomOnScroll={false}
        />
      </div>
    </ReactFlowProvider>
  );

  const dimensions = await new Promise<MeasuredNodeMap>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            const map: MeasuredNodeMap = {};

            nodes.forEach((node) => {
              const selector = `[data-id="${CSS_ESCAPE(node.id)}"]`;
              const el = container.querySelector(selector);
              if (el instanceof HTMLElement) {
                const rect = el.getBoundingClientRect();
                map[node.id] = { width: rect.width, height: rect.height };
              }
            });

            resolve(map);
          });
        });
      });
    });
  });

  root.unmount();
  container.remove();

  return dimensions;
}
