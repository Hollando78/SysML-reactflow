import { memo, type ReactNode } from 'react';
import type { NodeProps, NodeTypes } from 'reactflow';
import { Handle, Position } from 'reactflow';

import type { SysMLCompartment, SysMLNodeData } from './types';

const accentByKind: Record<string, string> = {
  requirement: '#0F62FE',
  'block-definition': '#8A3FFC',
  'internal-block': '#6929C4',
  activity: '#24A148',
  parametric: '#FF832B'
};

const statusColor: Record<NonNullable<SysMLNodeData['status']>, string> = {
  draft: '#8d8d8d',
  reviewed: '#1192e8',
  approved: '#24a148',
  deprecated: '#da1e28'
};

type ChromeProps = {
  data: SysMLNodeData;
  children: ReactNode;
};

const NodeChrome = ({ data, children }: ChromeProps) => {
  const accent = accentByKind[data.kind] ?? '#262626';
  return (
    <div
      style={{
        borderRadius: 6,
        border: `2px solid ${accent}`,
        background: '#151515',
        color: '#f4f4f4',
        fontFamily: '"IBM Plex Sans", system-ui, sans-serif',
        minWidth: 220,
        boxShadow: '0 4px 16px rgba(0,0,0,0.35)'
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 12px',
          borderBottom: '1px solid rgba(244,244,244,0.1)'
        }}
      >
        <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
          {'<<'}
          {data.stereotype ?? data.kind}
          {'>>'}
        </div>
        {data.status && (
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: statusColor[data.status],
              textTransform: 'uppercase'
            }}
          >
            {data.status}
          </div>
        )}
      </div>
      <div style={{ padding: '10px 12px' }}>
        <div style={{ fontSize: 18, fontWeight: 600 }}>{data.name}</div>
        {data.documentation && (
          <p style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>{data.documentation}</p>
        )}
        {children}
      </div>
      {data.tags && data.tags.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 6,
            padding: '6px 12px',
            borderTop: '1px solid rgba(244,244,244,0.1)'
          }}
        >
          {data.tags.map((tag) => (
            <span
              key={tag.key}
              style={{
                fontSize: 11,
                padding: '2px 6px',
                borderRadius: 4,
                background: 'rgba(255,255,255,0.1)'
              }}
            >
              {tag.key}: {tag.value}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

const CompartmentList = ({ compartments }: { compartments?: SysMLCompartment[] }) => {
  if (!compartments || compartments.length === 0) {
    return null;
  }

  return (
    <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {compartments.map((compartment, idx) => (
        <div key={compartment.title ?? idx}>
          {compartment.title && (
            <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 4 }}>{compartment.title}</div>
          )}
          <div style={{ border: '1px solid rgba(244,244,244,0.15)', borderRadius: 4 }}>
            {compartment.items.map((item) => (
              <div
                key={`${item.label}-${item.value}`}
                style={{
                  padding: '4px 8px',
                  borderBottom: '1px solid rgba(244,244,244,0.08)',
                  fontSize: 12,
                  fontWeight: item.emphasis ? 600 : 400
                }}
              >
                {item.value ? (
                  <>
                    <span style={{ opacity: 0.75 }}>{item.label}</span>
                    <span style={{ float: 'right' }}>{item.value}</span>
                  </>
                ) : (
                  item.label
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const RequirementNode = memo((props: NodeProps<SysMLNodeData>) => {
  const { data } = props;
  return (
    <>
      <NodeChrome data={data}>
        <CompartmentList compartments={data.compartments} />
      </NodeChrome>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </>
  );
});

const BlockNode = memo((props: NodeProps<SysMLNodeData>) => {
  const { data } = props;
  return (
    <>
      <NodeChrome data={data}>
        <CompartmentList compartments={data.compartments} />
      </NodeChrome>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </>
  );
});

const ActivityNode = memo((props: NodeProps<SysMLNodeData>) => {
  const { data } = props;
  return (
    <>
      <NodeChrome data={data}>
        {data.emphasis && (
          <div style={{ marginTop: 8, fontSize: 13, fontWeight: 600 }}>{data.emphasis}</div>
        )}
        <CompartmentList compartments={data.compartments} />
      </NodeChrome>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </>
  );
});

const ParametricNode = memo((props: NodeProps<SysMLNodeData>) => {
  const { data } = props;
  return (
    <>
      <NodeChrome data={data}>
        {data.emphasis && (
          <pre
            style={{
              marginTop: 12,
              fontFamily: '"IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
              fontSize: 12,
              padding: 8,
              background: 'rgba(0,0,0,0.4)',
              borderRadius: 4
            }}
          >
            {data.emphasis}
          </pre>
        )}
        <CompartmentList compartments={data.compartments} />
      </NodeChrome>
      <Handle type="source" position={Position.Right} />
      <Handle type="target" position={Position.Left} />
    </>
  );
});

export const sysmlNodeTypes: NodeTypes = {
  'sysml.requirement': RequirementNode,
  'sysml.block': BlockNode,
  'sysml.internal-block': BlockNode,
  'sysml.activity': ActivityNode,
  'sysml.parametric': ParametricNode
};
