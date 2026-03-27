/**
 * Derive — Remote Weapon Station (RWS) Diagrams
 *
 * Three architecture diagrams sourced from the Derive SE platform
 * (derive.airgen.studio) for the Remote Weapon Station project:
 *
 *   1. Context Diagram — system boundary with actors and external systems
 *   2. Decomposition Diagram — subsystem breakdown with internal flows
 *   3. Safety Interlock System — internal component view
 */
import { ReactFlowProvider } from 'reactflow';

import { SysMLDiagram, createEdgesFromRelationships, createNodesFromSpecs } from '../src';

// ============================================================================
// 1. RWS Context Diagram
// ============================================================================

const contextNodes = createNodesFromSpecs([
  {
    kind: 'part-definition',
    spec: {
      id: 'rws-system',
      name: 'Remote Weapon Station (RWS)',
      stereotype: 'system',
      description: 'Remotely operated weapon station mounted on a host vehicle platform.',
      ports: [
        { name: 'commandIn', type: 'OperatorCommand', direction: 'in' },
        { name: 'sensorVideo', type: 'VideoStream', direction: 'out' },
        { name: 'powerIn', type: '28VDC', direction: 'in' },
        { name: 'ammoFeed', type: 'BeltedAmmo', direction: 'in' },
        { name: 'navIn', type: 'GPS/Heading', direction: 'in' },
        { name: 'tdlIn', type: 'TargetHandoff', direction: 'in' },
        { name: 'tdlOut', type: 'EngagementData', direction: 'out' }
      ]
    }
  },
  {
    kind: 'part-usage',
    spec: {
      id: 'actor-commander',
      name: 'Vehicle Commander',
      stereotype: 'actor',
      description: 'Primary operator issuing commands and receiving sensor video.'
    }
  },
  {
    kind: 'part-usage',
    spec: {
      id: 'actor-infantry',
      name: 'Dismounted Infantry',
      stereotype: 'actor',
      description: 'Receives fire support and hazard zone alerts from the RWS.'
    }
  },
  {
    kind: 'part-usage',
    spec: {
      id: 'actor-maintainer',
      name: 'Weapons Maintainer',
      stereotype: 'actor',
      description: 'Performs maintenance and diagnostics on the weapon station.'
    }
  },
  {
    kind: 'part-definition',
    spec: {
      id: 'ext-vehicle',
      name: 'Host Vehicle Platform',
      stereotype: 'external',
      description: 'Provides 28VDC power, CAN-bus interface, and physical mounting.'
    }
  },
  {
    kind: 'part-definition',
    spec: {
      id: 'ext-tdl',
      name: 'Tactical Data Link',
      stereotype: 'external',
      description: 'Network for target handoff, BFT, and rules of engagement.'
    }
  },
  {
    kind: 'part-definition',
    spec: {
      id: 'ext-ammo',
      name: 'Ammunition Supply',
      stereotype: 'external',
      description: 'Belted ammunition feed mechanism.'
    }
  },
  {
    kind: 'part-definition',
    spec: {
      id: 'ext-gps',
      name: 'GPS / Navigation',
      stereotype: 'external',
      description: 'Provides position and heading data.'
    }
  }
]);

const contextEdges = createEdgesFromRelationships([
  { id: 'ctx-e1', type: 'flow-connection', source: 'actor-commander', target: 'rws-system', label: 'Commands, target designation' },
  { id: 'ctx-e2', type: 'flow-connection', source: 'rws-system', target: 'actor-commander', label: 'Sensor video, weapon status, BIT' },
  { id: 'ctx-e3', type: 'flow-connection', source: 'ext-vehicle', target: 'rws-system', label: '28VDC power, CAN-bus, mounting' },
  { id: 'ctx-e4', type: 'flow-connection', source: 'rws-system', target: 'ext-tdl', label: 'Sensor imagery, engagement data' },
  { id: 'ctx-e5', type: 'flow-connection', source: 'ext-tdl', target: 'rws-system', label: 'Target handoff, BFT, ROE' },
  { id: 'ctx-e6', type: 'flow-connection', source: 'ext-ammo', target: 'rws-system', label: 'Belted ammunition feed' },
  { id: 'ctx-e7', type: 'flow-connection', source: 'ext-gps', target: 'rws-system', label: 'Position, heading' },
  { id: 'ctx-e8', type: 'flow-connection', source: 'actor-maintainer', target: 'rws-system', label: 'Maintenance, diagnostics' },
  { id: 'ctx-e9', type: 'flow-connection', source: 'rws-system', target: 'actor-infantry', label: 'Fire support, hazard zone' }
]);

export const RWSContextDiagram = () => (
  <ReactFlowProvider>
    <div style={{ width: '100%', height: 700 }}>
      <SysMLDiagram nodes={contextNodes} edges={contextEdges} fitView />
    </div>
  </ReactFlowProvider>
);

