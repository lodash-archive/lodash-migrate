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
  },

  migrateTemplate: _.template([
    'lodash-migrate: _.<%= name %>(<%= args %>)',
    '  v<%= oldData.version %> => <%= oldData.result %>',
    '  v<%= newData.version %> => <%= newData.result %>',
    ''
  ].join('\n')),

  renameTemplate: _.template([
    'lodash-migrate: Method renamed',
    '  v<%= oldData.version %> => _.<%= oldData.name %>',
    '  v<%= newData.version %> => _.<%= newData.name %>',
    ''
  ].join('\n'))

};
