# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-10-26

### Added

**Complete SysML v2.0 Implementation:**
- ✅ 63 SysML v2.0 node types covering all major metaclasses
- ✅ 35 relationship/edge types including all v2.0 relationship categories
- ✅ 54 factory functions following definition/usage pattern
- ✅ Comprehensive structural elements (16 types)
  - Part, Attribute, Port, Item, Connection, Interface, Allocation, Reference, Occurrence
  - All with Definition/Usage pairs
- ✅ Complete behavioral elements (14 types)
  - Action Definition/Usage, Activity Control, Calculation, Perform/Send/Accept/Assignment Actions
  - Control flow actions: If, For Loop, While Loop
  - State Definition/Usage, Transition, Exhibit State
- ✅ Requirements & cases (12 types)
  - Requirement, Constraint, Verification Case, Analysis Case, Use Case, Concern
  - All with Definition/Usage pairs
- ✅ Organizational & metadata (8 types)
  - Package, Library Package, Interaction, Sequence Lifeline
  - Metadata Definition/Usage, Comment, Documentation
- ✅ SysML v2 viewpoint system for diagram filtering
  - Structural Definition, Usage Structure, Behavior Control, Interaction, State, Requirement viewpoints
- ✅ Type-safe factory functions with exhaustive discriminated unions
- ✅ Professional styling with IBM Plex font and status indicators

**Package Infrastructure:**
- ✅ MIT License
- ✅ Dual format build (ESM + CJS) with TypeScript declarations
- ✅ Complete package.json metadata (repository, bugs, homepage)
- ✅ GitHub Actions CI/CD for Storybook
- ✅ Automated GitHub Pages deployment
- ✅ Comprehensive documentation with examples

### Removed

**⚠️ BREAKING CHANGES - SysML v1 Legacy Removal:**

All deprecated SysML v1 elements have been removed for pure v2.0 compliance:

**Removed Node Types (6):**
- ❌ `'block-definition'` → Use `'part-definition'` instead
- ❌ `'internal-block'` → Use `'part-usage'` with composition
- ❌ `'requirement'` → Use `'requirement-definition'` or `'requirement-usage'`
- ❌ `'parametric'` → Use `'constraint-definition'` or `'calculation-definition'`
- ❌ `'use-case'` → Use `'use-case-definition'` or `'use-case-usage'`
- ❌ `'activity'` → Use `'action-definition'` or `'action-usage'`

**Removed Spec Interfaces (5):**
- ❌ `SysMLBlockSpec` → Use `SysMLPartDefinitionSpec` / `SysMLPartUsageSpec`
- ❌ `SysMLRequirementSpec` → Use `SysMLRequirementDefinitionSpec` / `SysMLRequirementUsageSpec`
- ❌ `SysMLParametricSpec` → Use `SysMLConstraintDefinitionSpec` / `SysMLCalculationDefinitionSpec`
- ❌ `SysMLUseCaseSpec` → Use `SysMLUseCaseDefinitionSpec` / `SysMLUseCaseUsageSpec`
- ❌ `SysMLActivitySpec` → Use `SysMLActionDefinitionSpec` / `SysMLActionUsageSpec`

**Removed Factory Functions (5):**
- ❌ `createBlockNode()` → Use `createPartDefinitionNode()` or `createPartUsageNode()`
- ❌ `createRequirementNode()` → Use `createRequirementDefinitionNode()` or `createRequirementUsageNode()`
- ❌ `createParametricNode()` → Use `createConstraintDefinitionNode()` or `createCalculationDefinitionNode()`
- ❌ `createUseCaseNode()` → Use `createUseCaseDefinitionNode()` or `createUseCaseUsageNode()`
- ❌ `createActivityNode()` → Use `createActionDefinitionNode()` or `createActionUsageNode()`

### Changed

**Bundle Size Improvements:**
- 📦 ESM build reduced to 59.19 KB (2.6 KB smaller)
- 📦 CJS build reduced to 68.42 KB (1.5 KB smaller)
- 📄 Type declarations reduced to 31.03 KB (2.5 KB smaller)

**Updated Viewpoints:**
- `structuralDefinitionViewpoint` now includes `constraint-definition` and `calculation-definition` instead of `parametric`
- `requirementViewpoint` now includes both `requirement-definition` and `requirement-usage` instead of `requirement`
- `behaviorControlViewpoint` now uses `action-definition`, `action-usage`, and `perform-action` instead of `activity`
- `usageStructureViewpoint` removed `activity`, now focuses on pure usages

## Migration Guide from v0.0.x

### Before (SysML v1 style):
```typescript
import { createRequirementNode, createBlockNode } from 'sysml-reactflow';

const req = createRequirementNode({
  id: 'REQ-1',
  name: 'My Requirement',
  text: 'The system shall...',
  verification: 'test',
  risk: 'high'
});

const block = createBlockNode({
  id: 'BLK-1',
  name: 'MyBlock',
  parts: [{ name: 'part1', type: 'PartType' }]
});
```

### After (Pure SysML v2.0):
```typescript
import { createRequirementUsageNode, createPartDefinitionNode } from 'sysml-reactflow';

const req = createRequirementUsageNode({
  id: 'REQ-1',
  name: 'My Requirement',
  text: 'The system shall...',
  status: 'reviewed'
});

const part = createPartDefinitionNode({
  id: 'PART-1',
  name: 'MyPart',
  attributes: ['part1: PartType']
});
```

## [0.0.x] - Historical (Legacy)

Previous versions contained SysML v1 legacy elements. For pure SysML v2.0 compliance, upgrade to v0.1.0+.

---

**Status:** Production-ready for pure SysML v2.0 projects
**SysML v2.0 Specification:** OMG ptc/24-02-03
**Compliance:** 100% pure SysML v2.0 with zero legacy elements
