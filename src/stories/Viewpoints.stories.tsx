import type { Meta, StoryObj } from '@storybook/react';
import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { ReactFlowProvider } from 'reactflow';

import {
  SysMLDiagram,
  type SysMLModel,
  type SysMLViewpoint,
  type SysMLReactFlowEdge,
  type SysMLReactFlowNode,
  type LayoutPipelineOptions,
  type SysMLNodeSpec,
  type SysMLRelationshipSpec,
  behaviorControlViewpoint,
  interactionViewpoint,
  requirementViewpoint,
  stateViewpoint,
  structuralDefinitionViewpoint,
  realizeViewpoint,
  layoutAndRoute,
  layoutAndRouteFromSpecs,
  recommendedLayouts,
  sysmlViewpoints,
  usageStructureViewpoint
} from '../index';

const sharedModel: SysMLModel = {
  nodes: [
    {
      kind: 'part-definition',
      spec: {
        id: 'vehicleDef',
        name: 'Vehicle',
        description: 'Top-level vehicle system definition.',
        attributes: [
          { name: 'mass', type: 'Real', multiplicity: '[kg]' },
          { name: 'range', type: 'Real', multiplicity: '[km]' }
        ],
        ports: [
          { name: 'powerIn', type: 'DC', direction: 'in' },
          { name: 'driveOut', type: 'Torque', direction: 'out' }
        ]
      }
    },
    {
      kind: 'part-definition',
      spec: {
        id: 'powertrainDef',
        name: 'Powertrain',
        description: 'Converts battery energy into mechanical torque.',
        ports: [
          { name: 'powerInput', type: 'DC', direction: 'in' },
          { name: 'torqueOutput', type: 'Torque', direction: 'out' }
        ]
      }
    },
    {
      kind: 'part-definition',
      spec: {
        id: 'batteryDef',
        name: 'Battery Pack',
        description: 'High-voltage battery capable of rapid discharge.',
        ports: [{ name: 'powerSupply', type: 'DC', direction: 'out' }]
      }
    },
    {
      kind: 'part-usage',
      spec: {
        id: 'vehicleUsage',
        name: 'EV :: Vehicle',
        definition: 'vehicleDef',
        ports: [
          { name: 'inboundPower', type: 'DC', direction: 'in' },
          { name: 'wheelTorque', type: 'Torque', direction: 'out' }
        ]
      }
    },
    {
      kind: 'part-usage',
      spec: {
        id: 'powertrainUsage',
        name: 'EV :: Powertrain',
        definition: 'powertrainDef',
        ports: [
          { name: 'batteryFeed', type: 'DC', direction: 'in' },
          { name: 'axleTorque', type: 'Torque', direction: 'out' }
        ]
      }
    },
    {
      kind: 'part-usage',
      spec: {
        id: 'batteryUsage',
        name: 'EV :: Battery Pack',
        definition: 'batteryDef',
        ports: [{ name: 'hvOutput', type: 'DC', direction: 'out' }]
      }
    },
    {
      kind: 'item-definition',
      spec: {
        id: 'torqueItem',
        name: 'Torque Delivery',
        unit: 'Nm',
        quantityKind: 'Torque'
      }
    },
    {
      kind: 'action-definition',
      spec: {
        id: 'startupActionDef',
        name: 'Initialize Propulsion',
        description: 'Prepare subsystems and engage torque control.',
        inputs: [{ name: 'startCommand', type: 'Command' }],
        outputs: [{ name: 'systemReady', type: 'Boolean' }]
      }
    },
    {
      kind: 'action-usage',
      spec: {
        id: 'startupActionUsage',
        name: 'Initialize Propulsion (usage)',
        definition: 'startupActionDef',
        inputs: [{ name: 'startCommand', type: 'Command' }],
        outputs: [{ name: 'systemReady', type: 'Boolean' }]
      }
    },
    {
      kind: 'activity-control',
      spec: {
        id: 'forkControl',
        name: 'Control Fork',
        controlType: 'fork',
        documentation: 'Splits control between diagnostics and propulsion startup.'
      }
    },
    {
      kind: 'sequence-lifeline',
      spec: {
        id: 'driverLifeline',
        name: 'Driver',
        classifier: 'Human'
      }
    },
    {
      kind: 'sequence-lifeline',
      spec: {
        id: 'controllerLifeline',
        name: 'Vehicle Controller',
        classifier: 'ECU'
      }
    },
    {
      kind: 'state-machine',
      spec: {
        id: 'vehicleStateMachine',
        name: 'Vehicle Lifecycle',
        states: [
          { id: 'stateOff', name: 'Off', entryAction: 'powerDown()' },
          { id: 'stateReady', name: 'Ready', entryAction: 'powerUp()', exitAction: 'stabilizeInverter()' },
          { id: 'stateActive', name: 'Active', doActivity: 'deliverTorque()' }
        ]
      }
    },
    {
      kind: 'state',
      spec: {
        id: 'stateOff',
        name: 'Off',
        entryAction: 'powerDown()'
      }
    },
    {
      kind: 'state',
      spec: {
        id: 'stateReady',
        name: 'Ready',
        entryAction: 'powerUp()',
        exitAction: 'stabilizeInverter()'
      }
    },
    {
      kind: 'state',
      spec: {
        id: 'stateActive',
        name: 'Active',
        doActivity: 'deliverTorque()'
      }
    },
    {
      kind: 'requirement-definition',
      spec: {
        id: 'reqSafeShutdownDef',
        name: 'Safe Shutdown Requirement',
        text: 'The vehicle shall enter a safe state within 3 seconds of a critical fault.',
        reqId: 'REQ-001'
      }
    },
    {
      kind: 'requirement-usage',
      spec: {
        id: 'reqSafeShutdownUsage',
        name: 'Safety Requirement Allocation',
        definition: 'reqSafeShutdownDef',
        text: 'Applies safe shutdown requirement to propulsion subsystem.',
        status: 'reviewed'
      }
    }
  ],
  relationships: [
    {
      id: 'relSpecializePowertrain',
      type: 'specialization',
      source: 'powertrainDef',
      target: 'vehicleDef',
      label: 'refines'
    },
    {
      id: 'relSpecializeBattery',
      type: 'specialization',
      source: 'batteryDef',
      target: 'vehicleDef',
      label: 'supports'
    },
    {
      id: 'relDefinitionVehicle',
      type: 'definition',
      source: 'vehicleUsage',
      target: 'vehicleDef'
    },
    {
      id: 'relDefinitionPowertrain',
      type: 'definition',
      source: 'powertrainUsage',
      target: 'powertrainDef'
    },
    {
      id: 'relDefinitionBattery',
      type: 'definition',
      source: 'batteryUsage',
      target: 'batteryDef'
    },
    {
      id: 'relDependencyTorque',
      type: 'dependency',
      source: 'vehicleDef',
      target: 'torqueItem',
      label: 'delivers'
    },
    {
      id: 'relFlowPower',
      type: 'flow-connection',
      source: 'batteryUsage',
      target: 'powertrainUsage',
      label: 'power'
    },
    {
      id: 'relActionFlow',
      type: 'action-flow',
      source: 'startupActionUsage',
      target: 'powertrainUsage',
      label: 'energize'
    },
    {
      id: 'relControlFlow',
      type: 'control-flow',
      source: 'forkControl',
      target: 'startupActionUsage',
      label: 'start'
    },
    {
      id: 'relMessageStart',
      type: 'message',
      source: 'driverLifeline',
      target: 'controllerLifeline',
      label: 'start()'
    },
    {
      id: 'relTransitionReady',
      type: 'transition',
      source: 'stateOff',
      target: 'stateReady',
      trigger: 'powerOn',
      guard: 'batteryOk'
    },
    {
      id: 'relTransitionActive',
      type: 'transition',
      source: 'stateReady',
      target: 'stateActive',
      trigger: 'accelerate'
    },
    {
      id: 'relTransitionShutdown',
      type: 'transition',
      source: 'stateActive',
      target: 'stateOff',
      trigger: 'shutdown',
      effect: 'powerDown()'
    },
    {
      id: 'relSatisfySafety',
      type: 'satisfy',
      source: 'powertrainUsage',
      target: 'reqSafeShutdownUsage',
      rationale: 'Propulsion handles rapid torque reduction.'
    },
    {
      id: 'relVerifySafety',
      type: 'verify',
      source: 'startupActionUsage',
      target: 'reqSafeShutdownUsage',
      rationale: 'Startup sequence performs readiness checks.'
    },
    {
      id: 'relRefineSafety',
      type: 'refine',
      source: 'reqSafeShutdownUsage',
      target: 'reqSafeShutdownDef'
    }
  ]
};

