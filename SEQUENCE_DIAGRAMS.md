# Sequence Diagrams in SysML v2

This document explains how to model sequence diagrams (interactions) using this library, following the SysML v2 specification.

## Overview

Sequence diagrams in SysML v2 represent interactions between system components through **lifelines** and **messages**. This library provides full support for:

- ✅ Lifelines representing participants
- ✅ Synchronous messages (blocking calls)
- ✅ Asynchronous messages (signals/events)
- ✅ Return messages (responses)
- ✅ Message guards (conditions)
- ✅ Interaction containers (SysML v2)
- ✅ Multiple lifeline types (actors, parts, systems)

## Node Types

### 1. Sequence Lifeline
**Factory:** `createSequenceLifelineNode()`

Represents a participant in the interaction with a vertical timeline.

```typescript
const controller = createSequenceLifelineNode(
  {
    id: 'lifeline-controller',
    name: 'controller: PowerController',
    classifier: 'PartDefinition::PowerController',
    description: 'Main power control unit'
  },
  { x: 280, y: 0 }
);
```

**Properties:**
- `name`: Instance name and type (e.g., "controller: PowerController")
- `classifier`: The type/classifier this lifeline represents
- `description`: Optional description of the participant

### 2. Interaction Container
**Factory:** `createInteractionNode()`

Represents the overall interaction context (optional but recommended for SysML v2).

```typescript
const powerSequence = createInteractionNode(
  {
    id: 'interaction-1',
    name: 'Power-On Sequence',
    description: 'Describes the interaction sequence for powering on the vehicle',
    participants: ['Driver', 'PowerController', 'BatteryManager', 'MotorController']
  },
  { x: 420, y: -150 }
);
```

## Edge Types

### Sequence Message
**Factory:** `createSequenceMessageEdge()`

Represents messages between lifelines with different communication patterns.

```typescript
const message = createSequenceMessageEdge({
  id: 'msg-1',
  type: 'sync',                    // 'sync', 'async', or 'return'
  source: 'lifeline-driver',
  target: 'lifeline-controller',
  label: 'pressStartButton()',
  guard: 'safetyChecksPass',       // Optional condition
  description: 'Driver initiates power-on sequence'
});
```

## Message Types

### Synchronous Messages (sync)
Blocking call where the sender waits for a response.

```typescript
createSequenceMessageEdge({
  id: 'msg-1',
  type: 'sync',
  source: 'lifeline-controller',
  target: 'lifeline-battery',
  label: 'checkStatus()',
  description: 'Verify battery is ready'
})
```

**Rendered with:** Filled solid arrow →
**Typical use:** Method calls, RPCs, blocking operations

### Asynchronous Messages (async)
Non-blocking signal or event, sender doesn't wait.

```typescript
createSequenceMessageEdge({
  id: 'msg-2',
  type: 'async',
  source: 'lifeline-controller',
  target: 'lifeline-motors',
  label: 'enablePower(voltage: 400V)',
  description: 'Enable motor power supply'
})
```

**Rendered with:** Open arrow →
**Typical use:** Events, signals, fire-and-forget messages, telemetry

### Return Messages (return)
Response to a previous message.

```typescript
createSequenceMessageEdge({
  id: 'msg-3',
  type: 'return',
  source: 'lifeline-battery',
  target: 'lifeline-controller',
  label: 'BatteryStatus(charged, temp: 25C)',
  description: 'Battery status response'
})
```

**Rendered with:** Dashed line ┈→
**Typical use:** Return values, acknowledgments, confirmations

## Message Components

### Label
The message signature or event name.

```typescript
label: 'calculateLoad(voltage, current)'
label: 'powerButton'
label: 'StatusResponse(ok)'
label: 'motorSpeedChanged(rpm: 1500)'
```

### Guard
A boolean condition that must be true for the message to be sent.

```typescript
guard: 'batteryCharged && systemsReady'
guard: 'safetyChecksPass'
guard: 'availablePower >= requestedPower'
```

Guards are typically rendered in square brackets: `[batteryCharged]`

### Description
Human-readable explanation of the message's purpose.

```typescript
description: 'Notify supervisor of limit violation'
description: 'Begin power delivery'
description: 'Override with safe limit'
```

## Complete Example

See `examples/sequence-diagram.tsx` for a complete working example of a vehicle power-on sequence with:
- Multiple lifelines (Driver, PowerController, BatteryManager, MotorController)
- Synchronous method calls
- Asynchronous events
- Return messages
- Conditional flows with guards
- Error handling scenarios

