/**
 * Integration tests for dm4-dataset-core.js
 * Testing Web Worker integration and fallback behavior
 */

describe('DM4 Dataset Core - Integration Tests', () => {
  let DM4;

  beforeAll(() => {
    // Setup DM4 global namespace
    global.window = global;
    global.DM4 = {
      config: { debug: false },
      dataset: {}
    };
    DM4 = global.DM4;

    // Mock Worker if not available
    if (typeof global.Worker === 'undefined') {
      global.Worker = undefined;
    }

    // Load Logger first
    require('../dm4-logger.js');
    // Load the dataset core module
    require('../dm4-dataset-core.js');
  });

  afterAll(() => {
    // Cleanup
    delete global.window;
    delete global.DM4;
    if (global.Worker === undefined) {
      delete global.Worker;
    }
  });

  describe('Worker Fallback Behavior', () => {
    beforeEach(() => {
      DM4.dataset.clearCache();
    });

    test('should fallback to sync normalization when Worker is unavailable', async () => {
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

      // In test environment, Worker is typically not available, so it should fallback
      const result = await DM4.dataset.normalize(rawDataset, { async: true });

      expect(result).toBeDefined();
      expect(result.systems['sol'].name).toBe('Sol System');
      expect(result.systems['sol'].coords).toEqual([100, 200]);
      expect(result.systems['alpha'].name).toBe('Alpha Centauri');
      expect(result.systems['alpha'].coords).toEqual([150, 250]);
    });

    test('should cache results from async normalization even with fallback', async () => {
      const rawDataset = {
        systems: { 'sol': { name: 'Sol' } }
      };

      // First async call
      await DM4.dataset.normalize(rawDataset, { async: true });
      expect(DM4.dataset.getCacheStats().size).toBe(1);

      // Second async call should use cache
      const result = await DM4.dataset.normalize(rawDataset, { async: true });
      expect(result.systems['sol'].name).toBe('Sol');
      expect(DM4.dataset.getCacheStats().size).toBe(1);
    });
  });

  describe('Real-World Dataset Scenarios', () => {
    beforeEach(() => {
      DM4.dataset.clearCache();
    });

    test('should handle a realistic campaign dataset', () => {
      const campaignDataset = {
        campaign_name: 'The Frontier War',
        campaign_id: 'frontier-001',
        systems: {
          'terra': {
            name: 'Terra',
            allegiance: 'Terran Federation',
            population: 10000000000,
            tech_level: 12
          },
          'proxima-centauri': {
            name: 'Proxima Centauri',
            allegiance: 'Independent',
            population: 5000000,
            tech_level: 9
          },
          'alpha-centauri-a': {
            name: 'Alpha Centauri A',
            allegiance: 'Centauri Consortium',
            population: 2000000000,
            tech_level: 11
          }
        },
        system_pixels: {
          'terra': [500, 500],
          'proxima-centauri': [520, 505],
          'alpha-centauri-a': [530, 510]
        },
        system_grid: {
          'terra': { row: 10, col: 10 },
          'proxima-centauri': { row: 10, col: 11 },
          'alpha-centauri-a': { row: 10, col: 12 }
        },
        sectors: {
          'sol-sector': ['terra'],
          'centauri-sector': ['proxima-centauri', 'alpha-centauri-a']
        },
        routes: [
          { from: 'terra', to: 'proxima-centauri', distance: 4.24 },
          { from: 'proxima-centauri', to: 'alpha-centauri-a', distance: 0.21 }
        ],
        galactic_grid: {
          cell_size: [50, 50],
          col_origin: 0,
          row_origin: 0
        }
      };

      const result = DM4.dataset.normalize(campaignDataset);

      // Verify structure
      expect(result.campaign_name).toBe('The Frontier War');
      expect(result.campaign_id).toBe('frontier-001');
      expect(result.routes).toBeDefined();
      expect(result.galactic_grid).toBeDefined();

      // Verify systems are normalized
      expect(result.systems['terra']).toEqual({
        name: 'Terra',
        allegiance: 'Terran Federation',
        population: 10000000000,
        tech_level: 12,
        coords: [500, 500],
        grid: { row: 10, col: 10 },
        sector: 'sol-sector'
      });

      expect(result.systems['proxima-centauri']).toEqual({
        name: 'Proxima Centauri',
        allegiance: 'Independent',
        population: 5000000,
        tech_level: 9,
        coords: [520, 505],
        grid: { row: 10, col: 11 },
        sector: 'centauri-sector'
      });

      expect(result.systems['alpha-centauri-a']).toEqual({
        name: 'Alpha Centauri A',
        allegiance: 'Centauri Consortium',
        population: 2000000000,
        tech_level: 11,
        coords: [530, 510],
        grid: { row: 10, col: 12 },
        sector: 'centauri-sector'
      });
    });

    test('should handle partial data gracefully in real-world scenario', () => {
      const partialDataset = {
        systems: {
          'established-system': {
            name: 'Established Colony',
            coords: [100, 100],
            grid: { row: 5, col: 5 },
            sector: 'core'
          },
          'new-discovery': {
            name: 'New Discovery'
            // Missing coords, grid, sector
          },
          'partial-data': {
            name: 'Partial Data System'
          }
        },
        system_pixels: {
          'partial-data': [200, 200]
          // new-discovery has no pixels
        },
        sectors: {
          'exploration-zone': ['new-discovery', 'partial-data']
        }
      };

      const result = DM4.dataset.normalize(partialDataset);

      // Established system should be complete
      expect(result.systems['established-system']).toEqual({
        name: 'Established Colony',
        coords: [100, 100],
        grid: { row: 5, col: 5 },
        sector: 'core'
      });

      // New discovery should have sector but no coords/grid
      expect(result.systems['new-discovery']).toEqual({
        name: 'New Discovery',
        coords: undefined,
        grid: undefined,
        sector: 'exploration-zone'
      });

      // Partial data should get coords from pixels and sector
      expect(result.systems['partial-data']).toEqual({
        name: 'Partial Data System',
        coords: [200, 200],
        grid: undefined,
        sector: 'exploration-zone'
      });
    });

    test('should maintain consistency across multiple normalizations', () => {
      const dataset = {
        systems: {
          'sys1': { name: 'System 1' },
          'sys2': { name: 'System 2' },
          'sys3': { name: 'System 3' }
        }
      };

      const result1 = DM4.dataset.normalize(dataset);
      const result2 = DM4.dataset.normalize(dataset);
      const result3 = DM4.dataset.normalize(dataset);

      // All should be the same cached object
      expect(result2).toBe(result1);
      expect(result3).toBe(result1);
      expect(DM4.dataset.getCacheStats().size).toBe(1);
    });
  });

  describe('Async and Sync Consistency', () => {
    beforeEach(() => {
      DM4.dataset.clearCache();
    });

    test('should produce identical results in sync and async modes', async () => {
      const rawDataset = {
        systems: {
          'sol': { name: 'Sol' },
          'alpha': { name: 'Alpha' }
        },
        system_pixels: {
          'sol': [100, 200],
          'alpha': [150, 250]
        },
        system_grid: {
          'sol': { row: 1, col: 1 },
          'alpha': { row: 2, col: 2 }
        },
        sectors: {
          'core': ['sol', 'alpha']
        }
      };

      // Clear cache to ensure fresh normalization
      DM4.dataset.clearCache();
      const syncResult = DM4.dataset.normalize(rawDataset);

      DM4.dataset.clearCache();
      const asyncResult = await DM4.dataset.normalize(rawDataset, { async: true });

      // Results should be structurally identical
      expect(asyncResult.systems['sol']).toEqual(syncResult.systems['sol']);
      expect(asyncResult.systems['alpha']).toEqual(syncResult.systems['alpha']);
    });
  });

  describe('Edge Cases in Integration', () => {
    beforeEach(() => {
      DM4.dataset.clearCache();
    });

    test('should handle empty systems with full metadata', () => {
      const dataset = {
        systems: {},
        system_pixels: { 'nonexistent': [100, 100] },
        system_grid: { 'nonexistent': { row: 1, col: 1 } },
        sectors: { 'empty': ['nonexistent'] }
      };

      const result = DM4.dataset.normalize(dataset);
      expect(result.systems).toEqual({});
      expect(result.system_pixels).toBeDefined();
    });

    test('should handle very large sector definitions', () => {
      const systems = {};
      const sectorSystems = [];
      
      for (let i = 0; i < 500; i++) {
        const id = 'sys-' + i;
        systems[id] = { name: 'System ' + i };
        sectorSystems.push(id);
      }

      const dataset = {
        systems: systems,
        sectors: {
          'mega-sector': sectorSystems
        }
      };

      const result = DM4.dataset.normalize(dataset);
      expect(Object.keys(result.systems).length).toBe(500);
      expect(result.systems['sys-0'].sector).toBe('mega-sector');
      expect(result.systems['sys-499'].sector).toBe('mega-sector');
    });

    test('should handle dataset with circular reference protection', () => {
      // JSON.stringify will fail on circular references, but our caching should handle it
      const dataset = {
        systems: {
          'sol': { name: 'Sol' }
        }
      };

      // Add a circular reference
      dataset.self = dataset;

      // This should not crash, just won't cache
      const result = DM4.dataset.normalize(dataset);
      expect(result.systems['sol'].name).toBe('Sol');
    });
  });
});
