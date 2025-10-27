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
      // Additional delay to ensure font metrics are applied
      await new Promise(resolve => setTimeout(resolve, 50));
    } catch {
      // Ignore font loading errors, fall back to current metrics
    }
  }

  // Clone nodes so React Flow measurement does not mutate caller state
  // Spread nodes apart to avoid overlap during measurement
  const measurementNodes: SysMLReactFlowNode[] = nodes.map((node, index) => ({
    ...node,
    position: { x: (index % 5) * 300, y: Math.floor(index / 5) * 200 },
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
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
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
            // Force reflow to ensure layout is complete
            container.offsetHeight;

            // Additional delay to ensure all rendering is complete
            setTimeout(() => {
              const map: MeasuredNodeMap = {};

              nodes.forEach((node) => {
                const selector = `[data-id="${CSS_ESCAPE(node.id)}"]`;
                const el = container.querySelector(selector);
                if (el instanceof HTMLElement) {
                  // Force reflow on each element
                  el.offsetHeight;
                  const rect = el.getBoundingClientRect();
                  map[node.id] = { width: rect.width, height: rect.height };
                }
              });

              resolve(map);
            }, 50);
          });
        });
      });
    });
  });

  root.unmount();
  container.remove();

  return dimensions;
}