// ============================================================================
// 2. RWS Decomposition Diagram
// ============================================================================

const decompositionNodes = createNodesFromSpecs([
  {
    kind: 'part-definition',
    spec: {
      id: 'rws-top',
      name: 'Remote Weapon Station (RWS)',
      stereotype: 'system',
      description: 'Top-level system comprising eight subsystems.'
    }
  },
  {
    kind: 'part-usage',
    spec: {
      id: 'sub-eosa',
      name: 'Electro-Optical Sensor Assembly (EOSA)',
      stereotype: 'subsystem',
      description: 'Provides sensor video and target tracking data to the FCS.'
    }
  },
  {
    kind: 'part-usage',
    spec: {
      id: 'sub-fcs',
      name: 'Fire Control System (FCS)',
      stereotype: 'subsystem',
      description: 'Core processing: ballistic computation, target tracking, engagement logic.'
    }
  },
  {
    kind: 'part-usage',
    spec: {
      id: 'sub-tda',
      name: 'Turret Drive Assembly (TDA)',
      stereotype: 'subsystem',
      description: 'Servo-driven azimuth and elevation positioning of the weapon mount.'
    }
  },
  {
    kind: 'part-usage',
    spec: {
      id: 'sub-ocu',
      name: 'Operator Control Unit (OCU)',
      stereotype: 'subsystem',
      description: 'Operator interface: displays, hand grips, control panel.'
    }
  },
  {
    kind: 'part-usage',
    spec: {
      id: 'sub-sis',
      name: 'Safety Interlock System (SIS)',
      stereotype: 'subsystem',
      description: 'Hardware and software safety interlocks for firing and drive control.',
    }
  },
  {
    kind: 'part-usage',
    spec: {
      id: 'sub-wah',
      name: 'Weapon and Ammo Handling (WAH)',
      stereotype: 'subsystem',
      description: 'Weapon mount, feed mechanism, and ammunition management.'
    }
  },
  {
    kind: 'part-usage',
    spec: {
      id: 'sub-pdu',
      name: 'Power Distribution Unit (PDU)',
      stereotype: 'subsystem',
      description: 'Converts and distributes 28V/12V/5V power rails to all subsystems.'
    }
  },
  {
    kind: 'part-usage',
    spec: {
      id: 'sub-ciu',
      name: 'Communications Interface Unit (CIU)',
      stereotype: 'subsystem',
      description: 'External data link interface: GPS, BMS, video export.'
    }
  }
]);

const decompositionEdges = createEdgesFromRelationships([
  // Composition from system to subsystems
  { id: 'dec-comp1', type: 'composition', source: 'rws-top', target: 'sub-eosa' },
  { id: 'dec-comp2', type: 'composition', source: 'rws-top', target: 'sub-fcs' },
  { id: 'dec-comp3', type: 'composition', source: 'rws-top', target: 'sub-tda' },
  { id: 'dec-comp4', type: 'composition', source: 'rws-top', target: 'sub-ocu' },
  { id: 'dec-comp5', type: 'composition', source: 'rws-top', target: 'sub-sis' },
  { id: 'dec-comp6', type: 'composition', source: 'rws-top', target: 'sub-wah' },
  { id: 'dec-comp7', type: 'composition', source: 'rws-top', target: 'sub-pdu' },
  { id: 'dec-comp8', type: 'composition', source: 'rws-top', target: 'sub-ciu' },
  // Internal data flows
  { id: 'dec-e1', type: 'flow-connection', source: 'sub-eosa', target: 'sub-fcs', label: 'Sensor video, target data' },
  { id: 'dec-e2', type: 'flow-connection', source: 'sub-fcs', target: 'sub-tda', label: 'Servo commands, pointing' },
  { id: 'dec-e3', type: 'flow-connection', source: 'sub-fcs', target: 'sub-sis', label: 'Fire request, arm status' },
  { id: 'dec-e4', type: 'flow-connection', source: 'sub-sis', target: 'sub-wah', label: 'Fire enable/inhibit' },
  { id: 'dec-e5', type: 'flow-connection', source: 'sub-sis', target: 'sub-tda', label: 'Drive enable, brake cmd' },
  { id: 'dec-e6', type: 'flow-connection', source: 'sub-ocu', target: 'sub-fcs', label: 'Operator commands' },
  { id: 'dec-e7', type: 'flow-connection', source: 'sub-fcs', target: 'sub-ocu', label: 'Display data, video' },
  { id: 'dec-e8', type: 'flow-connection', source: 'sub-ocu', target: 'sub-sis', label: 'E-STOP, arm/safe' },
  { id: 'dec-e9', type: 'flow-connection', source: 'sub-ciu', target: 'sub-fcs', label: 'GPS, BMS target data' },
  { id: 'dec-e10', type: 'flow-connection', source: 'sub-fcs', target: 'sub-ciu', label: 'Video export, status' },
  // Power distribution (dependency style)
  { id: 'dec-p1', type: 'dependency', source: 'sub-eosa', target: 'sub-pdu', label: '28V/12V/5V power' },
  { id: 'dec-p2', type: 'dependency', source: 'sub-fcs', target: 'sub-pdu', label: '12V/5V power' },
  { id: 'dec-p3', type: 'dependency', source: 'sub-tda', target: 'sub-pdu', label: '28V drive power' }
]);