```typescript
import {
  createSequenceLifelineNode,
  createSequenceMessageEdge,
  createInteractionNode
} from 'sysml-reactflow';

// Define participants
const driver = createSequenceLifelineNode(
  {
    id: 'lifeline-driver',
    name: 'Driver',
    classifier: 'Actor::Driver'
  },
  { x: 0, y: 0 }
);

const controller = createSequenceLifelineNode(
  {
    id: 'lifeline-controller',
    name: 'controller: PowerController',
    classifier: 'PartDefinition::PowerController'
  },
  { x: 280, y: 0 }
);

// Define interaction flow
const messages = [
  // Synchronous call
  createSequenceMessageEdge({
    id: 'msg-1',
    type: 'sync',
    source: 'lifeline-driver',
    target: 'lifeline-controller',
    label: 'pressStartButton()'
  }),

  // Return response
  createSequenceMessageEdge({
    id: 'msg-2',
    type: 'return',
    source: 'lifeline-controller',
    target: 'lifeline-driver',
    label: 'Ready(true)'
  }),

  // Asynchronous event
  createSequenceMessageEdge({
    id: 'msg-3',
    type: 'async',
    source: 'lifeline-controller',
    target: 'lifeline-driver',
    label: 'displayReadyStatus()'
  })
];
```

## Common Patterns

### Request-Response Pattern
Synchronous request followed by return message.

```typescript
// Request
createSequenceMessageEdge({
  id: 'req',
  type: 'sync',
  source: 'client',
  target: 'server',
  label: 'getData(id: 123)'
})

// Response
createSequenceMessageEdge({
  id: 'resp',
  type: 'return',
  source: 'server',
  target: 'client',
  label: 'Data(value: "abc")'
})
```

### Fire-and-Forget Pattern
Asynchronous message with no expected response.

```typescript
createSequenceMessageEdge({
  id: 'notify',
  type: 'async',
  source: 'sensor',
  target: 'logger',
  label: 'temperatureUpdate(25C)'
})
```

### Conditional Flow
Messages with guards for different scenarios.

```typescript
// Success path
createSequenceMessageEdge({
  id: 'success',
  type: 'return',
  source: 'battery',
  target: 'controller',
  label: 'PowerGranted(50kW)',
  guard: 'availablePower >= requestedPower'
})

// Error path
createSequenceMessageEdge({
  id: 'error',
  type: 'async',
  source: 'battery',
  target: 'supervisor',
  label: 'powerLimitExceeded()',
  guard: 'availablePower < requestedPower'
})
```

### Actor Interaction
External actors initiating sequences.

```typescript
const actor = createSequenceLifelineNode(
  {
    id: 'user',
    name: 'User',
    classifier: 'Actor::User'
  },
  { x: 0, y: 0 }
);

const system = createSequenceLifelineNode(
  {
    id: 'system',
    name: 'system: VehicleController',
    classifier: 'PartDefinition::VehicleController'
  },
  { x: 300, y: 0 }
);
```

## SysML v2 Best Practices

### Use Interaction Containers
Wrap lifelines in an Interaction node for proper SysML v2 structure.

```typescript
const interaction = createInteractionNode(
  {
    id: 'startup-interaction',
    name: 'System Startup',
    participants: ['Driver', 'Controller', 'Battery', 'Motors']
  },
  { x: 400, y: -100 }
);
```

### Name Lifelines with Type
Use the pattern `instanceName: TypeName` for clarity.

```typescript
name: 'controller: PowerController'  // ✅ Good
name: 'PowerController'              // ⚠️ Less clear
```

### Use Classifiers
Always specify the classifier to link to definitions.

```typescript
classifier: 'PartDefinition::PowerController'
classifier: 'Actor::Driver'
classifier: 'InterfaceDefinition::MotorControl'
```

### Message Naming Conventions
- **Synchronous:** Use method call syntax: `methodName(params)`
- **Asynchronous:** Use event names: `eventOccurred` or signals
- **Return:** Use result syntax: `ReturnType(value)`

```typescript
// Synchronous
label: 'calculatePower(voltage: 400V, current: 125A)'

// Asynchronous
label: 'faultDetected'
label: 'temperatureChanged(temp: 85C)'

// Return
label: 'PowerValue(50kW)'
label: 'Status(ready)'
```