const viewpointLayoutMap: Record<string, keyof typeof recommendedLayouts> = {
  [structuralDefinitionViewpoint.id]: 'bdd',
  [usageStructureViewpoint.id]: 'ibd',
  [behaviorControlViewpoint.id]: 'activity',
  [interactionViewpoint.id]: 'sequence',
  [stateViewpoint.id]: 'stateMachine',
  [requirementViewpoint.id]: 'requirements'
};

const filterModelForViewpoint = (
  model: SysMLModel,
  viewpoint: SysMLViewpoint
): { nodes: SysMLNodeSpec[]; relationships: SysMLRelationshipSpec[] } => {
  const filteredNodes = model.nodes.filter(
    (spec) =>
      viewpoint.includeNodeKinds.includes(spec.kind) &&
      (viewpoint.nodeFilter ? viewpoint.nodeFilter(spec) : true)
  );

  const allowedNodeIds = new Set(filteredNodes.map((spec) => spec.spec.id));

  const filteredRelationships = model.relationships.filter((relationship) => {
    const kindIncluded = viewpoint.includeEdgeKinds ? viewpoint.includeEdgeKinds.includes(relationship.type) : true;
    const passesFilter = viewpoint.relationshipFilter ? viewpoint.relationshipFilter(relationship) : true;
    return kindIncluded && passesFilter && allowedNodeIds.has(relationship.source) && allowedNodeIds.has(relationship.target);
  });

  return { nodes: filteredNodes, relationships: filteredRelationships };
};

