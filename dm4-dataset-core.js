;(function () {
  "use strict";

  if (!window.DM4) {
    window.DM4 = {};
  }
  var DM4 = window.DM4;

  // Local debug flag mirrors the core viewer's DM4_DEBUG behavior
  var DM4_DEBUG = !!(DM4 && DM4.config && DM4.config.debug);

  /**
   * DATASET NORMALIZER MODULE
   *
   * This module provides the canonical dataset normalization function for the
   * Dreadmarch Campaign Manager. It takes a raw dataset from various sources
   * and transforms it into a normalized, consistent format that the rest of
   * the application can rely on.
   * 
   * Purpose:
   * Raw datasets may have system information scattered across multiple properties:
   * - System base data in 'systems'
   * - Pixel coordinates in 'system_pixels' or 'endpoint_pixels'
   * - Grid coordinates in 'system_grid'
   * - Sector assignments in 'sectors' (which map sector names to system arrays)
   * 
   * The normalizer consolidates all this information so that each system object
   * contains everything needed: coords, grid, and sector.
   * 
   * Normalization Strategy:
   * 1. Start with base system data from raw.systems
   * 2. Add coordinate data from system_pixels or endpoint_pixels
   * 3. Add grid position from system_grid
   * 4. Add sector assignment by building a reverse lookup from sectors map
   * 5. Return a new dataset with consolidated systems object
   * 
   * Caching:
   * This module does not implement caching itself. Caching is handled by the
   * caller if needed. The function is deterministic - same input always produces
   * same output.
   * 
   * Error Handling:
   * The normalizer is defensive and handles missing or malformed data gracefully:
   * - Returns {systems: {}} for null/undefined/non-object input
   * - Missing properties default to empty objects
   * - Missing system data defaults to empty objects
   * - All operations use safe property access
   */

  /**
   * DM4_DATASET_CORE_FUNCTION: normalizeDataset
   * 
   * Normalizes a raw dataset into a consistent format with consolidated system data.
   * 
   * Input format (raw):
   * {
   *   systems: { systemId: { name, ... }, ... },
   *   system_pixels: { systemId: [x, y], ... },
   *   endpoint_pixels: { systemId: [x, y], ... },  // Alternative to system_pixels
   *   system_grid: { systemId: { col, row, grid }, ... },
   *   sectors: { sectorName: [systemId1, systemId2, ...], ... },
   *   ... other properties (preserved in output)
   * }
   * 
   * Output format:
   * {
   *   systems: {
   *     systemId: {
   *       ... base system properties ...,
   *       coords: [x, y],           // Added from system_pixels/endpoint_pixels
   *       grid: { col, row, grid }, // Added from system_grid
   *       sector: "sectorName"      // Added from sectors reverse lookup
   *     },
   *     ...
   *   },
   *   ... all other properties from raw dataset preserved ...
   * }
   * 
   * @param {Object} raw - Raw dataset object to normalize
   * @returns {Object} Normalized dataset with consolidated system data
   */
  function normalizeDataset(raw) {
    // Validate input - return safe default if invalid
    if (!raw || typeof raw !== "object") {
      return DM4.Logger.critical(
        "normalizeDataset: empty or invalid raw dataset",
        function () {
          return { systems: {} };
        }
      );
    }

    // Extract source data with safe defaults
    var systemsSrc = raw.systems || {};
    var pixelsSrc = raw.system_pixels || raw.endpoint_pixels || {};
    var gridSrc = raw.system_grid || {};
    var sectorsSrc = raw.sectors || {};

    /**
     * Build reverse lookup: systemId -> sectorName
     * 
     * The sectors object maps sector names to arrays of system IDs:
     *   sectors: { "Grumani": ["Darkknell", "Sanrafsix", ...], ... }
     * 
     * We need to quickly find which sector a system belongs to, so we
     * build a reverse mapping:
     *   sectorBySystem: { "Darkknell": "Grumani", "Sanrafsix": "Grumani", ... }
     */
    var sectorBySystem = {};
    Object.entries(sectorsSrc).forEach(function (entry) {
      var sectorName = entry[0];
      var systemList = entry[1];
      (systemList || []).forEach(function (sysId) {
        sectorBySystem[sysId] = sectorName;
      });
    });

    /**
     * Normalize each system
     * 
     * For each system in the source data, we:
     * 1. Start with the base system object
     * 2. Add coords from pixels source (if not already present)
     * 3. Add grid position from grid source (if not already present)
     * 4. Add sector from reverse lookup (if not already present)
     * 
     * This allows systems to have inline data that overrides the separate
     * lookup tables, providing flexibility in dataset structure.
     */
    var normalizedSystems = {};

    Object.entries(systemsSrc).forEach(function (entry) {
      var id = entry[0];
      var sys = entry[1] || {};
      var base = sys;

      // Consolidate coordinates
      var coords = base.coords;
      if (!coords && pixelsSrc && pixelsSrc[id]) {
        coords = pixelsSrc[id];
      }

      // Consolidate grid position
      var grid = base.grid;
      if (!grid && gridSrc && gridSrc[id]) {
        grid = gridSrc[id];
      }

      // Consolidate sector assignment
      var sector = base.sector;
      if (!sector && sectorBySystem[id]) {
        sector = sectorBySystem[id];
      }

      // Create normalized system object with all consolidated data
      normalizedSystems[id] = Object.assign({}, base, {
        coords: coords,
        grid: grid,
        sector: sector
      });
    });

    /**
     * Return new dataset with normalized systems
     * 
     * We preserve all other properties from the raw dataset (routes, metadata, etc.)
     * and only replace the systems object with our normalized version.
     */
    return Object.assign({}, raw, {
      systems: normalizedSystems
    });
  }

  /**
   * Export the normalize function on the DM4.dataset namespace
   * 
   * This makes the normalizer available as:
   *   DM4.dataset.normalize(rawDataset)
   * 
   * Usage example:
   *   var rawData = loadDatasetFromFile();
   *   var normalized = DM4.dataset.normalize(rawData);
   *   // Now normalized.systems contains consolidated data for each system
   */
  if (!DM4.dataset) {
    DM4.dataset = {};
  }
  DM4.dataset.normalize = normalizeDataset;
})();
