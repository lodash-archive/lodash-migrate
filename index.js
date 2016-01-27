var _ = require('./lodash'),
    old = require('lodash');

var cache = {},
    inspect = _.partial(require('util').inspect, _, { 'colors': typeof document == 'undefined' }),
    truncate = _.partial(_.truncate, _, 80);

/*----------------------------------------------------------------------------*/

/** Used to map old method names to their new names. */
var renameMap = {
  'callback': 'iteratee',
  'createCallback': 'iteratee'
};

/**
 * A specialized version of `_.cloneDeep` which only clones arrays and plain
 * objects assigning all other values by reference.
 *
 * @private
 * @param {*} value The value to clone.
 * @returns {*} The cloned value.
 */
var cloneDeep = _.partial(_.cloneDeepWith, _, function(value) {
  // Only clone primitives, arrays, and plain objects.
  return (_.isObject(value) && !_.isArray(value) && !_.isPlainObject(value))
    ? value
    : undefined;
});

/**
 * Checks if `value` is comparable.
 *
 * **Note**: Values such as functions, DOM nodes, and objects created by
 * constructors other than `Object` are not comparable.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a comparable, else `false`.
 */
var isComparable = function(value) {
  return (
    value == null     || !_.isObject(value) || _.isArguments(value)   ||
    _.isArray(value)  || _.isBoolean(value) || _.isDate(value)        ||
    _.isError(value)  || _.isNumber(value)  || _.isPlainObject(value) ||
    _.isRegExp(value) || _.isString(value)  || _.isTypedArray(value)
  );
};

/**
 * Used with `_.isEqualWith` to customize its value comparisons with `isComparable`.
 *
 * @private
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean|undefined} Returns `undefined` if value comparisons should
 *  be handled by `_.isEqual`, else `true` to indicate equivalent values.
 */
var customizer = function(value, other) {
  return _.some([value, other], isComparable) ? undefined : true;
};

/*----------------------------------------------------------------------------*/

// Wrap static methods.
_.each(_.without(_.functionsIn(old), 'mixin'), function(name) {
  var newFunc = _[renameMap[name] || name];
  old[name] = _.wrap(old[name], function(oldFunc) {
    var args = _.slice(arguments, 1),
        oldResult = oldFunc.apply(old, args),
        newResult = _.attempt(function() { return newFunc.apply(_, cloneDeep(args)); });

    if (!isComparable(oldResult)
        ? isComparable(newResult)
        : !_.isEqualWith(oldResult, newResult, customizer)
        ) {
      args = inspect(args).match(/^\[\s*([\s\S]*?)\s*\]$/)[1];
      args = args.replace(/\n */g, ' ');

      var message = [
        'lodash-migrate: _.' + name + '(' + truncate(args) + ')',
        '  v' + old.VERSION + ' => ' + truncate(inspect(oldResult)),
        '  v' + _.VERSION   + ' => ' + truncate(inspect(newResult)),
        ''
      ].join('\n');

      // Only log a specific message once.
      if (!_.has(cache, message)) {
        cache[message] = true;
        console.log(message);
      }
    }
    return oldResult;
  });
});

// Wrap `_.prototype` methods that return unwrapped values when chaining.
old.mixin(_.transform([
  'add', 'attempt', 'camelCase', 'capitalize', 'ceil', 'clone', 'cloneDeep',
  'deburr', 'endsWith', 'escape', 'escapeRegExp', 'every', 'find', 'findIndex',
  'findKey', 'findLast', 'findLastIndex', 'findLastKey', 'findWhere', 'first',
  'floor', 'get', 'gt', 'gte', 'has', 'identity', 'includes', 'indexOf',
  'inRange', 'isArguments', 'isArray', 'isBoolean', 'isDate', 'isElement',
  'isEmpty', 'isEqual', 'isError', 'isFinite', 'isFunction', 'isMatch',
  'isNative', 'isNaN', 'isNull', 'isNumber', 'isObject', 'isPlainObject',
  'isRegExp', 'isString', 'isUndefined', 'isTypedArray', 'join', 'kebabCase',
  'last', 'lastIndexOf', 'lt', 'lte', 'max', 'min', 'noConflict', 'noop',
  'now', 'pad', 'padLeft', 'padRight', 'parseInt', 'pop', 'random', 'reduce',
  'reduceRight', 'repeat', 'result', 'round', 'runInContext', 'shift', 'size',
  'snakeCase', 'some', 'sortedIndex', 'sortedLastIndex', 'startCase',
  'startsWith', 'sum', 'template', 'trim', 'trimLeft', 'trimRight', 'trunc',
  'unescape', 'uniqueId', 'value', 'words',

  // Method aliases.
  'all', 'any', 'contains', 'eq', 'detect', 'foldl', 'foldr', 'head', 'include',
  'inject'
], function(source, name) {
  source[name] = old[name];
}, {}), false);

// Wrap `_#sample` which is capable of returning wrapped and unwrapped values.
(function() {
  var sample = old.sample;
  old.prototype.sample = function(n) {
    var chainAll = this.__chain__,
        result = sample(this.__wrapped__, n);

    if (!chainAll && n == null) {
      return result;
    }
    result = old(result);
    result.__chain__ = chainAll;
    return result;
  };
}());

module.exports = old;
