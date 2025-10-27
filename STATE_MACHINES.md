# State Machines in SysML v2

This document explains how to model state machines using this library, following the SysML v2 specification.

## Overview

State machines in SysML v2 represent the behavior of a system or component through **states** and **transitions**. This library provides full support for:

- ✅ State Definitions and Usages (SysML v2 pattern)
- ✅ State Machines as containers
- ✅ Transitions with triggers, guards, and effects
- ✅ Entry, do, and exit actions
- ✅ Nested states (substates)
- ✅ Transition usage modeling

## Node Types

### 1. State Machine Container
**Factory:** `createStateMachineNode()`

Represents the overall state machine container.

```typescript
const powerStateMachine = createStateMachineNode(
  {
    id: 'sm-1',
    name: 'Vehicle Power State Machine',
    description: 'Controls power state transitions',
    states: [
      { id: 'off', name: 'Off' },
      { id: 'ready', name: 'Ready' },
      { id: 'active', name: 'Active' }
    ]
  },
  { x: 0, y: 0 }
);
```

### 2. State Nodes (Base)
**Factory:** `createStateNode()`

Legacy/simple state representation.

```typescript
const idleState = createStateNode(
  {
    id: 'state-idle',
    name: 'Idle',
    entryAction: 'reset()',
    doActivity: 'monitor()',
    exitAction: 'cleanup()'
  },
  { x: 200, y: 100 }
);
```

### 3. State Definition (SysML v2) ⭐
**Factory:** `createStateDefinitionNode()`

Defines an abstract state that can be reused.

```typescript
const readyStateDefinition = createStateDefinitionNode(
  {
    id: 'ready-state-def',
    name: 'ReadyState',
    description: 'Abstract ready state definition',
    substates: ['Initializing', 'Waiting', 'Prepared']
  },
  { x: 100, y: 100 }
);
```

### 4. State Usage (SysML v2) ⭐
**Factory:** `createStateUsageNode()`

A concrete instance of a state definition.

```typescript
const vehicleReadyState = createStateUsageNode(
  {
    id: 'vehicle-ready',
    name: 'vehicleReady',
    definition: 'ReadyState',
    entryAction: 'initSystems()',
    doAction: 'waitForCommand()',
    exitAction: 'prepareTransition()'
  },
  { x: 100, y: 300 }
);
```

### 5. Transition Usage (SysML v2) ⭐
**Factory:** `createTransitionUsageNode()`

Represents a transition as a first-class element (can be placed on diagram).

```typescript
const activateTransition = createTransitionUsageNode(
  {
    id: 'trans-activate',
    name: 'Activate',
    trigger: 'startCommand',
    guard: 'systemsHealthy',
    effect: 'logActivation()'
  },
  { x: 400, y: 200 }
);
```

## Edge Types

### State Transition
**Factory:** `createStateTransitionEdge()`

Represents transitions between states with triggers, guards, and effects.

```typescript
const transition = createStateTransitionEdge({
  id: 'trans-1',
  source: 'state-ready',
  target: 'state-active',
  trigger: 'startCommand',      // Event that triggers transition
  guard: 'batteryCharged',      // Condition that must be true
  effect: 'notifyOperator()'    // Action executed during transition
});
```

## State Actions

States can have three types of actions:

### Entry Action
Executed when entering the state.
```typescript
entryAction: 'initializeSensors()'
```

### Do Action (Activity)
Executed continuously while in the state.
```typescript
doAction: 'monitorTemperature()'
```

### Exit Action
Executed when leaving the state.
```typescript
exitAction: 'shutdownSensors()'
```

## Transition Components

### Trigger
The event that causes the transition to fire.
```typescript
trigger: 'buttonPressed'
trigger: 'timeout(10s)'
trigger: 'temperatureExceeds(100C)'
```

### Guard
A boolean condition that must be true for the transition to occur.
```typescript
guard: 'batteryLevel > 20%'
guard: 'safetyChecksPassed'
guard: '[temperature < 85C && pressure < 30kPa]'
```

