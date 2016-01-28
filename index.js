var _ = require('./lodash'),
    old = require('lodash');

var ANSI_RESET = '\u001b[0m',
    USE_COLORS = typeof document == 'undefined';

var cache = new _.memoize.Cache,
    objectProto = Object.prototype,
    inspect = _.partial(require('util').inspect, _, { 'colors': USE_COLORS });

var listing = {
  'ignored': [
    'mixin',
    'now'
  ],
  'unwrapped': [
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
  ]
};

var messageTemplate = _.template([
  'lodash-migrate: _.<%= name %>(<%= args %>)',
  '  v<%= oldData.version %> => <%= oldData.result %>',
  '  v<%= newData.version %> => <%= newData.result %>',
  ''
].join('\n'));

var renameMap = {
  'callback': 'iteratee',
  'createCallback': 'iteratee'
};

/*----------------------------------------------------------------------------*/

/**
 * A specialized version of `_.cloneDeep` which only clones arrays and plain
 * objects assigning all other values by reference.
 *
 * @private
 * @param {*} value The value to clone.
 * @returns {*} The cloned value.
 */
var cloneDeep = _.partial(_.cloneDeepWith, _, function(value) {
  if (isPrototype(value) || !(_.isArray(value) || _.isPlainObject(value))) {
    return value;
  }
});

/**
 * Used with `_.isEqualWith` to customize its value comparisons with `isComparable`.
 *
 * @private
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean|undefined} Returns `undefined` if value comparisons should
 *  be handled by `_.isEqual`, else `true` to indicate equivalent values.
 */
function customizer(value, other) {
  if (!_.some([value, other], isComparable)) {
    return true;
  }
}

/**
 * Checks if `value` is comparable.
 *
 * **Note**: Functions, DOM nodes, and objects created by constructors other
 * than `Object` are not comparable.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a comparable, else `false`.
 */
function isComparable(value) {
  return (
    value == null     || !_.isObject(value) || _.isArguments(value)   ||
    _.isArray(value)  || _.isBoolean(value) || _.isDate(value)        ||
    _.isError(value)  || _.isNumber(value)  || _.isPlainObject(value) ||
    _.isRegExp(value) || _.isString(value)  || _.isTypedArray(value)
  );
}

/**
 * Checks if `value` is likely a prototype object.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
 */
function isPrototype(value) {
  var Ctor = value && value.constructor,
      proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto;

  return value === proto;
}

/**
 * Truncates `string` while ensuring ansi colors are reset.
 *
 * @private
 * @param {string} string The string to truncate.
 * @returns {string} Returns the truncated string.
 */
function truncate(string) {
  var result = _.truncate(string, { 'length': 80 });
  if (USE_COLORS && result.length != string.length) {
    result += ANSI_RESET;
  }
  return result;
}

/**
 * Creates a function that compares the results of method `name` on `oldDash`
 * and `newDash` and logs a warning for mismatched results.
 *
 * @private
 * @param {Function} oldDash The old lodash function.
 * @param {Function} newDash The new lodash function.
 * @param {string} name The name of the lodash method to wrap.
 * @returns {Function} Returns the new wrapped method.
 */
function wrap(oldDash, newDash, name) {
  var newFunc = newDash[renameMap[name] || name];
  return _.wrap(oldDash[name], _.rest(function(oldFunc, args) {
    var that = this,
        oldResult = oldFunc.apply(that, args),
        newResult = _.attempt(function() { return newFunc.apply(that, cloneDeep(args)); });

    if (isComparable(oldResult)
          ? _.isEqualWith(oldResult, newResult, customizer)
          : !isComparable(newResult)
        ) {
      return oldResult;
    }
    // Extract inspected arguments.
    args = inspect(args).match(/^\[\s*([\s\S]*?)\s*\]$/)[1];
    // Remove newlines.
    args = args.replace(/\n */g, ' ');

    var message = messageTemplate({
      'name': name,
      'args': truncate(args),
      'oldData': {
        'result': truncate(inspect(oldResult)),
        'version': oldDash.VERSION
      },
      'newData': {
        'result': truncate(inspect(newResult)),
        'version': newDash.VERSION
      }
    });

    // Only log a specific message once.
    if (!cache.has(message)) {
      cache.set(message, true);
      console.log(message);
    }
    return oldResult;
  }));
}

/*----------------------------------------------------------------------------*/

// Wrap static methods.
_.each(_.difference(_.functionsIn(old), listing.ignored), function(name) {
  old[name] = wrap(old, _, name);
});

// Wrap `_.prototype` methods that return unwrapped values.
old.mixin(_.transform(listing.unwrapped, function(source, name) {
  source[name] = old[name];
}, {}), false);

// Wrap `_#sample` which can return wrapped and unwrapped values.
old.prototype.sample = _.wrap(old.sample, function(sample, n) {
  var chainAll = this.__chain__,
      result = sample(this.__wrapped__, n);

  if (chainAll || n != null) {
    result = old(result);
    result.__chain__ = chainAll;
  }
  return result;
});

module.exports = old;
