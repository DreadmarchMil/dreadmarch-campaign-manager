# Project Knowledge Base - Dreadmarch Campaign Manager

**Purpose:** AI reference for complete project understanding  
**Last Updated:** 2025-12-16  
**Protocol Version:** v1.6  
**Update Policy:** Update when Protocol Section 6.2 applies (structural/architectural changes)

---

## 1. Quick Facts

### System Identity
- **Name:** Dreadmarch Campaign Manager
- **Type:** Modular, offline-capable galactic campaign viewer and editor
- **Domain:** Star Wars tabletop RPG campaign management
- **Architecture:** Client-side web application, namespace-based modules

### Technology Stack
- **JavaScript:** ES5 syntax only (var, function, no arrows, no template literals)
- **Module Pattern:** IIFE with `window.DM4` global namespace
- **DOM:** Direct manipulation, no frameworks
- **Graphics:** SVG for map rendering
- **Testing:** Jest with jsdom
- **Browser Support:** Chrome/Edge 90+, Firefox 88+, Safari 14+

### File Count
- **Total modules:** 13 (must load in exact order)
- **Core modules:** 6 (`src/core/`)
- **Component modules:** 7 (`src/components/`)
- **Utility modules:** 1 (`src/utils/`)
- **Test files:** 5 (`src/tests/`)

### Module Loading Order (CRITICAL - Protocol 5.4)
```
1.  dm4-runtime.js          → Namespace initialization
2.  dm4-logger.js           → Logging utilities
3.  dm4-dataset-core.js     → Dataset normalization
4.  dm4-dataset-main.js     → Dataset definitions
5.  dm4-style-core.js       → Style contract
6.  dm4-state.js            → State management
7.  dm4-map-layers.js       → Map rendering
8.  dm4-panels-identity.js  → Identity panel
9.  dm4-panels-test.js      → Test panel
10. dm4-panels-registry.js  → Panel lifecycle
11. dm4-panels-editor.js    → Editor panel
12. dm4-ui-controlbar.js    → Control bar
13. dreadmarch-viewer4.js   → Bootstrap
```
**Any deviation from this order causes fatal errors.**

### Protocol Red Flags (NEVER DO)
- ❌ Use const/let/arrow functions/template literals (ES5 only - Protocol 5.6)
- ❌ Use `console.*` directly (use `DM4.Logger` - Protocol 8.2)
- ❌ Create duplicate logic (Protocol 0.2)
- ❌ Mutate state directly (use actions - Protocol 2.1)
- ❌ Add dataset fields without approval (Protocol 1.4)
- ❌ Change module loading order (Protocol 5.4)
- ❌ Use inline styles or ad-hoc text classes (Protocol 3.1, 3.2)
- ❌ Mutate datasets outside DB5 patch system (Protocol 4.1)

---

## 2. File Inventory

### Root Directory
| File | Size | Purpose |
|------|------|---------|
| `index.html` | ~63KB | Entry point, embedded datasets |
| `Dreadmarch_Development_Protocol_v1.6.txt` | 16KB | Complete ruleset |
| `ai-collaboration-guide.md` | 9KB | AI collaboration procedures |
| `README.md` | 14KB | Project overview |
| `CONTRIBUTING.md` | 10KB | Contributor guidelines |
| `package.json` | 418B | NPM config (Jest) |
| `jest.config.js` | 244B | Jest configuration |

### src/core/ (Core Logic)
| File | Lines | Exports | Dependencies |
|------|-------|---------|--------------|
| `dm4-runtime.js` | 17 | `DM4`, `DM4.config` | None |
| `dm4-logger.js` | 91 | `DM4.Logger` | DM4 |
| `dm4-dataset-core.js` | 508 | `DM4.dataset. normalize`, `.clearCache`, `.getCacheStats` | DM4.Logger |
| `dataset-normalizer.worker.js` | ~100 | Web Worker API | None |
| `dm4-dataset-main.js` | ~3000 | `window.DM4_DATASETS` | None |
| `dm4-state.js` | 430 | `DM4.state.createStateManager` | DM4.Logger |

