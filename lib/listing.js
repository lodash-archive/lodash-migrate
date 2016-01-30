'use strict';

/** List of methods to ignore when wrapping. */
exports.ignored = [
  'mixin',
  'now'
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
  'isTypedArray', 'join', 'kebabCase', 'last', 'lastIndexOf', 'lt', 'lte', 'max',
  'min', 'noConflict', 'noop', 'now', 'pad', 'padLeft', 'padRight', 'parseInt',
  'pop', 'random', 'reduce', 'reduceRight', 'repeat','result', 'round', 'runInContext',
  'shift', 'size', 'snakeCase', 'some', 'sortedIndex', 'sortedLastIndex', 'startCase',
  'startsWith', 'sum', 'template', 'trim', 'trimLeft', 'trimRight', 'trunc',
  'unescape', 'uniqueId', 'value', 'words',

  // Method aliases.
  'all', 'any', 'contains', 'eq', 'detect', 'foldl', 'foldr', 'head', 'include',
  'inject'
];