export const RWSDecompositionDiagram = () => (
  <ReactFlowProvider>
    <div style={{ width: '100%', height: 800 }}>
      <SysMLDiagram nodes={decompositionNodes} edges={decompositionEdges} fitView />
    </div>
  </ReactFlowProvider>
);

// ============================================================================
// 3. Safety Interlock System — Internal Block Diagram
// ============================================================================

const safetyNodes = createNodesFromSpecs([
  {
    kind: 'part-usage',
    spec: {
      id: 'comp-safety-ctrl',
      name: 'Dual-Channel Safety Controller',
      stereotype: 'component',
      description: 'Redundant dual-channel processor evaluating all interlock conditions.',
      attributes: [
        { name: 'channelA', type: 'SafetyChannel' },
        { name: 'channelB', type: 'SafetyChannel' },
        { name: 'diagnosticCoverage', type: 'Real', value: '≥ 99%' }
      ],
      ports: [
        { name: 'armKeyIn', type: '28VDC', direction: 'in' },
        { name: 'eStopIn', type: 'DiscreteSignal', direction: 'in' },
        { name: 'fireEnableOut', type: 'DualChannel', direction: 'out' },
        { name: 'brakeInhibitOut', type: 'Command', direction: 'out' }
      ],
    }
  },
  {
    kind: 'part-usage',
    spec: {
      id: 'comp-firing-relay',
      name: 'Hardware Firing Interlock Relay',
      stereotype: 'component',
      description: 'Electromechanical relay requiring dual-channel fire-enable to close.',
      attributes: [
        { name: 'relayType', type: 'ForcedGuided' },
        { name: 'contactRating', type: 'String', value: '28VDC/10A' }
      ],
      ports: [
        { name: 'fireEnableIn', type: 'DualChannel', direction: 'in' }
      ]
    }
  },
  {
    kind: 'part-usage',
    spec: {
      id: 'comp-arming-key',
      name: 'Arming Key Switch Assembly',
      stereotype: 'component',
      description: 'Physical key switch providing arm/safe status signal at 28VDC.',
      attributes: [
        { name: 'positions', type: 'String', value: 'SAFE / ARM' }
      ],
      ports: [
        { name: 'armKeyStatus', type: '28VDC', direction: 'out' }
      ]
    }
  },
  {
    kind: 'part-usage',
    spec: {
      id: 'comp-estop-watchdog',
      name: 'E-stop and Link Watchdog Module',
      stereotype: 'component',
      description: 'Monitors emergency stop and communication link watchdog signals.',
      attributes: [
        { name: 'watchdogTimeout', type: 'Duration', value: '500 ms' }
      ],
      ports: [
        { name: 'eStopWatchdog', type: 'DiscreteSignal', direction: 'out' }
      ]
    }
  },
  {
    kind: 'part-usage',
    spec: {
      id: 'comp-safe-state-driver',
      name: 'Safe State Output Driver',
      stereotype: 'component',
      description: 'Drives brake and inhibit outputs to TDA and WAH on safety trip.',
      ports: [
        { name: 'brakeInhibitIn', type: 'Command', direction: 'in' }
      ]
    }
  }
]);

const safetyEdges = createEdgesFromRelationships([
  { id: 'saf-e1', type: 'flow-connection', source: 'comp-arming-key', target: 'comp-safety-ctrl', label: 'arm-key-status (28VDC)' },
  { id: 'saf-e2', type: 'flow-connection', source: 'comp-estop-watchdog', target: 'comp-safety-ctrl', label: 'E-STOP + watchdog signal' },
  { id: 'saf-e3', type: 'flow-connection', source: 'comp-safety-ctrl', target: 'comp-firing-relay', label: 'fire-enable (dual-channel)' },
  { id: 'saf-e4', type: 'flow-connection', source: 'comp-safety-ctrl', target: 'comp-safe-state-driver', label: 'brake + inhibit command' }
]);

export const SafetyInterlockDiagram = () => (
  <ReactFlowProvider>
    <div style={{ width: '100%', height: 600 }}>
      <SysMLDiagram nodes={safetyNodes} edges={safetyEdges} fitView />
    </div>
  </ReactFlowProvider>
);
