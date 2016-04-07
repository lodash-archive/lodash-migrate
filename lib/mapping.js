'use strict';

var util = require('./util'),
    Hash = util.Hash;

/*----------------------------------------------------------------------------*/

/** Used to track iteration functions. */
exports.iteration = new Hash({
  'forEach': true,
  'forEachRight': true,
  'forIn': true,
  'forInRight': true,
  'forOwn': true,
  'forOwnRight': true,
  'times': true,

  // Method aliases.
  'each': true,
  'eachRight': true
});

/** Used to map real names to their aliases. */
exports.realToAlias = new Hash({
  'value': ['run', 'toJSON', 'valueOf']
});

/** Used to map old method names to new ones. */
exports.rename = new Hash({
  'all': 'every',
  'any': 'some',
  'backflow': 'flowRight',
  'callback': 'iteratee',
  'collect': 'map',
  'compose': 'flowRight',
  'contains': 'includes',
  'createCallback': 'iteratee',
  'detect': 'find',
  'foldl': 'reduce',
  'foldr': 'reduceRight',
  'include': 'includes',
  'indexBy': 'keyBy',
  'inject': 'reduce',
  'methods': 'functions',
  'modArgs': 'overArgs',
  'object': 'fromPairs',
  'padLeft': 'padStart',
  'padRight': 'padEnd',
  'pairs': 'toPairs',
  'restParam': 'rest',
  'run': 'value',
  'select': 'filter',
  'sortByOrder': 'orderBy',
  'trimLeft': 'trimStart',
  'trimRight': 'trimEnd',
  'trunc': 'truncate',
  'unique': 'uniq'
});
