'use strict';

var _ = require('../lodash');
var cache = new _.memoize.Cache;

module.exports = {

  /**
   * Logs `value` if it hasn't been logged before.
   *
   * @private
   * @param {*} value The value to log.
   */
  log: function log(value) {
    if (!cache.has(value)) {
      cache.set(value, true);
      console.log(value);
    }
  }

};
