import { memo, type ReactNode } from 'react';
import type { NodeProps, NodeTypes } from 'reactflow';
import { Handle, Position } from 'reactflow';

import type { SysMLCompartment, SysMLNodeData } from './types';

const accentByKind: Record<string, string> = {
  // Base node types (used in factories)
  state: '#33B1FF',
  'state-machine': '#3DDBD9',
  'sequence-lifeline': '#F1C21B',
  'activity-control': '#E0E0E0',
  // Structural
  'part-definition': '#4589FF',
  'part-usage': '#0F62FE',
  'attribute-definition': '#6929C4',
  'attribute-usage': '#8A3FFC',
  'port-definition': '#08BDBA',
  'port-usage': '#1192E8',
  'item-definition': '#BA4E00',
  'item-usage': '#FF832B',
  'connection-definition': '#A56EFF',
  'connection-usage': '#BE95FF',
  'interface-definition': '#0072C3',
  'interface-usage': '#1192E8',
  'allocation-definition': '#FA4D56',
  'allocation-usage': '#FF8389',
  'reference-usage': '#D02670',
  'occurrence-definition': '#D12765',
  'occurrence-usage': '#FF7EB6',
  // Behavioral
  'action-definition': '#FF7EB6',
  'action-usage': '#FFB3B8',
  'calculation-definition': '#198038',
  'calculation-usage': '#24A148',
  'perform-action': '#6FDC8C',
  'send-action': '#007D79',
  'accept-action': '#005D5D',
  'assignment-action': '#9EF0F0',
  'if-action': '#FFD6E8',
  'for-loop-action': '#D6E6FF',
  'while-loop-action': '#BAE6FF',
  'state-definition': '#0043CE',
  'state-usage': '#33B1FF',
  'transition-usage': '#82CFFF',
  'exhibit-state': '#D0E2FF',
  // Requirements & Cases
  'requirement-definition': '#0043CE',
  'requirement-usage': '#0F62FE',
  'constraint-definition': '#FA4D56',
  'constraint-usage': '#FF8389',
  'verification-case-definition': '#198038',
  'verification-case-usage': '#24A148',
  'analysis-case-definition': '#8A3800',
  'analysis-case-usage': '#FF832B',
  'use-case-definition': '#B28600',
  'use-case-usage': '#FFB000',
  'concern-definition': '#9F1853',
  'concern-usage': '#D02670',
  // Organizational
  package: '#6929C4',
  'library-package': '#8A3FFC',
  // Interactions
  interaction: '#EE5396',
  // Metadata
  'metadata-definition': '#525252',
  'metadata-usage': '#8D8D8D',
  comment: '#A8A8A8',
  documentation: '#C6C6C6'
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

// Standard connection handles for all nodes (top, right, bottom, left)
const StandardHandles = () => (
  <>
    <Handle type="target" position={Position.Top} id="top" style={{ background: '#525252' }} />
    <Handle type="source" position={Position.Right} id="right" style={{ background: '#525252' }} />
    <Handle type="target" position={Position.Bottom} id="bottom" style={{ background: '#525252' }} />
    <Handle type="source" position={Position.Left} id="left" style={{ background: '#525252' }} />
  </>
);

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
        {data.elementKind && (
          <span
            style={{
              fontSize: 11,
              padding: '2px 8px',
              borderRadius: 999,
              background: 'rgba(255,255,255,0.12)',
              textTransform: 'capitalize'
            }}
          >
            {data.elementKind}
          </span>
        )}
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
        {data.baseDefinition && (
          <div style={{ fontSize: 11, marginTop: 4, opacity: 0.75 }}>
            defined by <strong>{data.baseDefinition}</strong>
          </div>
        )}
        {(data.redefines?.length || data.subsets?.length) && (
          <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {data.redefines?.length ? (
              <div style={{ fontSize: 11, opacity: 0.75 }}>
                redefines: {data.redefines.join(', ')}
              </div>
            ) : null}
            {data.subsets?.length ? (
              <div style={{ fontSize: 11, opacity: 0.75 }}>
                subsets: {data.subsets.join(', ')}
              </div>
            ) : null}
          </div>
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
      <StandardHandles />
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
      <StandardHandles />
      
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
    </>
  );
});

