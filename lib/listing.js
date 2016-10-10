'use strict';

var util = require('./util'),
    Hash = util.Hash;

/*----------------------------------------------------------------------------*/

/** List of methods that should not emit a log. */
exports.ignored = new Hash({
  'rename': [
    'callback',
    'createCallback'
  ],
  'result': [
    'defer',
    'delay',
    'mixin',
    'now',
    'random',
    'runInContext',
    'sample',
    'shuffle',
    'uniqueId'
  ]
});

/** List of sequence methods without static counterparts. */
exports.seqFuncs = [
  'commit',
  'plant',
  'pop',
  'run',
  'shift',
  'toJSON',
  'value',
  'valueOf'
];

/** List of methods that produce unwrapped results when chaining. */
exports.unwrapped = [
  'add', 'attempt', 'camelCase', 'capitalize', 'ceil', 'clone', 'cloneDeep',
  'deburr', 'endsWith', 'escape', 'escapeRegExp', 'every', 'find', 'findIndex',
  'findKey', 'findLast', 'findLastIndex', 'findLastKey', 'findWhere', 'first',
  'floor', 'get', 'gt', 'gte', 'has', 'identity', 'includes', 'indexOf', 'inRange',
  'isArguments', 'isArray', 'isBoolean', 'isDate', 'isElement', 'isEmpty', 'isEqual',
  'isError', 'isFinite', 'isFunction', 'isMatch', 'isNative', 'isNaN', 'isNull',
  'isNumber', 'isObject', 'isPlainObject', 'isRegExp', 'isString', 'isUndefined',
  'isTypedArray', 'kebabCase', 'last', 'lastIndexOf', 'lt', 'lte', 'max', 'min',
  'noConflict', 'noop', 'now', 'pad', 'padLeft', 'padRight', 'parseInt', 'random',
  'reduce', 'reduceRight', 'repeat','result', 'round', 'runInContext', 'size',
  'snakeCase', 'some', 'sortedIndex', 'sortedLastIndex', 'startCase', 'startsWith',
  'sum', 'template', 'trim', 'trimLeft', 'trimRight', 'trunc',
  'unescape', 'uniqueId', 'words',

  // Method aliases.
  'all', 'any', 'contains', 'eq', 'detect', 'foldl', 'foldr', 'head', 'include',
  'inject'
];
