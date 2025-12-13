;(function () {
  "use strict";

  if (!window.DM4) {
    window.DM4 = {};
  }
  var DM4 = window.DM4;

  /**
   * DM4 Logger Utility
   * 
   * Centralized logging and error handling for the Dreadmarch Campaign Manager.
   * Provides logging levels and graceful error handling with fallback functions.
   */

  var DM4_DEBUG = !!(DM4 && DM4.config && DM4.config.debug);

  var Logger = {
    /**
     * Log informational message
     */
    info: function (message, data) {
      if (DM4_DEBUG) {
        console.log("[DREADMARCH INFO] " + message, data || "");
      }
    },

    /**
     * Log warning message
     */
    warn: function (message, data) {
      if (DM4_DEBUG) {
        console.warn("[DREADMARCH WARN] " + message, data || "");
      }
    },

    /**
     * Log error message
     */
    error: function (message, data) {
      console.error("[DREADMARCH ERROR] " + message, data || "");
    },

    /**
     * Log critical error with fallback function
     * @param {string} message - Error message
     * @param {Error} error - Error object
     * @param {Function} fallback - Function that returns safe default value
     * @returns {*} Result of fallback function
     */
    critical: function (message, error, fallback) {
      console.error("[DREADMARCH CRITICAL] " + message, error);
      if (typeof fallback === "function") {
        try {
          return fallback();
        } catch (fallbackError) {
          console.error("[DREADMARCH CRITICAL] Fallback failed:", fallbackError);
          return null;
        }
      }
      return null;
    },

    /**
     * Validate a condition and log if invalid
     * @param {boolean} condition - Condition to validate
     * @param {string} message - Message to log if invalid
     * @returns {boolean} The condition result
     */
    validate: function (condition, message) {
      if (!condition) {
        this.warn("Validation failed: " + message);
      }
      return condition;
    }
  };

  DM4.Logger = Logger;
})();