const DefinitionNode = memo((props: NodeProps<SysMLNodeData>) => {
  const { data } = props;
  return (
    <>
      <NodeChrome data={data}>
        <CompartmentList compartments={data.compartments} />
      </NodeChrome>
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
      <StandardHandles />
      
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

const ActivityControlNode = memo((props: NodeProps<SysMLNodeData>) => {
  const { data } = props;
  const type = data.controlType ?? 'decision';
  const accent = accentByKind['activity-control'];
  const isBar = type === 'fork' || type === 'join';

  return (
    <>
      {isBar ? (
        <div
          style={{
            width: 160,
            height: 12,
            background: accent,
            borderRadius: 3,
            boxShadow: '0 2px 8px rgba(0,0,0,0.45)'
          }}
        />
      ) : (
        <div
          style={{
            width: 120,
            height: 120,
            transform: 'rotate(45deg)',
            background: '#0b0c0f',
            border: `4px solid ${accent}`,
            boxShadow: '0 4px 12px rgba(0,0,0,0.45)'
          }}
        />
      )}
      <StandardHandles />
      
    </>
  );
});

export const sysmlNodeTypes: NodeTypes = {
  // Base node types (still used in some factories)
  'sysml.state': StateNode,
  'sysml.state-machine': StateMachineNode,
  'sysml.sequence-lifeline': SequenceLifelineNode,
  'sysml.activity-control': ActivityControlNode,
  // Structural elements
  'sysml.part-definition': DefinitionNode,
  'sysml.part-usage': DefinitionNode,
  'sysml.attribute-definition': DefinitionNode,
  'sysml.attribute-usage': DefinitionNode,
  'sysml.port-definition': DefinitionNode,
  'sysml.port-usage': DefinitionNode,
  'sysml.item-definition': DefinitionNode,
  'sysml.item-usage': DefinitionNode,
  'sysml.connection-definition': DefinitionNode,
  'sysml.connection-usage': DefinitionNode,
  'sysml.interface-definition': DefinitionNode,
  'sysml.interface-usage': DefinitionNode,
  'sysml.allocation-definition': DefinitionNode,
  'sysml.allocation-usage': DefinitionNode,
  'sysml.reference-usage': DefinitionNode,
  'sysml.occurrence-definition': DefinitionNode,
  'sysml.occurrence-usage': DefinitionNode,
  // Behavioral elements
  'sysml.action-definition': DefinitionNode,
  'sysml.action-usage': DefinitionNode,
  'sysml.calculation-definition': DefinitionNode,
  'sysml.calculation-usage': DefinitionNode,
  'sysml.perform-action': ActivityNode,
  'sysml.send-action': ActivityNode,
  'sysml.accept-action': ActivityNode,
  'sysml.assignment-action': ActivityNode,
  'sysml.if-action': ActivityNode,
  'sysml.for-loop-action': ActivityNode,
  'sysml.while-loop-action': ActivityNode,
  'sysml.state-definition': StateNode,
  'sysml.state-usage': StateNode,
  'sysml.transition-usage': StateNode,
  'sysml.exhibit-state': StateNode,
  // Requirements & Cases
  'sysml.requirement-definition': RequirementNode,
  'sysml.requirement-usage': RequirementNode,
  'sysml.constraint-definition': ParametricNode,
  'sysml.constraint-usage': ParametricNode,
  'sysml.verification-case-definition': RequirementNode,
  'sysml.verification-case-usage': RequirementNode,
  'sysml.analysis-case-definition': ActivityNode,
  'sysml.analysis-case-usage': ActivityNode,
  'sysml.use-case-definition': UseCaseNode,
  'sysml.use-case-usage': UseCaseNode,
  'sysml.concern-definition': RequirementNode,
  'sysml.concern-usage': RequirementNode,
  // Organizational
  'sysml.package': BlockNode,
  'sysml.library-package': BlockNode,
  // Interactions
  'sysml.interaction': SequenceLifelineNode,
  // Metadata
  'sysml.metadata-definition': DefinitionNode,
  'sysml.metadata-usage': DefinitionNode,
  'sysml.comment': DefinitionNode,
  'sysml.documentation': DefinitionNode
};