### Guard Best Practices
- Keep guards concise and boolean
- Use meaningful condition names
- Place guards on the message that requires the condition

```typescript
guard: 'batteryCharged'                           // ✅ Clear
guard: 'availablePower >= requestedPower'         // ✅ Explicit
guard: 'safetyChecksPass && systemsInitialized'   // ✅ Combined
```

## Layout Recommendations

### Horizontal Spacing
Space lifelines 250-300px apart for readability.

```typescript
const lifeline1 = createSequenceLifelineNode(spec1, { x: 0, y: 0 });
const lifeline2 = createSequenceLifelineNode(spec2, { x: 280, y: 0 });
const lifeline3 = createSequenceLifelineNode(spec3, { x: 560, y: 0 });
```

### Vertical Alignment
Align all lifelines at the same y-coordinate (typically 0).

```typescript
// All lifelines start at y: 0
{ x: 0, y: 0 }
{ x: 280, y: 0 }
{ x: 560, y: 0 }
```

### Order of Participants
- Place actors/external systems on the left
- Place internal components in the middle
- Place subsystems on the right
- Order by typical message flow direction

```typescript
// Left to right: Actor → Controller → Subsystems
[Driver] → [PowerController] → [Battery] → [Motors]
```

## Rendering

Sequence diagrams are rendered with:
- **Rectangles with lifelines** for participants
- **Vertical dashed lines** representing time progression
- **Solid arrows** for synchronous messages
- **Open arrows** for asynchronous messages
- **Dashed arrows** for return messages
- **Guard labels** in square brackets
- **Message labels** above arrows

## Viewpoint Support

Use the `interactionViewpoint` to filter diagrams to show only interaction-related elements:

```typescript
import { interactionViewpoint, realizeViewpoint } from 'sysml-reactflow';

const model = {
  nodes: [/* all your nodes */],
  relationships: [/* all your edges */]
};

const view = realizeViewpoint(model, interactionViewpoint);

<SysMLDiagram model={model} viewpoint={interactionViewpoint} />
```

The interaction viewpoint filters for:
- Interaction nodes
- Lifeline nodes
- Sequence message edges
- Participants and actors

## Testing

Sequence diagram factories and messages are fully tested:

```bash
npm test src/factories.test.ts  # Includes sequence diagram tests
```

## References

- **SysML v2 Specification:** OMG ptc/24-02-03, Module 7 (Interactions)
- **Example:** `examples/sequence-diagram.tsx`
- **Storybook:** `SequenceDiagram` story
- **API Docs:** Factory function JSDoc comments

## Limitations

- No automatic vertical message spacing (positions must be specified)
- No animation/simulation (visualization only)
- No execution semantics
- No combined fragments (alt, loop, par) - planned for future
- No activation boxes on lifelines - planned for future

For full SysML v2 interaction execution and advanced fragments, consider tools built on [Eclipse SysML v2 API](https://github.com/Systems-Modeling/SysML-v2-Release).

## Common Use Cases

### 1. System Initialization Sequence
Show how a system boots up through component interactions.

### 2. User Interaction Flow
Model how users interact with the system through UI events.

### 3. Error Handling Scenarios
Document error detection, propagation, and recovery sequences.

### 4. Inter-Component Communication
Show message passing between distributed system components.

### 5. Protocol Verification
Verify communication protocols between system interfaces.

### 6. Safety-Critical Sequences
Document critical operational sequences with guards and conditions.

## Example: Error Handling

```typescript
// Normal flow
createSequenceMessageEdge({
  id: 'req',
  type: 'sync',
  source: 'controller',
  target: 'battery',
  label: 'requestPower(watts: 50000)'
})

// Success case
createSequenceMessageEdge({
  id: 'success',
  type: 'return',
  source: 'battery',
  target: 'controller',
  label: 'PowerGranted(50kW)',
  guard: 'availablePower >= requestedPower'
})

// Error case
createSequenceMessageEdge({
  id: 'error',
  type: 'async',
  source: 'battery',
  target: 'supervisor',
  label: 'powerLimitExceeded()',
  guard: 'availablePower < requestedPower'
})

// Recovery action
createSequenceMessageEdge({
  id: 'recovery',
  type: 'sync',
  source: 'supervisor',
  target: 'controller',
  label: 'reducePowerDemand(watts: 30000)'
})
```

---

**Last Updated:** 2025-10-27
**SysML v2 Specification:** OMG ptc/24-02-03
**Library Version:** 0.1.0
