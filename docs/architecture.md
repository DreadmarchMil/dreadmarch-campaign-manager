# Architecture Overview

This document provides a high-level overview of the Dreadmarch Campaign Manager architecture, explaining how the core modules interact and how data flows through the system.

## Table of Contents

- [System Overview](#system-overview)
- [Core Concepts](#core-concepts)
- [Module Architecture](#module-architecture)
- [Data Flow](#data-flow)
- [Component Interactions](#component-interactions)
- [Extension Points](#extension-points)

## System Overview

The Dreadmarch Campaign Manager is a client-side web application for managing tabletop RPG campaigns. It provides:

- **Interactive galactic map** with system visualization
- **State management** for tracking selections, modes, and data
- **Dataset handling** for managing system, route, and sector information
- **Panel system** for displaying and editing information
- **Real-time collaboration** (planned feature for multi-user scenarios)

### Technology Stack

- **Pure JavaScript (ES5)** - For maximum browser compatibility
- **DOM manipulation** - Direct DOM APIs, no framework dependencies
- **SVG graphics** - For map rendering and route visualization
- **Jest** - Testing framework with jsdom environment

## Core Concepts

### Module System

The application uses a namespace-based module system built on IIFEs (Immediately Invoked Function Expressions):

```javascript
;(function () {
  "use strict";
  
  if (!window.DM4) {
    window.DM4 = {};
  }
  var DM4 = window.DM4;
  
  // Module code here
  DM4.myModule = { /* API */ };
})();
```

All modules attach to the global `DM4` namespace to avoid conflicts and provide a clear API surface.

### State Management Pattern

The application uses a centralized state management pattern with:

- **Single source of truth**: All application state lives in one place
- **Immutable updates**: State changes create new objects rather than mutating
- **Subscription system**: Components subscribe to state changes
- **Scoped notifications**: Components only receive updates for relevant data
- **Batched updates**: Multiple rapid changes are aggregated to improve performance

### Dataset Architecture

Datasets contain all the galactic map data:

- **Systems**: Star systems with coordinates, names, sectors, and metadata
- **Routes**: Hyperlanes connecting systems (major, medium, minor)
- **Sectors**: Regional groupings of systems
- **Grid**: Galactic coordinate grid system
- **Metadata**: Dataset version, description, and rendering hints

Datasets are normalized on load to ensure consistent structure.

## Module Architecture

### Module Loading Order

Modules load in a specific order to ensure dependencies are available:

```
1. dm4-runtime.js          - Core runtime initialization
2. dm4-logger.js           - Logging utilities (if present)
3. dm4-dataset-core.js     - Dataset normalization
4. dm4-dataset-main.js     - Main dataset definitions
5. dm4-style-core.js       - Styling and palette
6. dm4-state.js            - State management
7. dm4-map-layers.js       - Map rendering
8. Panel modules           - UI panels (identity, editor, test)
9. dm4-ui-controlbar.js    - Control bar UI
10. dm4-panels-registry.js - Panel registration and management
11. dreadmarch-viewer4.js  - Main viewer bootstrap
```

### Core Modules

#### dm4-runtime.js
- Initializes the `DM4` namespace
- Sets up configuration
- Establishes debug mode

#### dm4-dataset-core.js
- **Exports**: `DM4.dataset.normalize(rawDataset)`
- **Purpose**: Normalizes raw dataset into consistent format
- **Key function**: Consolidates system data from multiple sources

**Normalization process**:
```
Raw Dataset (scattered data)
    ↓
Normalize coords from system_pixels/endpoint_pixels
    ↓
Normalize grid from system_grid
    ↓
Normalize sector from sectors reverse lookup
    ↓
Normalized Dataset (consolidated data)
```

#### dm4-state.js
- **Exports**: `DM4.state.createStateManager(config, dataset, campaign)`
- **Purpose**: Centralized state management with subscriptions
- **Key concepts**:
  - Immutable state updates
  - Scoped subscriptions (`['selection']`, `['editor', 'jobs']`, etc.)
  - Batch notifications (10ms debounce)

**State structure**:
```javascript
{
  config: {},              // Application configuration
  dataset: { systems: {} }, // Galactic data
  campaign: {},            // Campaign-specific data
  access: {},              // User permissions
  selection: {             // Current selection
    system: null
  },
  mode: "navcom",          // UI mode
  editor: {                // Editor state
    enabled: false,
    jobs: []
  }
}
```

**Action examples**:
- `actions.selectSystem(systemId)` - Select a system
- `actions.setMode(mode)` - Change UI mode
- `actions.setDataset(dataset)` - Load new dataset

#### dm4-map-layers.js
- **Exports**: Map layer factory functions
- **Purpose**: Renders visual map layers
- **Layers** (bottom to top):
  1. Graticule (grid lines)
  2. Routes (hyperlanes)
  3. Systems (markers)
  4. Labels (system names)

**Key functions**:
- `createSystemMarkersLayer()` - System position markers
- `createSystemLabelsLayer()` - System name labels
- `createRouteLayer()` - Hyperlane lines
- `createGraticuleLayer()` - Background grid

#### dm4-panels-registry.js
- **Exports**: `DM4.panels.createPanelRegistry(state)`
- **Purpose**: Manages panel lifecycle and activation
- **Panel contract**: All panels must implement:
  - `render(rootEl, state)` - Render panel content
  - `destroy()` - Clean up when deactivated

#### dreadmarch-viewer4.js
- **Exports**: `window.DreadmarchViewer4.bootstrap()`
- **Purpose**: Main application bootstrap and layout
- **Responsibilities**:
  - Initialize state manager
  - Create map layers
  - Set up panels
  - Wire up UI controls
  - Handle window resize

## Data Flow

### Application Startup

```
1. Load index.html
   ↓
2. Load module scripts in order
   ↓
3. Load dataset (window.DM4_DATASETS.arbra)
   ↓
4. Call DM4_startViewerWithDataset('arbra')
   ↓
5. Bootstrap viewer:
   - Normalize dataset
   - Create state manager
   - Initialize map layers
   - Set up panels
   - Render UI
```

### User Interaction Flow

#### Selecting a System

```
User clicks system marker
   ↓
Click handler calls state.actions.selectSystem(id)
   ↓
State creates new state with updated selection
   ↓
batchNotify(['selection']) queues notification
   ↓
After 10ms, subscribers to 'selection' scope are notified
   ↓
Identity panel re-renders with new selection
Map markers update visual selection indicator
```

#### Changing Dataset

```
User clicks dataset button
   ↓
Button handler calls DM4_startViewerWithDataset(datasetId)
   ↓
Bootstrap clears existing viewer
   ↓
New dataset is normalized
   ↓
New state manager created with new dataset
   ↓
All panels re-initialize with new state
```

## Component Interactions

### Map Layer ↔ State

Map layers subscribe to state and update visually:

```javascript
// In createSystemMarkersLayer
state.subscribe(function (st) {
  // Update marker selection highlighting
  renderSelection(st);
}, ['selection']);  // Only notified when selection changes
```

When user clicks a marker:

```javascript
marker.addEventListener('click', function (e) {
  state.actions.selectSystem(systemId);
  
  // Optionally activate editor panel if in editor mode
  if (state.getState().editor.enabled) {
    panelRegistry.activatePanel('editor');
  }
});
```

### Panel ↔ State

Panels subscribe to relevant state scopes:

```javascript
// Identity panel subscribes to selection changes
state.subscribe(function (st) {
  renderIdentity(st);
}, ['selection']);
```

Panels can trigger actions:

```javascript
// Editor panel modifies dataset
editButton.addEventListener('click', function () {
  state.actions.addEditorJob({
    type: 'updateSystem',
    systemId: 'sol',
    changes: { name: 'New Name' }
  });
});
```

### Panel Registry ↔ Control Bar

Control bar manages which panel is active:

```javascript
// Control bar buttons activate panels
navcomButton.addEventListener('click', function () {
  panelRegistry.activatePanel('identity');
});

editorButton.addEventListener('click', function () {
  panelRegistry.activatePanel('editor');
});
```

Panel registry handles activation lifecycle:

```javascript
function activatePanel(panelId) {
  // Destroy current panel
  if (currentPanel) {
    currentPanel.destroy();
  }
  
  // Create and render new panel
  var panel = panels[panelId];
  panel.render(containerElement, state);
  currentPanel = panel;
}
```

## Extension Points

### Adding a New Panel

1. **Create panel module** (`dm4-panels-myfeature.js`):

```javascript
;(function () {
  if (!window.DM4) return;
  var DM4 = window.DM4;
  
  function MyFeaturePanel(core) {
    var unsubscribe = null;
    
    return {
      render: function (rootEl, state) {
        // Set up UI
        unsubscribe = state.subscribe(function (st) {
          // Update on state changes
        });
      },
      
      destroy: function () {
        if (unsubscribe) unsubscribe();
      }
    };
  }
  
  if (!DM4.panels) DM4.panels = {};
  DM4.panels.MyFeaturePanel = MyFeaturePanel;
})();
```

2. **Register in dm4-panels-registry.js**:

```javascript
var panels = {
  identity: IdentityPanel(core),
  editor: EditorPanel(core),
  myfeature: MyFeaturePanel(core)  // Add here
};
```

3. **Add control button** in `dreadmarch-viewer4.js`:

```javascript
var myButton = document.createElement('button');
myButton.textContent = 'My Feature';
myButton.addEventListener('click', function () {
  panelRegistry.activatePanel('myfeature');
});
controlBar.appendChild(myButton);
```

### Adding a New State Action

1. **Add action** in `dm4-state.js`:

```javascript
const actions = {
  // ... existing actions ...
  
  myNewAction: function (param) {
    state = Object.assign({}, state, {
      myData: param
    });
    batchNotify(['myData']);
  }
};
```

2. **Subscribe to changes** in component:

```javascript
state.subscribe(function (st) {
  console.log('myData changed:', st.myData);
}, ['myData']);
```

3. **Call action** from UI:

```javascript
button.addEventListener('click', function () {
  state.actions.myNewAction('new value');
});
```

### Adding a New Map Layer

1. **Create layer factory** in `dm4-map-layers.js`:

```javascript
function createMyLayer(core) {
  var container = document.createElement('div');
  container.classList.add('dm-layer-my-feature');
  
  // Build layer content
  
  return {
    element: container,
    destroy: function () {
      // Cleanup
    }
  };
}
```

2. **Add to layer stack** in `dreadmarch-viewer4.js`:

```javascript
var myLayer = createMyLayer(core);
mapFrame.appendChild(myLayer.element);
```

## Best Practices

### State Management

- **Always use actions**: Never mutate state directly
- **Use scoped subscriptions**: Subscribe to the smallest scope needed
- **Avoid redundant subscriptions**: Don't subscribe to data you don't use
- **Unsubscribe on cleanup**: Always call the unsubscribe function when done

### Dataset Handling

- **Never mutate datasets**: Treat as immutable data
- **Use normalized format**: Always normalize raw datasets
- **Validate data**: Check for missing or malformed data
- **Provide fallbacks**: Return safe defaults when data is invalid

### Performance

- **Batch DOM updates**: Collect changes and update once
- **Use scoped subscriptions**: Avoid unnecessary re-renders
- **Debounce user input**: Don't react to every keystroke
- **Cache expensive calculations**: Store results, don't recalculate

### Error Handling

- **Use Logger**: Don't use `console.*` directly
- **Provide context**: Include useful debugging information
- **Fail gracefully**: Don't crash the whole app on errors
- **Log and continue**: Log errors but keep the app functional

## Troubleshooting

### Common Issues

**Problem**: Panel not updating when state changes
- **Check**: Is the panel subscribing to the correct scope path?
- **Check**: Is the action calling `batchNotify()` with the right scope?
- **Check**: Is the panel rendering the updated data correctly?

**Problem**: State changes not triggering updates
- **Check**: Are you using actions or mutating state directly?
- **Check**: Did you call `batchNotify()` after the state change?
- **Check**: Is the subscription scope matching the change scope?

**Problem**: Dataset not loading correctly
- **Check**: Is the dataset being normalized with `DM4.dataset.normalize()`?
- **Check**: Does the dataset have the expected structure (systems, routes, etc.)?
- **Check**: Are there console errors about missing data?

**Problem**: Map layers not rendering
- **Check**: Is the module load order correct?
- **Check**: Are the layer elements being appended to the DOM?
- **Check**: Do systems have valid coords in the dataset?

## Further Reading

- [README.md](../README.md) - Project overview and setup
- [CONTRIBUTING.md](../CONTRIBUTING.md) - Contribution guidelines
- [Dreadmarch_Development_Protocol_v1.5.txt](../Dreadmarch_Development_Protocol_v1.5.txt) - Detailed development rules
- Source code comments - Inline documentation in core modules
