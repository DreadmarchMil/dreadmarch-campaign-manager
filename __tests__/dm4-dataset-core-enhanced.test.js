/**
 * Enhanced unit tests for dm4-dataset-core.js
 * Testing caching, async normalization, and error handling
 */

describe('DM4 Dataset Core - Enhanced Features', () => {
  let DM4;

  beforeAll(() => {
    // Setup DM4 global namespace
    global.window = global;
    global.DM4 = {
      config: { debug: false },
      dataset: {}
    };
    DM4 = global.DM4;

    // Load Logger first
    require('../dm4-logger.js');
    // Load the dataset core module
    require('../dm4-dataset-core.js');
  });

  afterAll(() => {
    // Cleanup
    delete global.window;
    delete global.DM4;
  });

  describe('Caching Mechanism', () => {
    beforeEach(() => {
      // Clear cache before each test
      DM4.dataset.clearCache();
    });

    test('should cache normalized datasets', () => {
      const rawDataset = {
        systems: {
          'sol': { name: 'Sol System' }
        }
      };

      // First normalization
      const result1 = DM4.dataset.normalize(rawDataset);
      expect(result1.systems['sol'].name).toBe('Sol System');

      // Check cache stats
      const stats = DM4.dataset.getCacheStats();
      expect(stats.size).toBe(1);

      // Second normalization should use cache (same reference)
      const result2 = DM4.dataset.normalize(rawDataset);
      expect(result2).toBe(result1);
    });

    test('should use different cache entries for different datasets', () => {
      const dataset1 = {
        systems: { 'sol': { name: 'Sol' } }
      };
      const dataset2 = {
        systems: { 'alpha': { name: 'Alpha' } }
      };

      DM4.dataset.normalize(dataset1);
      DM4.dataset.normalize(dataset2);

      const stats = DM4.dataset.getCacheStats();
      expect(stats.size).toBe(2);
    });

    test('should clear cache when requested', () => {
      const rawDataset = {
        systems: { 'sol': { name: 'Sol' } }
      };

      DM4.dataset.normalize(rawDataset);
      expect(DM4.dataset.getCacheStats().size).toBe(1);

      DM4.dataset.clearCache();
      expect(DM4.dataset.getCacheStats().size).toBe(0);
    });

    test('should handle cache for datasets with additional properties', () => {
      const dataset1 = {
        systems: { 'sol': { name: 'Sol' } },
        customProp: 'value1'
      };
      const dataset2 = {
        systems: { 'sol': { name: 'Sol' } },
        customProp: 'value2'
      };

      const result1 = DM4.dataset.normalize(dataset1);
      const result2 = DM4.dataset.normalize(dataset2);

      // Different custom properties should result in different cache entries
      expect(result1.customProp).toBe('value1');
      expect(result2.customProp).toBe('value2');
      expect(DM4.dataset.getCacheStats().size).toBe(2);
    });
  });

  describe('Async Normalization', () => {
    beforeEach(() => {
      DM4.dataset.clearCache();
    });

    test('should support async normalization mode', async () => {
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

      const result = await DM4.dataset.normalize(rawDataset, { async: true });

      expect(result).toBeDefined();
      expect(result.systems['sol']).toEqual({
        name: 'Sol System',
        coords: [100, 200],
        grid: undefined,
        sector: undefined
      });
      expect(result.systems['alpha']).toEqual({
        name: 'Alpha Centauri',
        coords: [150, 250],
        grid: undefined,
        sector: undefined
      });
    });

    test('should use cache in async mode', async () => {
      const rawDataset = {
        systems: { 'sol': { name: 'Sol' } }
      };

      // First call
      await DM4.dataset.normalize(rawDataset, { async: true });
      expect(DM4.dataset.getCacheStats().size).toBe(1);

      // Second call should use cache
      const result = await DM4.dataset.normalize(rawDataset, { async: true });
      expect(result.systems['sol'].name).toBe('Sol');
    });

    test('should handle async normalization with invalid data', async () => {
      const result = await DM4.dataset.normalize(null, { async: true });
      expect(result).toEqual({ systems: {} });
    });
  });

  describe('Error Handling and Resilience', () => {
    beforeEach(() => {
      DM4.dataset.clearCache();
    });

    test('should continue normalization even if one system fails', () => {
      const rawDataset = {
        systems: {
          'sol': { name: 'Sol System' },
          'alpha': { name: 'Alpha Centauri' },
          'beta': { name: 'Beta System' }
        }
      };

      const result = DM4.dataset.normalize(rawDataset);

      // All systems should be normalized
      expect(result.systems['sol']).toBeDefined();
      expect(result.systems['alpha']).toBeDefined();
      expect(result.systems['beta']).toBeDefined();
    });

    test('should handle missing coords gracefully', () => {
      const rawDataset = {
        systems: {
          'sol': { name: 'Sol System' }
          // No coords provided
        }
      };

      const result = DM4.dataset.normalize(rawDataset);
      expect(result.systems['sol']).toEqual({
        name: 'Sol System',
        coords: undefined,
        grid: undefined,
        sector: undefined
      });
    });

    test('should validate coords format when Logger is available', () => {
      const rawDataset = {
        systems: {
          'sol': {
            name: 'Sol System',
            coords: [100, 200] // Valid coords
          },
          'alpha': {
            name: 'Alpha Centauri',
            coords: 'invalid' // Invalid coords (not array)
          }
        }
      };

      // Should not throw, just log warning
      const result = DM4.dataset.normalize(rawDataset);
      expect(result.systems['sol']).toBeDefined();
      expect(result.systems['alpha']).toBeDefined();
    });

    test('should handle complex datasets with all features', () => {
      const rawDataset = {
        systems: {
          'sol': { name: 'Sol' },
          'alpha': { name: 'Alpha' },
          'beta': { name: 'Beta' }
        },
        system_pixels: {
          'sol': [100, 200],
          'alpha': [150, 250]
        },
        system_grid: {
          'sol': { row: 1, col: 1 },
          'beta': { row: 2, col: 2 }
        },
        sectors: {
          'core': ['sol', 'alpha'],
          'outer': ['beta']
        },
        routes: [
          { from: 'sol', to: 'alpha' },
          { from: 'alpha', to: 'beta' }
        ],
        customProperty: 'test-value'
      };

      const result = DM4.dataset.normalize(rawDataset);

      // Verify normalization
      expect(result.systems['sol']).toEqual({
        name: 'Sol',
        coords: [100, 200],
        grid: { row: 1, col: 1 },
        sector: 'core'
      });
      expect(result.systems['alpha']).toEqual({
        name: 'Alpha',
        coords: [150, 250],
        grid: undefined,
        sector: 'core'
      });
      expect(result.systems['beta']).toEqual({
        name: 'Beta',
        coords: undefined,
        grid: { row: 2, col: 2 },
        sector: 'outer'
      });

      // Verify additional properties preserved
      expect(result.routes).toEqual([
        { from: 'sol', to: 'alpha' },
        { from: 'alpha', to: 'beta' }
      ]);
      expect(result.customProperty).toBe('test-value');
    });
  });

  describe('Logger Integration', () => {
    test('should have Logger available', () => {
      expect(DM4.Logger).toBeDefined();
      expect(typeof DM4.Logger.info).toBe('function');
      expect(typeof DM4.Logger.warn).toBe('function');
      expect(typeof DM4.Logger.error).toBe('function');
      expect(typeof DM4.Logger.validate).toBe('function');
    });

    test('Logger.validate should return condition result', () => {
      expect(DM4.Logger.validate(true, 'test')).toBe(true);
      expect(DM4.Logger.validate(false, 'test')).toBe(false);
    });
  });

  describe('Performance with Large Datasets', () => {
    beforeEach(() => {
      DM4.dataset.clearCache();
    });

    test('should handle dataset with many systems efficiently', () => {
      const systems = {};
      const pixels = {};
      const grid = {};
      
      // Create 1000 systems
      for (let i = 0; i < 1000; i++) {
        const id = 'system-' + i;
        systems[id] = { name: 'System ' + i };
        pixels[id] = [i * 10, i * 20];
        grid[id] = { row: Math.floor(i / 100), col: i % 100 };
      }

      const rawDataset = {
        systems: systems,
        system_pixels: pixels,
        system_grid: grid
      };

      const startTime = Date.now();
      const result = DM4.dataset.normalize(rawDataset);
      const duration = Date.now() - startTime;

      // Should complete in reasonable time (< 1 second)
      expect(duration).toBeLessThan(1000);
      expect(Object.keys(result.systems).length).toBe(1000);
      expect(result.systems['system-0'].coords).toEqual([0, 0]);
      expect(result.systems['system-999'].coords).toEqual([9990, 19980]);
    });

    test('cache should improve performance for repeated normalization', () => {
      const systems = {};
      for (let i = 0; i < 100; i++) {
        systems['system-' + i] = { name: 'System ' + i };
      }
      const rawDataset = { systems: systems };

      // First normalization
      const result1 = DM4.dataset.normalize(rawDataset);
      expect(DM4.dataset.getCacheStats().size).toBe(1);

      // Second normalization (should use cache)
      const result2 = DM4.dataset.normalize(rawDataset);
      
      // Should return the exact same cached object
      expect(result2).toBe(result1);
      expect(DM4.dataset.getCacheStats().size).toBe(1);
    });
  });
});
