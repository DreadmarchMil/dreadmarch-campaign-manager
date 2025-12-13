# Dataset Normalization API

This document describes the enhanced dataset normalization API in `dm4-dataset-core.js`.

## Overview

The dataset normalization system has been enhanced with:
- **Caching**: Automatically caches normalized datasets to avoid redundant processing
- **Web Worker Support**: Offloads normalization to a separate thread for better performance
- **Error Resilience**: Continues processing even when individual systems fail
- **Logger Integration**: Centralized logging and validation

## API Reference

### DM4.dataset.normalize(rawDataset, options)

Normalizes a raw dataset into the canonical DM4 format.

**Parameters:**
- `rawDataset` (Object): The raw dataset to normalize
- `options` (Object, optional):
  - `async` (Boolean): Use asynchronous Web Worker processing (default: false)

**Returns:**
- Synchronous mode: Normalized dataset object
- Async mode: Promise that resolves to normalized dataset object

**Examples:**

```javascript
// Synchronous normalization (default, backward compatible)
const rawDataset = {
  systems: {
    'sol': { name: 'Sol System' },
    'alpha': { name: 'Alpha Centauri' }
  },
  system_pixels: {
    'sol': [100, 200],
    'alpha': [150, 250]
  }
};

const normalized = DM4.dataset.normalize(rawDataset);
console.log(normalized.systems['sol'].coords); // [100, 200]

// Asynchronous normalization (for large datasets)
DM4.dataset.normalize(largeDataset, { async: true })
  .then(function(normalized) {
    console.log('Normalized', Object.keys(normalized.systems).length, 'systems');
  })
  .catch(function(error) {
    console.error('Normalization failed:', error);
  });
```

### DM4.dataset.clearCache()

Clears the normalization cache.

**Example:**
```javascript
DM4.dataset.clearCache();
```

### DM4.dataset.getCacheStats(options)

Returns statistics about the normalization cache.

**Parameters:**
- `options` (Object, optional):
  - `includeKeys` (Boolean): Include all cache keys in the result (default: false)

**Returns:**
- Object with cache statistics

**Example:**
```javascript
// Get basic stats
const stats = DM4.dataset.getCacheStats();
console.log('Cache size:', stats.size);

// Get stats with keys
const detailedStats = DM4.dataset.getCacheStats({ includeKeys: true });
console.log('Cached keys:', detailedStats.keys);
```

## Caching Behavior

The normalization cache uses an intelligent key generation strategy:

- **Small datasets (< 100 systems)**: Full JSON representation is used as the cache key
- **Large datasets (≥ 100 systems)**: A fingerprint based on dataset structure is used

This ensures efficient caching without excessive memory usage.

**When cache is used:**
- Identical datasets will return the exact same cached object
- Different datasets get different cache entries
- Cache persists for the lifetime of the page (cleared on refresh)

**When to clear cache:**
- After loading a new campaign
- When dataset structure changes significantly
- To free memory if needed

## Web Worker Behavior

When using async mode, normalization is offloaded to a Web Worker:

1. **Worker Available**: Normalization runs in separate thread
2. **Worker Timeout (5s)**: Falls back to synchronous normalization
3. **Worker Error**: Falls back to synchronous normalization
4. **Worker Not Supported**: Uses synchronous normalization

The fallback ensures the system works reliably across all browsers.

## Error Handling

The normalization system is resilient to errors:

- **Invalid input**: Returns `{ systems: {} }`
- **Individual system errors**: System is skipped, processing continues
- **Validation warnings**: Logged via Logger if available
- **Normalization errors**: Collected in `_normalizationErrors` property

**Example:**
```javascript
const dataset = {
  systems: {
    'valid': { name: 'Valid System', coords: [100, 100] },
    'problematic': null  // This won't crash the normalization
  }
};

const result = DM4.dataset.normalize(dataset);
console.log(result.systems['valid']);  // Normalized successfully
console.log(result.systems['problematic']);  // Also present, with defaults

if (result._normalizationErrors) {
  console.warn('Some systems had errors:', result._normalizationErrors);
}
```

## Performance Considerations

### Small Datasets (< 100 systems)
- **Recommended**: Synchronous mode
- **Caching**: Full JSON key
- **Performance**: Instant (< 1ms typically)

### Medium Datasets (100-1000 systems)
- **Recommended**: Either mode works well
- **Caching**: Fingerprint key
- **Performance**: Fast (< 10ms typically)

### Large Datasets (> 1000 systems)
- **Recommended**: Async mode
- **Caching**: Fingerprint key
- **Performance**: Variable, but non-blocking with async mode

### Performance Tips

1. **Use cache**: Don't clear cache unnecessarily
2. **Use async for large datasets**: Prevents UI freezing
3. **Batch operations**: Normalize once, use many times

## Integration with Logger

The system integrates with `DM4.Logger` for diagnostics:

```javascript
// Logger methods used:
DM4.Logger.info(message, data)     // Information messages
DM4.Logger.warn(message, data)     // Validation warnings
DM4.Logger.error(message, data)    // Error messages
DM4.Logger.validate(condition, msg) // Validation checks
```

Enable debug mode to see all logging:
```javascript
DM4.config.debug = true;
```

## Browser Compatibility

- **Modern browsers**: Full support including Web Workers
- **Legacy browsers**: Automatic fallback to synchronous mode
- **No polyfills required**: Works out of the box

## Migration Guide

### From Old API

The new API is fully backward compatible:

```javascript
// Old code (still works)
const normalized = DM4.dataset.normalize(rawDataset);

// New code (optional enhancements)
const normalized = await DM4.dataset.normalize(rawDataset, { async: true });
DM4.dataset.clearCache();  // New utility function
```

No code changes required for existing applications.
