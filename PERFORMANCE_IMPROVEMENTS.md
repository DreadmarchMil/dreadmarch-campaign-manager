# UI Performance Improvements

This document describes the performance optimizations implemented in the Dreadmarch Campaign Manager to improve UI responsiveness, reduce memory usage, and enhance scalability for large datasets.

## Overview

The performance improvements focus on five key areas:
1. **Reactive State Updates** - Scoped subscriptions to minimize re-renders
2. **Memoization** - Cache computed values and skip redundant updates
3. **Throttling/Debouncing** - Reduce DOM update frequency during interactions
4. **Spatial Indexing** - Infrastructure for future viewport-based virtualization
5. **Optimized DOM Updates** - Update only changed elements instead of all

## 1. Reactive State Updates (Scoped Subscriptions)

### Implementation
The state manager in `dm4-state.js` supports scoped subscriptions via the `scopePath` parameter. Components can now subscribe to specific parts of the state tree instead of all changes.

### Usage Example
```javascript
// Old way - subscribes to ALL state changes
state.subscribe(function(st) {
  renderSelection(st);
});

// New way - only subscribes to selection changes
state.subscribe(function(st) {
  renderSelection(st);
}, ['selection']);
```

### Components Using Scoped Subscriptions
- **Markers Layer** (`dm4-map-layers.js`): Subscribes to `['selection']` only
- **Labels Layer** (`dm4-map-layers.js`): Subscribes to `['selection']` only
- **Routes Layer** (`dm4-map-layers.js`): Subscribes to `['selection']` only
- **Identity Panel** (`dm4-panels-identity.js`): Subscribes to `['selection', 'dataset']` only

### Benefits
- Components only re-render when relevant state changes
- Reduces unnecessary computation and DOM updates
- Improves performance when multiple state changes occur simultaneously

### Batching
State updates are automatically batched with a 10ms delay to coalesce multiple rapid updates into a single notification cycle.

## 2. Memoization

### Marker Layer Memoization
The markers layer now tracks the last selected system and skips rendering if the selection hasn't changed.

```javascript
let lastSelectedId = null;

function renderSelection(st) {
  const selected = (st.selection && st.selection.system) || null;
  
  // Skip render if selection hasn't changed
  if (selected === lastSelectedId) {
    return;
  }
  
  // Update only the changed markers (not all markers)
  if (lastSelectedId && markerById.has(lastSelectedId)) {
    markerById.get(lastSelectedId).classList.remove("dm-system-selected");
  }
  
  if (selected && markerById.has(selected)) {
    markerById.get(selected).classList.add("dm-system-selected");
  }
  
  lastSelectedId = selected;
}
```

### Benefits
- **Before**: Every selection change iterated through ALL markers/labels
- **After**: Only updates the 2 markers/labels that actually changed (previous + new)
- For a map with 100 systems, this reduces DOM updates from 100 to 2 per selection

### Identity Panel Memoization
The identity panel caches computed navcom data and only recalculates when the selection or dataset changes.

```javascript
let lastSelectionId = null;
let lastDatasetVersion = null;
let cachedNavcomData = null;

// Only re-render when selection or dataset actually changes
if (selId !== lastSelectionId || datasetChanged || !cachedNavcomData) {
  renderNavcom(st);
  cachedNavcomData = { selId, datasetVersion: lastDatasetVersion };
}
```

## 3. Throttling and Debouncing

### Throttle Utility
Limits how often a function can be called, ensuring smooth 60fps rendering during interactions.

```javascript
function throttle(fn, delay) {
  let lastCall = 0;
  let timeoutId = null;
  return function() {
    const context = this;
    const args = arguments;
    const now = Date.now();
    
    if (now - lastCall >= delay) {
      lastCall = now;
      fn.apply(context, args);
    } else {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(function() {
        lastCall = Date.now(); // Use current time at execution, not cached value
        fn.apply(context, args);
      }, delay - (now - lastCall));
    }
  };
}
```

### Pan Operations
Pan operations are throttled to 16ms (~60fps) to prevent excessive DOM updates during dragging.

```javascript
const throttledPanRender = throttle(clampAndApply, 16);

window.addEventListener("mousemove", function (e) {
  if (!isPanning) return;
  translateX = startTX + (e.clientX - startX);
  translateY = startTY + (e.clientY - startY);
  throttledPanRender(); // Throttled instead of immediate
});
```

### Zoom Operations
Zoom operations are also throttled to 16ms for smooth scrolling.

```javascript
const throttledZoomRender = throttle(clampAndApply, 16);

mapContainer.addEventListener("wheel", function (e) {
  e.preventDefault();
  // ... calculate new zoom and translate ...
  throttledZoomRender(); // Throttled instead of immediate
});
```

### Benefits
- **Before**: Every mouse move/wheel event triggered a DOM update
- **After**: Updates limited to ~60 times per second
- Smoother animations and reduced CPU usage

## 4. Spatial Indexing (Future Virtualization)