### src/components/ (UI Components)
| File | Lines | Exports | Dependencies |
|------|-------|---------|--------------|
| `dm4-map-layers.js` | ~600 | `DM4.map.create*Layer` functions | DM4.state, DM4.Logger |
| `dm4-panels-identity.js` | ~500 | `DM4.panels. IdentityPanel` | DM4.state, DM4.Logger |
| `dm4-panels-editor.js` | 659 | `DM4.panels.EditorPanel`, `DM4.editor. PanelFactory` | DM4.state, DM4.Logger |
| `dm4-panels-test.js` | ~70 | `DM4.panels.TestPanel` | DM4.state |
| `dm4-panels-registry.js` | ~150 | `DM4.panels.createPanelRegistry` | DM4.Logger, panel modules |
| `dm4-ui-controlbar.js` | ~80 | `DM4.ui.initControlBar` | DM4.state |
| `dreadmarch-viewer4.js` | ~1800 | `window.DreadmarchViewer4.bootstrap` | All modules |

### src/utils/ (Utilities)
| File | Lines | Exports | Dependencies |
|------|-------|---------|--------------|
| `dm4-style-core.js` | 117 | `DM4.style.*` functions | DM4.Logger |

### src/tests/ (Tests)
| File | Purpose |
|------|---------|
| `dm4-dataset-core.test.js` | Dataset normalization tests |
| `dm4-dataset-core-enhanced.test.js` | Caching and performance tests |
| `dm4-dataset-core-integration.test.js` | Integration tests |
| `dm4-state.test.js` | State manager tests |
| `dm4-state-test.html` | Manual browser test page |

### docs/ (Documentation)
| File | Purpose |
|------|---------|
| `architecture.md` | High-level architecture (human-readable) |
| `dataset-normalization-api.md` | Dataset API documentation |
| `project-knowledge-base.md` | THIS FILE (AI reference) |

### guidance/
| File | Purpose |
|------|---------|
| `governance-principles.md` | Governance framework |

---

## 3. Module APIs

### dm4-runtime.js

**Location:** `src/core/dm4-runtime.js` (17 lines)  
**Load Order:** 1 (first)  
**Exports:** `window.DM4`, `DM4.config`  
**Dependencies:** None

```javascript
// Establishes global namespace
window.DM4 = {}
DM4.config = {
  debug: boolean  // Default:  true
}

// Usage
if (DM4.config.debug) {
  // Debug-only code
}
```

---

### dm4-logger.js

**Location:** `src/core/dm4-logger.js` (91 lines)  
**Load Order:** 2  
**Exports:** `DM4.Logger`  
**Dependencies:** DM4 namespace

```javascript
DM4.Logger = {
  log: function(message, ... args),         // General logging
  warn: function(message, ...args),        // Warnings
  error: function(message, ...args),       // Non-fatal errors
  critical: function(message, fallbackFn, ...args), // Critical with fallback
  validate: function(condition, message)   // Validation helper
}

// Usage
DM4.Logger.log("[MODULE] Message", data);
DM4.Logger.warn("[MODULE] Warning", context);
DM4.Logger.error("[MODULE] Error", error);

var result = DM4.Logger.critical(
  "Critical error description",
  function() { return { safe: "default" }; }
);

DM4.Logger.validate(
  typeof value === 'string',
  "Value must be string"
);
```

**Message Format:** All prefixed with `[DREADMARCH]`, module prefix recommended

**Protocol Reference:** 8.1-8.6

---

### dm4-dataset-core.js

**Location:** `src/core/dm4-dataset-core.js` (508 lines)  
**Load Order:** 3  
**Exports:** `DM4.dataset.normalize`, `DM4.dataset.clearCache`, `DM4.dataset.getCacheStats`  
**Dependencies:** DM4.Logger

```javascript
// Synchronous normalization (default)
var normalized = DM4.dataset.normalize(rawDataset);

// Async with Web Worker
DM4.dataset.normalize(rawDataset, { async: true })
  .then(function(normalized) {
    // Use normalized dataset
  });

// Cache management
DM4.dataset. clearCache();
var stats = DM4.dataset.getCacheStats({ includeKeys: true });
// → { size: 2, keys: [... ] }
```

