# Full Dependency Graph Mapping for DM4 Modules

This document outlines the dependencies between modules in the `Dreadmarch Campaign Manager` project. It highlights the roles of each module, their key imports and exports, and their interactions through the shared `DM4` global object. The goal is to provide a clear understanding of how modules collaborate within the codebase.

## Module Breakdown

### `dm4-state.js`
- **Role**: Manages application-wide state and provides utilities for accessing and updating state.
- **Key Imports**:
  - Various utility functions from `dm4-utils.js`.
- **Key Exports**:
  - State management functions like `getState`, `setState`.
- **Interactions with `DM4`**:
  - Writes to the `DM4.State` namespace for storing and accessing global state.

### `dm4-dataset-core.js`
- **Role**: Defines the core dataset structures and provides fundamental data manipulation utilities.
- **Key Imports**:
  - State management utilities from `dm4-state.js`.
- **Key Exports**:
  - Core dataset utilities like `createDataset`, `updateDataset`.
- **Interactions with `DM4`**:
  - Registers core dataset functions under `DM4.Dataset.Core`.

### `dm4-dataset-main.js`
- **Role**: Provides higher-level operations on datasets, combining core utilities with specific logic.
- **Key Imports**:
  - Core dataset utilities from `dm4-dataset-core.js`.
- **Key Exports**:
  - High-level dataset functions like `loadDataset`, `syncDataset`.
- **Interactions with `DM4`**:
  - Registers higher-level dataset functions under `DM4.Dataset.Main`.

### Inter-Module Import/Export Relationships
```
[dm4-state.js] -->
    Provides global state functions to
        [dm4-dataset-core.js]
            Provides core dataset utilities to
                [dm4-dataset-main.js]
```

### `DM4` Global Object Interaction
```
DM4
├── State
│   └── getState, setState
├── Dataset
│   ├── Core
│   │   ├── createDataset
│   │   └── updateDataset
│   └── Main
│       ├── loadDataset
│       └── syncDataset
```

## Summary
This document presents a high-level overview of how modules interact within the `Dreadmarch Campaign Manager` codebase. The hierarchical structure underscores the layered dependencies and the shared use of the `DM4` global object for namespace registration.