const meta = {
  title: 'Viewpoints/SysML Viewpoints',
  component: SysMLDiagram,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Explore how SysML viewpoints filter the same underlying model to emphasize structural, behavioral, interaction, state, and requirement concerns.'
      }
    }
  },
  tags: ['autodocs']
} satisfies Meta<typeof SysMLDiagram>;

export default meta;

type Story = StoryObj<typeof meta>;

const loadingStyle: CSSProperties = {
  width: '100%',
  height: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: 'Inter, system-ui, sans-serif',
  color: '#475569',
  background: '#ffffff'
};

const useViewpointDiagram = (viewpoint: SysMLViewpoint) => {
  const [diagram, setDiagram] = useState<{ nodes: SysMLReactFlowNode[]; edges: SysMLReactFlowEdge[] } | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function materialize() {
      setDiagram(null);
      const filtered = filterModelForViewpoint(sharedModel, viewpoint);
      const layoutKey = viewpointLayoutMap[viewpoint.id];

      if (layoutKey && filtered.nodes.length > 0) {
        try {
          const { nodes: layoutedNodes, edges: layoutedEdges } = await layoutAndRouteFromSpecs(
            filtered.nodes,
            filtered.relationships,
            layoutKey,
            { measure: true }
          );

          if (!cancelled) {
            setDiagram({ nodes: layoutedNodes, edges: layoutedEdges });
          }
          return;
        } catch (error) {
          if (!cancelled) {
            // eslint-disable-next-line no-console
            console.warn(
              `Failed to apply recommended layout "${layoutKey}" for viewpoint "${viewpoint.name}". Falling back to default positioning.`,
              error
            );
          }
        }
      }

      // Fallback: materialize the viewpoint and run a generic layout pass
      const realized = realizeViewpoint(sharedModel, viewpoint);
      try {
        const fallbackLayout: LayoutPipelineOptions = { algorithm: 'force', nodeSpacing: 80, layerSpacing: 80 };
        const { nodes: layoutedNodes, edges: layoutedEdges } = await layoutAndRoute(realized.nodes, realized.edges, {
          ...fallbackLayout,
          measure: true
        });

        if (!cancelled) {
          setDiagram({ nodes: layoutedNodes, edges: layoutedEdges });
        }
      } catch (error) {
        if (!cancelled) {
          // eslint-disable-next-line no-console
          console.warn(
            `Failed to apply fallback layout for viewpoint "${viewpoint.name}". Showing default materialization.`,
            error
          );
          setDiagram({ nodes: realized.nodes, edges: realized.edges });
        }
      }
    }

    void materialize();

    return () => {
      cancelled = true;
    };
  }, [viewpoint]);

  return diagram;
};

