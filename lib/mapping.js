'use strict';

var util = require('./util'),
    Hash = util.Hash;

/*----------------------------------------------------------------------------*/

/** Used to track iteration methods. */
exports.iteration = new Hash({
  'forEach': { 'mappable': false },
  'forEachRight': { 'mappable': false },
  'forIn': { 'mappable': false },
  'forInRight': { 'mappable': false },
  'forOwn': { 'mappable': false },
  'forOwnRight': { 'mappable': false },
  'times': { 'mappable': true },

  // Method aliases.
  'each': { 'mappable': false },
  'eachRight': { 'mappable': false }
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
