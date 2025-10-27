# sysml-reactflow

**Pure SysML v2.0** building blocks for [React Flow](https://reactflow.dev). This package implements the OMG Systems Modeling Language v2.0 specification with comprehensive support for all core metaclasses, relationships, and diagram types.

🎯 **Zero SysML v1 legacy** - All deprecated SysML v1 elements have been removed for clean v2.0 compliance.

## Features

- ✅ **Full SysML v2.0 Compliance** - Supports 60+ element types covering all major SysML v2 metaclasses
- 🧱 **Comprehensive Node Renderers** - Prebuilt renderers for definitions, usages, behaviors, requirements, cases, and metadata
- 🔗 **Complete Relationship Support** - 30+ edge types including typing, specialization, feature relationships, and more
- 🛠️ **Type-Safe Factories** - Strongly typed factory functions for all SysML v2 elements
- 🗺️ **SysML v2 Viewpoints** - Built-in viewpoint system for diagram materialization
- 🎨 **Professional Styling** - IBM Plex-based design with Definition/Usage badges and status indicators
- 🤖 **Automatic Layout** - Powered by elkjs with optimized algorithms for each diagram type (layered, force-directed, tree, orthogonal, sequence)

### SysML v2.0 Element Coverage

**Structural Elements (16 types):**
- ✅ Part Definition/Usage
- ✅ Attribute Definition/Usage
- ✅ Port Definition/Usage
- ✅ Item Definition/Usage
- ✅ Connection Definition/Usage
- ✅ Interface Definition/Usage
- ✅ Allocation Definition/Usage
- ✅ Reference Usage
- ✅ Occurrence Definition/Usage

**Behavioral Elements (14 types):**
- ✅ Action Definition/Usage
- ✅ Activity
- ✅ Calculation Definition/Usage
- ✅ Perform Action, Send Action, Accept Action
- ✅ Assignment Action
- ✅ If Action, For Loop, While Loop
- ✅ State Definition/Usage, Transition, Exhibit State

**Requirements & Cases (12 types):**
- ✅ Requirement Definition/Usage
- ✅ Constraint Definition/Usage
- ✅ Verification Case Definition/Usage
- ✅ Analysis Case Definition/Usage
- ✅ Use Case Definition/Usage
- ✅ Concern Definition/Usage

**Organizational & Metadata (8 types):**
- ✅ Package, Library Package
- ✅ Interaction, Sequence Lifeline
- ✅ Metadata Definition/Usage
- ✅ Comment, Documentation

**Relationships (30+ types):**
- Type relationships: Specialization, Conjugation, Feature Typing, Subsetting, Redefinition
- Dependency relationships: Satisfy, Verify, Refine, Allocate
- Flow relationships: Control Flow, Item Flow, Action Flow, Flow Connection
- Structure relationships: Feature Membership, Owning Membership, Variant Membership
- Connectors: Binding Connector, Succession
- Use case: Include, Extend
- State: Transition
- Interaction: Message, Succession

### Diagram coverage

- **BDD & IBD:** Full Definition/Usage semantics with compartments, ports, and attributes
- **SysML v2 Definition/Usage Pattern:** Proper modeling of all definition/usage pairs with typing relationships
- **Use Cases:** Use case definitions/usages with include/extend/actor support
- **State Machines:** State definitions, usages, transitions with guards/triggers/effects
- **Sequence Diagrams:** Lifelines, interactions, and synchronous/asynchronous/return messages
- **Activity Diagrams:** Actions, control nodes (fork/join/decision/merge), control flows
- **Requirement Diagrams:** Requirement definitions/usages with satisfy/verify/refine relationships
- **Analysis & Verification:** Full support for verification cases and analysis cases
- **Parametric & Calculations:** Constraint and calculation definitions/usages

### SysML v2 viewpoints

SysML v2 diagrams are view specifications. The library ships with reusable viewpoints that materialize the appropriate nodes/edges following SysML v2 semantics:

```tsx
import {
  SysMLDiagram,
  structuralDefinitionViewpoint,
  type SysMLModel
} from 'sysml-reactflow';

const model: SysMLModel = { nodes: specs, relationships };

<SysMLDiagram model={model} viewpoint={structuralDefinitionViewpoint} />;
```

Behind the scenes the viewpoint filters the SysML element kinds, applies the correct definition/usage semantics, and renders the React Flow scene so you get a true SysML v2 environment.

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
    kind: 'requirement-usage',
    spec: {
      id: 'REQ-101',
      name: 'Thermal Compliance',
      text: 'The payload shall remain between 0°C and 40°C.',
      status: 'reviewed'
    }
  },
  {
    kind: 'part-definition',
    spec: {
      id: 'PART-42',
      name: 'ThermalController',
      description: 'Regulates loop temp.',
      attributes: [
        { name: 'pump', type: 'Pump', multiplicity: '[2]' }
      ],
      ports: [
        { name: 'coolantIn', type: 'Coolant', direction: 'in' },
        { name: 'coolantOut', type: 'Coolant', direction: 'out' }
      ]
    }
  }
]);