interface ViewpointCanvasProps {
  viewpoint: SysMLViewpoint;
}

const ViewpointCanvas = ({ viewpoint }: ViewpointCanvasProps) => {
  const diagram = useViewpointDiagram(viewpoint);

  return (
    <ReactFlowProvider>
      <div
        style={{
          width: '100%',
          height: '100vh',
          background: '#ffffff'
        }}
      >
        {diagram ? (
          <SysMLDiagram
            key={viewpoint.id}
            nodes={diagram.nodes}
            edges={diagram.edges}
            fitView
            showMiniMap={false}
            showControls={false}
          />
        ) : (
          <div style={loadingStyle}>Preparing {viewpoint.name}…</div>
        )}
      </div>
    </ReactFlowProvider>
  );
};

const sideBySideContainerStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
  gap: '24px',
  width: '100%',
  height: '100vh',
  padding: '16px',
  background: '#f8fafc'
};

const SideBySideViewpoints = () => (
  <div style={sideBySideContainerStyle}>
    <div style={{ background: '#ffffff', borderRadius: 12, boxShadow: '0 1px 4px rgba(15, 23, 42, 0.08)' }}>
      <ViewpointCanvas viewpoint={structuralDefinitionViewpoint} />
    </div>
    <div style={{ background: '#ffffff', borderRadius: 12, boxShadow: '0 1px 4px rgba(15, 23, 42, 0.08)' }}>
      <ViewpointCanvas viewpoint={usageStructureViewpoint} />
    </div>
  </div>
);

const viewpointList = [
  structuralDefinitionViewpoint,
  usageStructureViewpoint,
  behaviorControlViewpoint,
  interactionViewpoint,
  stateViewpoint,
  requirementViewpoint
];

const InteractiveViewpointSwitcher = () => {
  const [selectedId, setSelectedId] = useState(viewpointList[0].id);

  const selectedViewpoint = useMemo(
    () => viewpointList.find((entry) => entry.id === selectedId) ?? structuralDefinitionViewpoint,
    [selectedId]
  );
  const diagram = useViewpointDiagram(selectedViewpoint);

  return (
    <ReactFlowProvider>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#ffffff' }}>
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '16px 24px',
            borderBottom: '1px solid #e2e8f0',
            gap: '16px',
            background: '#f8fafc'
          }}
        >
          <label htmlFor="viewpoint-select" style={{ fontWeight: 600, color: '#0f172a' }}>
            Viewpoint
          </label>
          <select
            id="viewpoint-select"
            value={selectedId}
            onChange={(event) => setSelectedId(event.target.value)}
            style={{
              padding: '6px 10px',
              borderRadius: 6,
              border: '1px solid #cbd5f5',
              fontSize: 14
            }}
          >
            {viewpointList.map((entry) => (
              <option key={entry.id} value={entry.id}>
                {entry.name}
              </option>
            ))}
          </select>
          <span style={{ color: '#475569', fontSize: 13 }}>{selectedViewpoint.description}</span>
        </header>
        <div style={{ flex: 1 }}>
          {diagram ? (
            <SysMLDiagram
              key={selectedViewpoint.id}
              nodes={diagram.nodes}
              edges={diagram.edges}
              fitView
              showMiniMap={false}
              showControls={false}
            />
          ) : (
            <div style={loadingStyle}>Preparing {selectedViewpoint.name}…</div>
          )}
        </div>
      </div>
    </ReactFlowProvider>
  );
};

export const StructuralDefinition: Story = {
  render: () => <ViewpointCanvas viewpoint={structuralDefinitionViewpoint} />,
  parameters: {
    docs: {
      description: {
        story:
          'Filters the shared model to only the structural definition elements—ideal for reasoning about reusable parts, their attributes, and specialization.'
      }
    }
  }
};

