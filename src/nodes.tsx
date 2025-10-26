import { memo, type ReactNode } from 'react';
import type { NodeProps, NodeTypes } from 'reactflow';
import { Handle, Position } from 'reactflow';

import type { SysMLCompartment, SysMLNodeData } from './types';

const accentByKind: Record<string, string> = {
  requirement: '#0F62FE',
  'block-definition': '#8A3FFC',
  'internal-block': '#6929C4',
  activity: '#24A148',
  parametric: '#FF832B',
  'use-case': '#FFB000',
  state: '#33B1FF',
  'state-machine': '#3DDBD9',
  'sequence-lifeline': '#F1C21B'
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

const UseCaseNode = memo((props: NodeProps<SysMLNodeData>) => {
  const { data } = props;
  const accent = accentByKind['use-case'];
  return (
    <>
      <div
        style={{
          width: 220,
          height: 140,
          borderRadius: '50%',
          border: `3px solid ${accent}`,
          background: '#0f172a',
          color: '#f4f4f4',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          padding: 16,
          boxShadow: '0 6px 16px rgba(0,0,0,0.45)',
          fontFamily: '"IBM Plex Sans", system-ui, sans-serif'
        }}
      >
        <div style={{ fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', opacity: 0.7 }}>
          {'<<'}
          {data.stereotype ?? 'use case'}
          {'>>'}
        </div>
        <div style={{ fontSize: 18, fontWeight: 600 }}>{data.name}</div>
        {data.documentation && (
          <div style={{ fontSize: 12, marginTop: 8, opacity: 0.75 }}>{data.documentation}</div>
        )}
      </div>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </>
  );
});

const StateNode = memo((props: NodeProps<SysMLNodeData>) => {
  const { data } = props;
  return (
    <>
      <NodeChrome data={data}>
        <div style={{ marginTop: 8, fontSize: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {data.tags?.map((tag) => (
            <span key={tag.key} style={{ opacity: 0.8 }}>
              {tag.key}: {tag.value}
            </span>
          ))}
        </div>
        <CompartmentList compartments={data.compartments} />
      </NodeChrome>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </>
  );
});

const StateMachineNode = memo((props: NodeProps<SysMLNodeData>) => {
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

const SequenceLifelineNode = memo((props: NodeProps<SysMLNodeData>) => {
  const { data } = props;
  const accent = accentByKind['sequence-lifeline'];
  return (
    <>
      <div
        style={{
          width: 140,
          height: 320,
          background: '#0b0c0f',
          border: `2px dashed ${accent}`,
          borderRadius: 8,
          color: '#f4f4f4',
          fontFamily: '"IBM Plex Sans", system-ui, sans-serif',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <div
          style={{
            padding: '8px 12px',
            borderBottom: `2px solid ${accent}`,
            textAlign: 'center',
            fontWeight: 600
          }}
        >
          {data.name}
        </div>
        <div
          style={{
            flex: 1,
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
            paddingTop: 8
          }}
        >
          <div
            style={{
              width: 2,
              background: accent,
              height: '100%'
            }}
          />
        </div>
      </div>
      <Handle type="target" position={Position.Top} id="lifeline-target" />
      <Handle type="source" position={Position.Bottom} id="lifeline-source" />
      <Handle type="source" position={Position.Right} id="lifeline-message-source" />
      <Handle type="target" position={Position.Left} id="lifeline-message-target" />
    </>
  );
});

export const sysmlNodeTypes: NodeTypes = {
  'sysml.requirement': RequirementNode,
  'sysml.block': BlockNode,
  'sysml.internal-block': BlockNode,
  'sysml.activity': ActivityNode,
  'sysml.parametric': ParametricNode,
  'sysml.use-case': UseCaseNode,
  'sysml.state': StateNode,
  'sysml.state-machine': StateMachineNode,
  'sysml.sequence-lifeline': SequenceLifelineNode
};