**Normalization Process:**
1. Validates input (returns `{ systems:  {} }` if invalid)
2. Checks cache (if enabled)
3. Consolidates coords from `system_pixels` or `endpoint_pixels`
4. Consolidates grid from `system_grid`
5. Builds sector reverse lookup from `sectors`
6. Returns normalized dataset with consolidated system objects

**Caching:**
- Small datasets (<100 systems): Full JSON. stringify key
- Large datasets (≥100 systems): Fingerprint key
- Configurable via options:  `{ cacheEnabled: true, cacheStrategy: 'auto'|'full'|'fingerprint' }`

**Web Worker:**
- File:  `dataset-normalizer.worker.js`
- Timeout: 5000ms
- Falls back to sync if unavailable or timeout

**Input Format:**
```javascript
{
  systems: { systemId: { name, ...  } },
  system_pixels: { systemId: [x, y] },
  system_grid: { systemId: { col, row, grid } },
  sectors: { sectorName: [systemId, ...] }
}
```

**Output Format:**
```javascript
{
  systems: {
    systemId: {
      // ...  original properties ... 
      coords: [x, y],           // Consolidated
      grid: { col, row, grid }, // Consolidated
      sector: "sectorName"      // Consolidated
    }
  },
  _normalizationErrors: [... ] // If any errors occurred
}
```

**Protocol Reference:** 1.1-1.5

---

### dm4-state.js

**Location:** `src/core/dm4-state. js` (430 lines)  
**Load Order:** 6  
**Exports:** `DM4.state.createStateManager(config, dataset, campaign)`  
**Dependencies:** DM4.Logger

```javascript
// Create state manager
var state = DM4.state.createStateManager(config, dataset, campaign);

// API
var currentState = state.getState();

var unsubscribe = state.subscribe(function(st) {
  // Called on state changes
}, ['selection']); // Optional scope

// Actions (only way to modify state)
state.actions.selectSystem(systemId);        // Select system (or null)
state.actions.setMode(mode);                 // 'navcom' or 'strategic'
state.actions.setDataset(dataset);           // Replace dataset
state.actions.setCampaign(campaign);         // Replace campaign
state.actions.setAccess(partial);            // Update access (partial merge)
state.actions.setEditorEnabled(boolean);     // Toggle editor
state. actions.addEditorJob(job);             // Add edit job
state.actions.clearEditorJobs();             // Clear all jobs
```

**State Structure:**
```javascript
{
  config: {},
  dataset: {
    systems: {},      // Normalized system data
    sectors: {},
    grid: {},
    metadata:  {}
  },
  campaign:  {},       // Campaign data (currently minimal)
  access: {},         // Access control (currently minimal)
  selection: {
    system: null      // Currently selected system ID
  },
  mode: "navcom",     // "navcom" | "strategic"
  editor: {
    enabled: false,   // Editor mode flag
    jobs: []          // Pending edit jobs
  }
}
```

**Subscription Scopes:**
- `[]` (empty) - Subscribe to all changes
- `['selection']` - Only selection changes
- `['mode']` - Only mode changes
- `['dataset']` - Only dataset changes
- `['editor']` - Editor state/jobs changes
- `['editor', 'jobs']` - Only editor jobs changes

**Batch Notifications:**
- 10ms debounce window
- Deduplicates subscriber calls
- Single notification with latest state

**Immutability:**
- All updates create new state objects
- Never mutate existing state
- Use `Object.assign({}, oldState, changes)`

**Protocol Reference:** 2.1 (single source of truth, immutability)

---

### dm4-map-layers.js

**Location:** `src/components/dm4-map-layers. js` (~600 lines)  
**Load Order:** 7  
**Exports:** `DM4.map.createGraticuleLayer`, `.createRouteLayer`, `.createSystemMarkersLayer`, `.createSystemLabelsLayer`  
**Dependencies:** DM4.state, DM4.Logger

