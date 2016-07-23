'use strict';

var _ = require('../lodash');

var ANSI_RESET = '\u001b[0m',
    USE_COLORS = typeof document == 'undefined';

var objectProto = Object.prototype;

/*----------------------------------------------------------------------------*/

/**
 * A specialized version of `_.cloneDeep` which only clones arrays and plain
 * objects assigning all other values by reference.
 *
 * @static
 * @memberOf util
 * @param {*} value The value to clone.
 * @returns {*} The cloned value.
 */
var cloneDeep = _.partial(_.cloneDeepWith, _, function(value) {
  if (isPrototype(value) || !(_.isArray(value) || _.isPlainObject(value))) {
    return value;
  }
});

/**
 * Creates a hash object. If a `properties` object is provided, its own
 * enumerable properties are assigned to the created object.
 *
 * @static
 * @memberOf util
 * @param {Object} [properties] The properties to assign to the object.
 * @returns {Object} Returns the new hash object.
 */
function Hash(properties) {
  return _.transform(properties, function(result, value, key) {
    result[key] = (_.isPlainObject(value) && !(value instanceof Hash))
      ? new Hash(value)
      : value;
  }, this);
}

Hash.prototype = Object.create(null);

/**
 * Creates a string representation of `value`.
 *
 * @static
 * @memberOf util
 * @param {*} value The value to inspect.
 * @returns {string} The string representation.
 */
var inspect = _.partial(require('util').inspect, _, {
  'colors': USE_COLORS
});

/**
 * Checks if `value` is comparable.
 *
 * **Note**: Functions, DOM nodes, and objects created by constructors other
 * than `Object` are not comparable.
 *
 * @static
 * @memberOf util
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a comparable, else `false`.
 */
function isComparable(value) {
  return (
    value == null         || !_.isObject(value) || _.isArguments(value)   ||
    _.isArray(value)      || _.isBoolean(value) || _.isDate(value)        ||
    _.isError(value)      || _.isNumber(value)  || _.isPlainObject(value) ||
    _.isRegExp(value)     || _.isString(value)  || _.isSymbol(value)      ||
    _.isTypedArray(value)
  );
}

/**
 * A specialized version of `_.isEqual` which returns `true` for uncomparable values.
 *
 * @static
 * @memberOf util
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 */
var isEqual = _.partial(_.isEqualWith, _, _, function(value, other) {
  if (!isComparable(value) && !isComparable(other)) {
    return true;
  }
});

/**
 * Checks if `value` is likely a prototype object.
 *
 * @static
 * @memberOf util
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
 * @static
 * @memberOf util
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

/*----------------------------------------------------------------------------*/

module.exports = {
  'cloneDeep': cloneDeep,
  'Hash': Hash,
  'inspect': inspect,
  'isComparable': isComparable,
  'isEqual': isEqual,
  'isPrototype': isPrototype,
  'truncate': truncate
};