### Effect
An action executed when the transition fires.
```typescript
effect: 'logTransition()'
effect: 'sendAlert(operator)'
effect: 'resetCounter()'
```

## Complete Example

See `examples/state-machine.tsx` for a complete working example of a vehicle power state machine with:
- Multiple states (Off, Standby, Ready, Active, Fault)
- Complex transitions with triggers, guards, and effects
- Entry/do/exit actions on states
- State machine container

```typescript
import { createStateUsageNode, createStateTransitionEdge } from 'sysml-reactflow';

// Define states
const offState = createStateUsageNode({
  id: 'off',
  name: 'Off',
  entryAction: 'powerDown()',
  doAction: 'sleep()'
}, { x: 0, y: 0 });

const onState = createStateUsageNode({
  id: 'on',
  name: 'On',
  entryAction: 'powerUp()',
  doAction: 'operate()',
  exitAction: 'cleanup()'
}, { x: 300, y: 0 });

// Define transition
const startTransition = createStateTransitionEdge({
  id: 'start',
  source: 'off',
  target: 'on',
  trigger: 'powerButton',
  guard: 'batteryOk',
  effect: 'notify()'
});
```

## SysML v2 Best Practices

### Use Definition/Usage Pattern ⭐

**Good (SysML v2):**
```typescript
// Define once
const readyStateDef = createStateDefinitionNode({
  id: 'ready-def',
  name: 'ReadyState'
});

// Use multiple times
const vehicleReady = createStateUsageNode({
  id: 'vehicle-ready',
  name: 'vehicleReady',
  definition: 'ReadyState'
});

const backupReady = createStateUsageNode({
  id: 'backup-ready',
  name: 'backupReady',
  definition: 'ReadyState'
});
```

**Acceptable (Simpler):**
```typescript
// For simple diagrams, base StateNode is fine
const ready = createStateNode({
  id: 'ready',
  name: 'Ready'
});
```

### Name States Clearly

- **State names:** Use noun phrases (Off, Ready, Active, Fault)
- **Triggers:** Use verb phrases or events (powerOn, timeout, errorDetected)
- **Guards:** Use boolean expressions (batteryCharged, safetyOk)
- **Effects:** Use actions (notify(), log(), reset())

### Model State Hierarchy

Use substates for complex state machines:

```typescript
const activeState = createStateDefinitionNode({
  id: 'active-def',
  name: 'Active',
  substates: ['Processing', 'Transmitting', 'Receiving']
});
```

## Rendering

State machines are rendered with:
- **Rounded rectangles** for states
- **Diamond shape** for state machine containers
- **Arrows** for transitions
- **Labels** showing triggers [guards] / effects
- **Compartments** for entry/do/exit actions

## Viewpoint Support

Use the `stateViewpoint` to filter diagrams to show only state-related elements:

```typescript
import { stateViewpoint, realizeViewpoint } from 'sysml-reactflow';

const model = {
  nodes: [/* all your nodes */],
  relationships: [/* all your edges */]
};

const view = realizeViewpoint(model, stateViewpoint);

<SysMLDiagram model={model} viewpoint={stateViewpoint} />
```

## Common Patterns

### Simple On/Off State Machine
Two states, two transitions.

### Lifecycle State Machine
Off → Initializing → Ready → Active → Shutdown → Off

### Fault-Tolerant State Machine
Normal states + Fault state + Recovery transitions

### Hierarchical State Machine
Parent states with nested substates

## Testing

State machine factories and transitions are fully tested:
```bash
npm test src/factories.test.ts  # Includes state machine tests
```

## References

- **SysML v2 Specification:** OMG ptc/24-02-03, Module 5 (State Machines)
- **Example:** `examples/state-machine.tsx`
- **Storybook:** `StateMachineDiagram` story
- **API Docs:** Factory function JSDoc comments

## Limitations

- No automatic layout (positions must be specified)
- No animation/simulation (visualization only)
- No state machine execution engine
- Substates shown as list, not visually nested (future enhancement)

For full SysML v2 state machine execution, consider tools built on [Eclipse SysML v2 API](https://github.com/Systems-Modeling/SysML-v2-Release).