```javascript
// Create layers (bottom to top order)
var graticule = DM4.map.createGraticuleLayer(core);
var routes = DM4.map.createRouteLayer(core);
var markers = DM4.map.createSystemMarkersLayer(core);
var labels = DM4.map.createSystemLabelsLayer(core);

// Each returns:  { element:  HTMLElement, destroy: function }

// Append to map
mapFrame.appendChild(graticule.element);
mapFrame.appendChild(routes.element);
mapFrame.appendChild(markers.element);
mapFrame.appendChild(labels.element);

// Cleanup
graticule.destroy();
routes.destroy();
markers.destroy();
labels.destroy();
```

**Layer Order (bottom to top):**
1. Graticule - Background grid lines
2. Routes - Hyperlane lines (major/medium/minor)
3. System Markers - Position indicators
4. System Labels - System names

**Behaviors:**
- Subscribe to `['selection']` scope
- Memoize last selection to avoid redundant updates
- Handle missing coords gracefully
- Markers are clickable (trigger `state.actions.selectSystem`)

**Route Types:**
- `major` - Thick blue lines
- `medium` - Medium cyan lines
- `minor` - Thin gray lines

**Protocol Reference:** 5.1, 2.1

---

### dm4-panels-editor.js

**Location:** `src/components/dm4-panels-editor.js` (659 lines)  
**Load Order:** 11  
**Exports:** `DM4.panels.EditorPanel`, `DM4.editor.PanelFactory`  
**Dependencies:** DM4.state, DM4.Logger

```javascript
var editorPanel = DM4.panels.EditorPanel(core);

// Panel contract
editorPanel.mount(hostElement);   // Render and subscribe
editorPanel.unmount();             // Cleanup and unsubscribe
```

**Current Features:**
- Select system to edit
- Change system sector (dropdown selector)
- Add sector change jobs to queue
- View pending jobs (shows up to 8, indicates more)
- Export jobs as JSON file
- Clear all jobs
- Build patched dataset (applies jobs, downloads patched DB5)

**Editor Job Format:**
```javascript
{
  target_dataset: "main",
  op_type: "change_sector",
  payload: {
    system_id: "sol",
    old_sector_id: "Core Worlds",
    new_sector_id: "Deep Core"
  },
  created_at: "2025-12-16T12:00:00.000Z"
}
```

**Supported Operations:**
- `change_sector` - Change system's sector assignment

**DB5 Patch System:**
- Validates DB5 structure (must have `systems` object)
- Validates sector mismatches (old_sector must match current)
- Applies jobs in order
- Strict mode (default) throws on errors
- Non-strict mode logs errors and continues