export const UsageStructure: Story = {
  render: () => <ViewpointCanvas viewpoint={usageStructureViewpoint} />,
  parameters: {
    docs: {
      description: {
        story:
          'Shows the same model through the usage viewpoint, highlighting instances, allocated ports, and definition traces back to the reusable parts.'
      }
    }
  }
};

export const BehaviorAndControl: Story = {
  render: () => <ViewpointCanvas viewpoint={behaviorControlViewpoint} />,
  parameters: {
    docs: {
      description: {
        story:
          'Emphasizes the behavioral slices of the model—actions, control nodes, and their control/action flows—to help reason about activity coordination.'
      }
    }
  }
};

export const InteractionScenario: Story = {
  render: () => <ViewpointCanvas viewpoint={interactionViewpoint} />,
  parameters: {
    docs: {
      description: {
        story:
          'Surface the interaction viewpoint to focus on lifelines and message exchanges without the distraction of structural or state elements.'
      }
    }
  }
};

export const StateLifecycle: Story = {
  render: () => <ViewpointCanvas viewpoint={stateViewpoint} />,
  parameters: {
    docs: {
      description: {
        story:
          'Filters state machines and states, revealing the lifecycle transitions extracted from the shared model and how they relate to behavioral triggers.'
      }
    }
  }
};

export const RequirementTraceability: Story = {
  render: () => <ViewpointCanvas viewpoint={requirementViewpoint} />,
  parameters: {
    docs: {
      description: {
        story:
          'Uses the requirement viewpoint to show requirement definitions, usages, and the satisfy/refine/verify relationships that connect them back to design elements.'
      }
    }
  }
};

export const DefinitionVsUsageComparison: Story = {
  render: () => <SideBySideViewpoints />,
  parameters: {
    docs: {
      description: {
        story:
          'Renders the structural definition and usage viewpoints side by side so you can compare definition-centric vs usage-centric perspectives on the same model.'
      }
    }
  }
};

export const InteractiveViewpointExplorer: Story = {
  render: () => <InteractiveViewpointSwitcher />,
  parameters: {
    docs: {
      description: {
        story:
          'Interactive playground that lets you pivot between all shipped viewpoints using a dropdown, ideal for demos or teaching the SysML viewpoint pattern.'
      }
    }
  }
};

export const ViewpointCatalogTable: Story = {
  render: () => {
    const entries = Object.values(sysmlViewpoints);

    return (
      <div style={{ padding: '24px', background: '#ffffff', fontFamily: 'Inter, sans-serif' }}>
        <h2 style={{ marginBottom: '8px', color: '#0f172a' }}>Available Viewpoints</h2>
        <p style={{ marginBottom: '16px', color: '#475569' }}>
          Each viewpoint filters the shared SysML model to emphasize a specific concern area. Use this catalog when
          selecting a viewpoint programmatically.
        </p>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            border: '1px solid #e2e8f0',
            fontSize: 14
          }}
        >
          <thead style={{ background: '#f8fafc' }}>
            <tr>
              <th style={{ textAlign: 'left', padding: '12px', borderBottom: '1px solid #e2e8f0' }}>Name</th>
              <th style={{ textAlign: 'left', padding: '12px', borderBottom: '1px solid #e2e8f0' }}>ID</th>
              <th style={{ textAlign: 'left', padding: '12px', borderBottom: '1px solid #e2e8f0' }}>Includes Nodes</th>
              <th style={{ textAlign: 'left', padding: '12px', borderBottom: '1px solid #e2e8f0' }}>Includes Edges</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id}>
                <td style={{ padding: '12px', borderBottom: '1px solid #e2e8f0', fontWeight: 600 }}>{entry.name}</td>
                <td style={{ padding: '12px', borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>{entry.id}</td>
                <td style={{ padding: '12px', borderBottom: '1px solid #e2e8f0' }}>
                  <code>{entry.includeNodeKinds.join(', ')}</code>
                </td>
                <td style={{ padding: '12px', borderBottom: '1px solid #e2e8f0' }}>
                  <code>{(entry.includeEdgeKinds ?? ['*']).join(', ')}</code>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Reference table enumerating all shipped viewpoints, their identifiers, and the node/edge kinds each includes.'
      }
    }
  }
};
