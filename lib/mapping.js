'use strict';

/** Used to track iteration functions. */
exports.iteration = {
  'forEach': true,
  'forEachRight': true,
  'forIn': true,
  'forInRight': true,
  'forOwn': true,
  'forOwnRight': true,

  // Method aliases.
  'each': true,
  'eachRight': true
};

/** Used to map old method names to new ones. */
exports.rename = {
  'callback': 'iteratee',
  'createCallback': 'iteratee'
};