**Build Patched Dataset Flow:**
1. Clones current dataset (doesn't mutate state)
2. Applies all jobs via patch system
3. Updates state with patched dataset
4. Updates `window.DM4_DATASETS` cache
5. Clears editor jobs
6. Downloads patched DB5 as JSON file

**Protocol Reference:** 4.1-4.4 (editor rules), 2.1 (immutability)

---

### dm4-panels-registry.js

**Location:** `src/components/dm4-panels-registry.js` (~150 lines)  
**Load Order:** 10  
**Exports:** `DM4.panels.createPanelRegistry(state)`  
**Dependencies:** DM4.Logger, panel modules

```javascript
var registry = DM4.panels.createPanelRegistry(state);

// Activate panels
registry.activatePanel('identity');
registry.activatePanel('editor');
registry.activatePanel('test');

// Get current panel
var currentId = registry.getCurrentPanel(); // → 'identity'
```

**Panel Contract:** All panels must implement:
```javascript
{
  mount: function(hostElement) {
    // Render UI, subscribe to state
  },
  unmount: function() {
    // Unsubscribe, cleanup DOM
  }
}
```

**Lifecycle:**
1.  Calls `unmount()` on current panel (if any)
2. Creates new panel instance
3. Calls `mount()` on new panel
4. Tracks current panel ID

**Protocol Reference:** 5.1 (panel contract), 5.2 (module boundaries)

---

### dm4-style-core.js

**Location:** `src/utils/dm4-style-core. js` (117 lines)  
**Load Order:** 5  
**Exports:** `DM4.style.runStyleContractChecks`, `.runDomStyleContractChecks`, `.applyStyleProfileForMode`  
**Dependencies:** DM4.Logger

```javascript
// Verify CSS variables exist
DM4.style. runStyleContractChecks(core);

// Find style violations in DOM (debug mode only)
DM4.style.runDomStyleContractChecks(core);

// Apply style profile for mode
DM4.style. applyStyleProfileForMode(core, 'navcom');
DM4.style.applyStyleProfileForMode(core, 'strategic');
```

**Required CSS Variables:**
- `--dm-text-title-color`
- `--dm-text-header-color`
- `--dm-text-body-color`
- `--dm-crimson-accent`
- `--dm-font-large`
- `--dm-font-medium`
- `--dm-font-small`

**Approved Text Role Classes:**
- `dm-text-title`
- `dm-text-header`
- `dm-text-body`

**Style Profiles:** (Currently all map to `dm-style-palette-e2. css`)
- `navcom` → `src/styles/dm-style-palette-e2.css`
- `strategic` → `src/styles/dm-style-palette-e2.css`
- `intel` → `src/styles/dm-style-palette-e2.css`
- `command` → `src/styles/dm-style-palette-e2.css`

**DOM Checks (Debug Mode):**
- Warns on inline `style` attributes
- Warns on unknown `dm-text-*` classes

**Protocol Reference:** 3.1 (text roles), 3.2 (palette variables)

---

### dreadmarch-viewer4.js

**Location:** `src/components/dreadmarch-viewer4.js` (~1800 lines)  
**Load Order:** 13 (last)  
**Exports:** `window.DreadmarchViewer4.bootstrap(datasetId, rawDataset)`  
**Dependencies:** All modules

```javascript
// Called from index.html
window.DM4_startViewerWithDataset = function(datasetId) {
  var rawDataset = window.DM4_DATASETS[datasetId];
  window.DreadmarchViewer4.bootstrap(datasetId, rawDataset);
};
```

**Bootstrap Process:**
1. Clear existing viewer (if any)
2. Normalize dataset (`DM4.dataset.normalize`)
3. Create state manager (`DM4.state.createStateManager`)
4. Create map layers (graticule, routes, markers, labels)
5. Create panel registry with panels
6. Initialize control bar
7. Set up resize handlers
8. Initial render
9. Run style contract checks

**Created Components:**
- State manager with dataset
- Map frame with 4 layers
- Panel registry with 3 panels (identity, editor, test)
- Control bar with mode buttons
- Window resize observer

**Protocol Reference:** All sections (orchestrates entire application)

---

## 4. State Structure (Actual)

```javascript
{
  // Application configuration
  config: {
    debug: boolean
  },
  
  // Normalized dataset
  dataset: {
    systems: {
      [systemId]: {
        id: string,
        name: string,
        coords: [x, y],            // From normalization
        grid: { col, row, grid },   // From normalization
        sector: string,             // From normalization
        routes: [                   // If present
          { to: string, type: "major"|"medium"|"minor" }
        ]
      }
    },
    sectors: {
      [sectorName]: {
        name: string,
        systems: string[]
      }
    },
    grid: {
      origin: { x, y },
      cellSize: number
    },
    metadata: {
      id: string,
      name: string,
      description: string
    }
  },
  
  // Campaign data (minimal/empty in current implementation)
  campaign: {},
  
  // Access control (minimal/empty in current implementation)
  access: {},
  
  // Current selection
  selection: {
    system:  string | null
  },
  
  // UI mode
  mode: "navcom" | "strategic",
  
  // Editor state
  editor: {
    enabled: boolean,
    jobs: [
      {
        target_dataset: string,
        op_type: "change_sector",
        payload: {
          system_id: string,
          old_sector_id:  string,
          new_sector_id: string
        },
        created_at: string
      }
    ]
  }
}
```

---

## 5. Dependency Graph

```
                     ┌─────────────────┐
                     │  dm4-runtime. js │ (Level 0:  Foundation)
                     │  → DM4 namespace│
                     └────────┬────────┘
                              │
                     ┌────────▼────────┐
                     │  dm4-logger.js  │ (Level 1: Core Utilities)
                     │  → DM4.Logger   │
                     └────────┬────────┘
                              │
         ┌────────────────────┼────────────────────┐
         │                    │                    │
┌────────▼─────────┐ ┌───────▼────────┐ ┌────────▼─────────┐
│dm4-dataset-core  │ │dm4-dataset-main│ │ dm4-style-core   │ (Level 2)
│→ normalize       │ │→ DM4_DATASETS  │ │ → style checks   │
└────────┬─────────┘ └────────────────┘ └────────┬─────────┘
         │                                        │
         └──────────────┬─────────────────────────┘
                        │
                ┌───────▼────────┐
                │  dm4-state.js  │ (Level 3: State Management)
                │  → state mgr   │
                └───────┬────────┘
                        │
         ┌──────────────┼──────────────┐
         │              │              │
┌────────▼─────┐ ┌─────▼──────┐ ┌────▼──────────┐
│dm4-map-layers│ │dm4-panels- │ │dm4-panels-    │ (Level 4: UI)
│→ map layers  │ │identity    │ │test           │
└──────────────┘ └────────────┘ └───────────────┘
         │              │              │
         └──────────────┼──────────────┘
                        │
         ┌──────────────┼──────────────┐
         │              │              │
┌────────▼─────┐ ┌─────▼─────────┐ ┌──▼────────────┐
│dm4-panels-   │ │dm4-panels-    │ │dm4-ui-        │ (Level 5: Mgmt)
│registry      │ │editor         │ │controlbar     │
└────────┬─────┘ └───────┬───────┘ └──┬────────────┘
         │               │             │
         └───────────────┼─────────────┘
                         │
                ┌────────▼───────────┐
                │dreadmarch-viewer4  │ (Level 6: Bootstrap)
                │→ bootstrap         │
                └────────────────────┘
```

**Critical Rules:**
- Lower levels CANNOT depend on higher levels
- Loading out of order breaks dependencies
- Example: Loading state before logger → `DM4.Logger undefined`

---

## 6. Data Flow Patterns

### Pattern 1: System Selection

```
User clicks marker
    ↓
dm4-map-layers.js: click handler
    ↓
state.actions.selectSystem(systemId)
    ↓
dm4-state.js: Creates new state with updated selection
    ↓
batchNotify(['selection']) - queued
    ↓
[10ms delay]
    ↓
Subscribers to ['selection'] notified: 
  • dm4-panels-identity.js (re-renders system info)
  • dm4-map-layers.js markers (updates highlight)
  • dm4-map-layers.js labels (updates colors)
```

### Pattern 2: Dataset Switch

```
User clicks dataset button
    ↓
index.html: DM4_startViewerWithDataset(newDatasetId)
    ↓
dreadmarch-viewer4.js: bootstrap(newDatasetId, rawDataset)
    ↓
1.  Destroy existing viewer (unsubscribe all, clear DOM)
2. Normalize new dataset (DM4.dataset.normalize)
3. Create new state manager
4. Create map layers (4 layers)
5. Create panel registry (3 panels)
6. Initialize control bar
7. Render initial state
```

### Pattern 3: Editor Job Flow

```
User enables editor
    ↓
state.actions.setEditorEnabled(true)
    ↓
batchNotify(['editor'])
    ↓
dm4-panels-editor.js: Activates editor UI
    ↓
User selects system
    ↓
state.actions.selectSystem(systemId)
    ↓
Editor panel shows system data + sector dropdown
    ↓
User changes sector and clicks "Reassign Sector"
    ↓
state.actions.addEditorJob({
  op_type: 'change_sector',
  payload: { system_id, old_sector_id, new_sector_id }
})
    ↓
batchNotify(['editor'])
    ↓
Editor panel updates job list
    ↓
User clicks "Build Patched Dataset"
    ↓
1. Clone dataset (JSON.parse/stringify)
2. Apply jobs via dm4ApplyJobsToDb5
3. state.actions.setDataset(patchedDataset)
4. state.actions.clearEditorJobs()
5. Download patched DB5 as JSON file
```

### Pattern 4: Mode Switch

```
User clicks mode button
    ↓
state.actions.setMode('strategic')
    ↓
dm4-state.js: Validates mode, creates new state
    ↓
batchNotify(['mode'])
    ↓
Subscribers to ['mode'] notified: 
  • dm4-style-core.js (may apply different style profile)
  • Control bar (updates active button)
```

---

## 7. Protocol Constraints (Critical)

### ES5 Syntax Only (Protocol 5.6)

**Required:**
```javascript
// ✅ var
var systems = dataset.systems;

// ✅ function keyword
systems. forEach(function(s) { });

// ✅ String concatenation
var msg = "Selected:  " + system. name;

// ✅ Object. assign for merging
var newState = Object.assign({}, oldState, changes);
```

**Forbidden:**
```javascript
// ❌ const/let
const systems = dataset. systems;

// ❌ Arrow functions
systems.forEach(s => {});

// ❌ Template literals
var msg = `Selected: ${system.name}`;

// ❌ Destructuring
const { id, name } = system;

// ❌ Spread operator
var arr = [... oldArray, newItem];
```

**Exception:** Test files (`*. test.js`) may use modern syntax for Jest

---

### DM4.Logger Required (Protocol 8.2)

**Required:**
```javascript
// ✅ Use DM4.Logger
DM4.Logger.log("[MODULE] Message");
DM4.Logger.warn("[MODULE] Warning");
DM4.Logger.error("[MODULE] Error");
DM4.Logger.critical("Critical", fallbackFn);
```

**Forbidden:**
```javascript
// ❌ Direct console use
console.log("Message");
console.warn("Warning");
console.error("Error");
```

---

### Immutable State Updates (Protocol 2.1)

**Required:**
```javascript
// ✅ Via actions
state.actions.selectSystem('sol');
state.actions.setMode('strategic');

// ✅ Immutable pattern in actions
state = Object.assign({}, state, {
  selection: Object.assign({}, state.selection, {
    system: systemId
  })
});
```

**Forbidden:**
```javascript
// ❌ Direct mutation
state.selection.system = 'sol';
state.mode = 'strategic';
state.editor.jobs. push(job);
```

---

### No Duplicate Logic (Protocol 0.2)

**Every feature has exactly ONE implementation.**

Example:  Dataset normalization exists ONLY in `dm4-dataset-core.js`  
All code calls `DM4.dataset.normalize()`, never reimplements normalization

---

### Strict Module Loading Order (Protocol 5.4)

**Must load in exact order listed in Section 1.**

Breaking this causes: 
- State before Logger → `DM4.Logger undefined`
- Panels before State → Can't subscribe
- Bootstrap before Panels → Panel factories undefined

---

### Style Contract (Protocol 3.1, 3.2)

**Approved text roles ONLY:**
- `dm-text-title`
- `dm-text-header`
- `dm-text-body`

**Forbidden:**
```javascript
// ❌ Ad-hoc classes
element.classList.add('dm-text-warning');

// ❌ Inline styles
element.style.color = '#ff0000';
```

**Required:**
```javascript
// ✅ Approved classes
element.classList.add('dm-text-body');

// ✅ CSS variables
element.style.color = 'var(--dm-text-body-color)';
```

---

### DB5 Patch System (Protocol 4.1)

**Required:**
```javascript
// ✅ Via editor job
state.actions.addEditorJob({
  op_type:  'change_sector',
  payload: { system_id, old_sector_id, new_sector_id }
});

// Apply via patch system
dm4ApplyJobsToDb5(dataset, jobs, datasetId, strict);
```

**Forbidden:**
```javascript
// ❌ Direct mutation
dataset.systems['sol']. sector = 'Deep Core';
```

---

## 8. Common Operations

### Add a New Panel

**1. Create panel module** (`src/components/dm4-panels-myfeature.js`):

```javascript
;(function () {
  "use strict";
  
  if (! window.DM4) return;
  var DM4 = window.DM4;
  
  function MyFeaturePanel(core) {
    var state = core.state;
    var unsubscribe = null;
    var root = document.createElement('div');
    root.classList.add('dm4-myfeature-root');
    
    function render(st) {
      // Build/update UI based on state
      root.innerHTML = '<div class="dm-text-body">My Feature</div>';
    }
    
    return {
      mount: function(host) {
        host.appendChild(root);
        unsubscribe = state.subscribe(render, ['relevant', 'scope']);
      },
      unmount: function() {
        if (unsubscribe) {
          unsubscribe();
          unsubscribe = null;
        }
        if (root. parentNode) {
          root.parentNode.removeChild(root);
        }
      }
    };
  }
  
  if (! DM4.panels) DM4.panels = {};
  DM4.panels.MyFeaturePanel = MyFeaturePanel;
})();
```

**2. Add to `index.html` module loading** (before `dm4-panels-registry.js`):

```html
<script src="src/components/dm4-panels-myfeature.js"></script>
```

**3. Register in `dm4-panels-registry.js`** (or wherever panels are configured):

```javascript
var myFeature = DM4.panels.MyFeaturePanel(core);
myFeature.mount(panelContainer);
```

**4. Add control button** (if needed) in viewer bootstrap or control bar

---

### Add a New State Action

**1. Add action in `dm4-state.js`:**

```javascript
const actions = {
  // ... existing actions ... 
  
  myNewAction: function(param) {
    state = Object.assign({}, state, {
      myProperty: param
    });
    batchNotify(['myProperty']);
  }
};
```

**2. Subscribe in components:**

```javascript
state.subscribe(function(st) {
  console.log('myProperty changed:', st.myProperty);
}, ['myProperty']);
```

**3. Call from UI:**

```javascript
button.addEventListener('click', function() {
  state.actions.myNewAction('new value');
});
```

---

### Add a New Map Layer

**1. Create layer factory in `dm4-map-layers.js`:**

```javascript
function createMyLayer(core) {
  var container = document.createElement('div');
  container.classList.add('dm-layer-my-feature');
  
  var unsubscribe = null;
  
  function render(st) {
    // Build/update layer
  }
  
  unsubscribe = core.state. subscribe(render, ['relevant', 'scope']);
  
  return {
    element: container,
    destroy: function() {
      if (unsubscribe) unsubscribe();
    }
  };
}

if (!DM4.map) DM4.map = {};
DM4.map.createMyLayer = createMyLayer;
```

**2. Add to layer stack in `dreadmarch-viewer4.js`:**

```javascript
var myLayer = DM4.map. createMyLayer(core);
mapFrame.appendChild(myLayer.element);
```

---

### Add a New Editor Operation

**1. Add operation handler in `dm4-panels-editor.js`:**

```javascript
function dm4ApplyMyOperation(db5, job, strict) {
  var payload = job.payload || {};
  
  // Validate
  if (!payload.required_field) {
    var msg = "my_operation missing required_field";
    if (strict) throw new Error(msg);
    return { applied: false, message: msg };
  }
  
  // Apply change
  db5.systems[payload.system_id].property = payload.new_value;
  
  return {
    applied: true,
    message: "Applied my_operation to " + payload.system_id
  };
}
```

**2. Update dispatcher:**

```javascript
function dm4ApplyEditorJobToDb5(db5, job, strict) {
  var opType = job.op_type || job.type;
  
  if (opType === "change_sector") {
    return dm4ApplyChangeSector(db5, job, strict);
  }
  if (opType === "my_operation") {
    return dm4ApplyMyOperation(db5, job, strict);
  }
  
  var msg = "Unsupported op_type '" + opType + "'";
  if (strict) throw new Error(msg);
  return { applied: false, message: msg };
}
```

**3. Add UI for creating jobs** (in editor panel render function)

---

## 9. Change Log

### 2025-12-16 - Initial Knowledge Base (Protocol v1.6)
- Created comprehensive AI reference from Protocol v1.6 codebase
- Documented all 13 modules with actual APIs
- Mapped dependencies and data flows
- Established reality-based documentation (no invented features)
- Set update policy:  Protocol Section 6.2 triggers

---

**END OF KNOWLEDGE BASE**