const edges = createEdgesFromRelationships([
  { id: 'edge-1', type: 'satisfy', source: 'PART-42', target: 'REQ-101', label: 'satisfy' }
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

### Automatic Layout

Apply automatic graph layout with optimized algorithms for different diagram types:

```tsx
import { applyRecommendedLayout } from 'sysml-reactflow';

// Create nodes and edges
const nodes = createNodesFromSpecs([...]);
const edges = createEdgesFromRelationships([...]);

// Apply automatic layout
const layoutedNodes = await applyRecommendedLayout(nodes, edges, 'requirements');

<SysMLDiagram nodes={layoutedNodes} edges={edges} fitView />
```

The library supports multiple layout algorithms:
- **Layered (Hierarchical)** - For BDD, requirements, packages, activities
- **Force-Directed** - For state machines, use cases
- **Tree** - For package hierarchies
- **Box (Orthogonal)** - For IBD, component compositions
- **Sequence** - For sequence diagram lifelines

See **[Layout Guide](LAYOUT.md)** for detailed documentation and examples.

## API surface

### Components

- `SysMLDiagram`: Thin wrapper over `ReactFlow` that registers all SysML v2 node/edge types with recommended controls
- `sysmlNodeTypes`, `sysmlEdgeTypes`: Complete registries with 60+ node types and 30+ edge types

### Factory Functions

The library exports **60+ factory functions** for creating SysML v2 elements:

**Structural Element Factories:**
- `createAttributeDefinitionNode`, `createAttributeUsageNode`
- `createConnectionDefinitionNode`, `createConnectionUsageNode`
- `createInterfaceDefinitionNode`, `createInterfaceUsageNode`
- `createAllocationDefinitionNode`, `createAllocationUsageNode`
- `createReferenceUsageNode`
- `createOccurrenceDefinitionNode`, `createOccurrenceUsageNode`
- And more...

**Behavioral Element Factories:**
- `createCalculationDefinitionNode`, `createCalculationUsageNode`
- `createPerformActionNode`, `createSendActionNode`, `createAcceptActionNode`
- `createAssignmentActionNode`, `createIfActionNode`, `createForLoopActionNode`, `createWhileLoopActionNode`
- `createStateDefinitionNode`, `createStateUsageNode`, `createTransitionUsageNode`
- And more...

**Requirements & Cases Factories:**
- `createRequirementDefinitionNode`, `createRequirementUsageNode`
- `createConstraintDefinitionNode`, `createConstraintUsageNode`
- `createVerificationCaseDefinitionNode`, `createVerificationCaseUsageNode`
- `createAnalysisCaseDefinitionNode`, `createAnalysisCaseUsageNode`
- `createUseCaseDefinitionNode`, `createUseCaseUsageNode`
- `createConcernDefinitionNode`, `createConcernUsageNode`

**Organizational & Metadata Factories:**
- `createPackageNode`, `createLibraryPackageNode`
- `createInteractionNode`
- `createMetadataDefinitionNode`, `createMetadataUsageNode`
- `createCommentNode`, `createDocumentationNode`

**Batch Helpers:**
- `createNodesFromSpecs` – batch creation with auto-positioning
- `createEdgesFromRelationships` – batch edge creation

All factory functions are fully typed with TypeScript, providing IDE autocomplete for all SysML v2 properties.

## Example catalog

See [`examples/basic.tsx`](examples/basic.tsx) for a runnable snippet that assembles a small SysML allocation chain. Drop it into a Vite/Next playground to see the styling in action.

Additional examples:
- [`examples/state-machine.tsx`](examples/state-machine.tsx) - Complete state machine with transitions, guards, and actions
- [`examples/sequence-diagram.tsx`](examples/sequence-diagram.tsx) - Interaction sequences with lifelines and messages
- [`examples/automatic-layout.tsx`](examples/automatic-layout.tsx) - Automatic layout for different diagram types with interactive controls
- [`examples/system-decomposition.tsx`](examples/system-decomposition.tsx) - Three-level decomposition of system, subsystem, and component parts
- [`examples/component-interfaces.tsx`](examples/component-interfaces.tsx) - Component-level interface view with shared buses and flows
- [`examples/requirements-schema.tsx`](examples/requirements-schema.tsx) - Requirement, constraint, analysis, and verification relationships
- [`examples/functional-flow.tsx`](examples/functional-flow.tsx) - Functional activity flow with sequential and control links

## Documentation

Comprehensive guides for specific features and diagram types:

- **[Automatic Layout](LAYOUT.md)** - Complete guide to automatic graph layout with elkjs (layered, force, tree, box, sequence algorithms)
- **[State Machines](STATE_MACHINES.md)** - Complete guide to modeling state machines with states, transitions, triggers, guards, and effects
- **[Sequence Diagrams](SEQUENCE_DIAGRAMS.md)** - Complete guide to modeling interactions with lifelines, messages, and conditional flows

## Storybook

Spin up the component workbench to explore SysML nodes interactively:

```bash
npm run storybook   # dev server on http://localhost:6006
npm run build-storybook   # static export in storybook-static/
```

### Continuous Storybook build

Every push or pull request triggers `.github/workflows/storybook.yml`, which installs dependencies, runs `npm run lint`, builds the static Storybook bundle, and publishes it as a GitHub Actions artifact named `storybook-static`. Grab the latest artifact from the Actions tab if you want to preview the CI build without running it locally.

### GitHub Pages deployment

The `Deploy Storybook to GitHub Pages` workflow (`.github/workflows/pages.yml`) publishes the latest Storybook build to GitHub Pages on each push to `master/main`. Visit https://hollando78.github.io/SysML-reactflow/ for the hosted docs.

## Testing

```bash
npm test              # Run tests once
npm run test:watch    # Run tests in watch mode
npm run test:ui       # Run tests with UI
npm run test:coverage # Run tests with coverage report
```

**Test Coverage:**
- ✅ 69 tests across 4 test suites
- ✅ 63% overall code coverage
- ✅ 100% coverage on core components (SysMLDiagram, viewpoints)
- ✅ Unit tests for factory functions
- ✅ Component tests for node rendering
- ✅ Integration tests for viewpoint filtering

## Building the package

```bash
npm run build
```

This runs `tsup` to emit both ESM (`dist/index.js`) and CJS (`dist/index.cjs`) bundles alongside type declarations.

## SysML v2.0 Compliance

This library implements the **OMG Systems Modeling Language (SysML) v2.0** specification with comprehensive coverage of:

✅ **Core Metamodel Elements** - All major definition/usage pairs following KerML foundations
✅ **Type Relationships** - Specialization, conjugation, typing, subsetting, redefinition, feature chaining
✅ **Behavioral Modeling** - Actions, activities, calculations, state machines, interactions
✅ **Requirement Engineering** - Requirements, constraints, verification cases, analysis cases, concerns
✅ **Structural Modeling** - Parts, attributes, ports, items, connections, interfaces, allocations
✅ **Organizational Elements** - Packages, library packages, namespaces, memberships
✅ **Metadata & Annotations** - Comments, documentation, metadata definitions/usages

**Alignment with SysML v2 Specifications:**
- Based on OMG SysML v2.0 specification (ptc/24-02-03)
- Follows OASIS OSLC SysML v2.0 vocabulary (2024)
- Compatible with SysML v2 Pilot Implementation metamodel (Eclipse)

**Limitations:**
- **Visualization Focus:** This library provides visualization components, not a full authoring/editing environment
- **No XMI/JSON Serialization:** Does not currently serialize to/from standard SysML v2 interchange formats
- **Simplified Expressions:** Expression types (literal, invocation, feature reference) represented as strings
- **Read-Only Rendering:** Interactive editing and model manipulation not included

For full SysML v2 authoring capabilities, consider tools built on the [Eclipse SysML v2 API](https://github.com/Systems-Modeling/SysML-v2-Release).

## Roadmap

- ✅ ~~Complete SysML v2 element type coverage~~
- ✅ ~~All definition/usage pairs~~
- ✅ ~~Full relationship support~~
- ✅ ~~Automatic layout with elkjs (layered, force, tree, box, sequence algorithms)~~
- 🔲 SysML v2 JSON/XMI serialization support
- 🔲 Expression metaclasses (LiteralExpression, InvocationExpression, FeatureReferenceExpression)
- 🔲 Advanced feature relationships (FeatureValue, FeatureChaining visualization)
- 🔲 Theme tokens + CSS variables for customization
- 🔲 Interactive editing capabilities
- 🔲 Model validation against SysML v2 constraints

Contributions and issues are welcome!
