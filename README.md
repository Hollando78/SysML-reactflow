# sysml-reactflow

SysML-ready building blocks for [React Flow](https://reactflow.dev). The package ships with OMG-friendly node chrome, relationship edges, and factories that convert SysML specifications into consumable React Flow graphs.

## Features

- 🧱 Prebuilt node renderers for requirements, block/internals, activities, and parametric constraints with stereotype + compartment styling.
- 🔗 Custom relationship edges that express `satisfy`, `verify`, `allocate`, `refine`, and generic dependencies.
- 🛠️ Data factories that transform SysML specifications into strongly typed React Flow nodes/edges.
- 🗺️ `SysMLDiagram` wrapper that wires recommended controls, minimap, and background for quick prototyping.

## Installation

```bash
npm install sysml-reactflow react react-dom reactflow
```

## Quick start

```tsx
import { ReactFlowProvider } from 'reactflow';
import {
  SysMLDiagram,
  createNodesFromSpecs,
  createEdgesFromRelationships
} from 'sysml-reactflow';

const nodes = createNodesFromSpecs([
  {
    kind: 'requirement',
    spec: {
      id: 'REQ-101',
      name: 'Thermal Compliance',
      text: 'The payload shall remain between 0°C and 40°C.',
      verification: 'analysis',
      risk: 'medium',
      status: 'reviewed'
    }
  },
  {
    kind: 'block-definition',
    spec: {
      id: 'BLK-42',
      name: 'ThermalController',
      stereotype: 'block',
      description: 'Regulates loop temp.',
      parts: [{ name: 'pump', type: 'Pump', multiplicity: '2' }],
      ports: [
        { name: 'coolantIn', type: 'Coolant', direction: 'in' },
        { name: 'coolantOut', type: 'Coolant', direction: 'out' }
      ]
    }
  }
]);

const edges = createEdgesFromRelationships([
  { id: 'edge-1', type: 'satisfy', source: 'BLK-42', target: 'REQ-101', label: 'satisfy' }
]);

export function Example() {
  return (
    <ReactFlowProvider>
      <div style={{ width: '100%', height: 520 }}>
        <SysMLDiagram nodes={nodes} edges={edges} />
      </div>
    </ReactFlowProvider>
  );
}
```

## API surface

### Components

- `SysMLDiagram`: Thin wrapper over `ReactFlow` that registers the SysML node/edge types and exposes toggles for background, minimap, and controls.
- `sysmlNodeTypes`, `sysmlEdgeTypes`: Registries that can be passed directly into your own `ReactFlow` instance if you prefer manual wiring.

### Factories

- `createRequirementNode`, `createBlockNode`, `createActivityNode`, `createParametricNode`
- `createNodesFromSpecs` – batch helper that also auto-positions nodes in a grid when explicit coordinates are not provided.
- `createRelationshipEdge`, `createEdgesFromRelationships`

All helpers are fully typed so IDEs expose the required SysML contract (id/name/info, compartments, ports, etc.). Add your own stereotypes, compartments, or tags by extending the returned node data before handing it to React Flow.

## Example catalog

See [`examples/basic.tsx`](examples/basic.tsx) for a runnable snippet that assembles a small SysML allocation chain. Drop it into a Vite/Next playground to see the styling in action.

## Storybook

Spin up the component workbench to explore SysML nodes interactively:

```bash
npm run storybook   # dev server on http://localhost:6006
npm run build-storybook   # static export in storybook-static/
```

## Building the package

```bash
npm run build
```

This runs `tsup` to emit both ESM (`dist/index.js`) and CJS (`dist/index.cjs`) bundles alongside type declarations.

## Roadmap ideas

- Expand node palette to include state machines, sequence diagrams, and allocation tables.
- Theme tokens + CSS variables for easier design integration.
- Optional layout helpers powered by `elkjs` or `dagre`.

Contributions and issues are welcome!