### Implementation
A grid-based spatial index has been implemented in `dm4-map-layers.js` to enable future viewport-based virtualization.

```javascript
function createSpatialIndex(systems, cellSize) {
  const index = new Map();
  const cellSize_ = cellSize || 512;
  
  // Build grid index
  Object.entries(systems).forEach(function ([id, sys]) {
    const coords = sys.coords || [];
    const cellX = Math.floor(coords[0] / cellSize_);
    const cellY = Math.floor(coords[1] / cellSize_);
    const cellKey = cellX + "," + cellY;
    
    if (!index.has(cellKey)) {
      index.set(cellKey, []);
    }
    index.get(cellKey).push({ id: id, x: coords[0], y: coords[1], sys: sys });
  });
  
  return {
    cellSize: cellSize_,
    index: index,
    query: function(minX, minY, maxX, maxY) {
      // Query systems within bounding box
      // ... implementation ...
    }
  };
}
```

### Future Usage
When viewport-based virtualization is implemented, the spatial index can be used to:
1. Query only systems visible in the current viewport
2. Render/hide markers and labels based on visibility
3. Handle datasets with 1000+ systems efficiently

### Example Future Implementation
```javascript
// Pseudocode for future virtualization
function updateVisibleMarkers(viewport) {
  const visible = spatialIndex.query(
    viewport.minX, viewport.minY,
    viewport.maxX, viewport.maxY
  );
  
  // Only render markers that are visible
  visible.forEach(item => {
    renderMarker(item.id);
  });
  
  // Hide markers that are outside viewport
  allMarkers.forEach(marker => {
    if (!visible.includes(marker)) {
      hideMarker(marker);
    }
  });
}
```

### Benefits (When Implemented)
- Only render visible systems (e.g., 50 out of 1000)
- Reduced DOM node count
- Lower memory usage
- Faster initial load time for large datasets

## 5. Optimized DOM Updates

### Before
```javascript
// Updated ALL markers on every selection change
markerById.forEach(function (marker, id) {
  marker.classList.toggle("dm-system-selected", id === selected);
});
```

### After
```javascript
// Only update the 2 markers that changed
if (lastSelectedId && markerById.has(lastSelectedId)) {
  markerById.get(lastSelectedId).classList.remove("dm-system-selected");
}

if (selected && markerById.has(selected)) {
  markerById.get(selected).classList.add("dm-system-selected");
}
```

### Benefits
- Reduced DOM manipulation from O(n) to O(1)
- For 100 systems: 100 operations → 2 operations
- Significant performance improvement for large datasets

## Performance Metrics

### Expected Improvements

#### Scoped Subscriptions
- **Reduction in unnecessary re-renders**: 60-80%
- Components only update when their specific state slice changes

#### Memoization
- **Reduction in selection updates**: 98% (from 100 operations to 2)
- **Reduction in panel re-renders**: 70-90% (when selection/dataset unchanged)

#### Throttling
- **Frame rate stability**: Consistent 60fps during pan/zoom
- **CPU usage**: 30-50% reduction during continuous interactions

#### Memory Usage
- **Current**: All markers always in DOM
- **Future with virtualization**: Only visible markers in DOM (50-90% reduction for large datasets)

## Testing

### Unit Tests
All existing unit tests have been updated to handle batched state updates:
- Tests now wait 20ms for batched notifications (10ms batch delay + margin)
- All 45 tests passing

### Performance Testing Recommendations
To validate these improvements:

1. **Large Dataset Test**
   - Load a dataset with 500+ systems
   - Measure FPS during pan/zoom
   - Compare before/after memory usage

2. **Rapid Interaction Test**
   - Rapidly select different systems
   - Monitor DOM update frequency
   - Verify memoization prevents redundant renders

3. **Memory Profiling**
   - Use browser DevTools memory profiler
   - Compare heap size with/without optimizations
   - Check for memory leaks during extended use

## Future Enhancements

### Viewport-Based Virtualization
- Implement using the existing spatial index
- Render only visible markers/labels
- Target: Handle 1000+ systems smoothly

### Lazy Loading
- Defer panel content rendering until visible
- Load heavy sections on demand
- Progressive enhancement for complex data

### Web Workers
- Move route computation to background thread
- Keep UI thread responsive during heavy calculations

### Canvas Rendering
- For extremely large datasets (5000+ systems)
- Consider Canvas-based rendering instead of DOM
- Hybrid approach: Canvas for markers, DOM for interactions

## Browser Compatibility

All optimizations use standard JavaScript features compatible with:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

No polyfills required.

## Contributing

When adding new components:
1. Use scoped subscriptions with appropriate `scopePath`
2. Implement memoization to skip redundant renders
3. Throttle/debounce high-frequency operations
4. Update only changed DOM elements, not all
5. Add comments explaining performance considerations

## References

- State Management: `dm4-state.js`
- Map Layers: `dm4-map-layers.js`
- Panels: `dm4-panels-*.js`
- Main Viewer: `dreadmarch-viewer4.js`
- Tests: `__tests__/dm4-state.test.js`
